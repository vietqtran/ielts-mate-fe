// hooks/useAttemptStomp.ts
'use client';

import { Client, IMessage } from '@stomp/stompjs';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import SockJS from 'sockjs-client';

type Options = {
  /** SockJS endpoint, ví dụ: https://tootsstore.online/api/v1/personal/ws */
  sockUrl: string;
  /** STOMP queue server gửi phản hồi riêng cho user */
  userQueueDest?: string; // default: '/user/queue/attempt.response'
  /** App destinations (server-side @MessageMapping) */
  appDest?: {
    register: string; // default: '/app/attempt.register'
    unregister: string; // default: '/app/attempt.unregister'
    ping: string; // default: '/app/attempt.ping'
    check?: string; // optional: '/app/attempt.check'
  };
  /** Ping interval ms (default 30000) */
  pingIntervalMs?: number;
  /** Auto start heartbeat sau khi REGISTERED (default true) */
  autoStartHeartbeat?: boolean;
  /** Bật log debug */
  debug?: boolean;
};

export type AttemptStompState = {
  connected: boolean;
  registering: boolean;
  registered: boolean;
  lastPongAt?: number;
  lastMessage?: any;
  error?: string;
};

export function useLockAttempt({
  sockUrl,
  userQueueDest = '/user/queue/attempt.response',
  appDest = {
    register: '/app/attempt.register',
    unregister: '/app/attempt.unregister',
    ping: '/app/attempt.ping',
    check: '/app/attempt.check',
  },
  pingIntervalMs = 30000,
  autoStartHeartbeat = true,
  debug = false,
}: Options) {
  const sessionId = useMemo(() => {
    const k = 'attempt-session-id';
    const v = sessionStorage.getItem(k) || Math.random().toString(36).slice(2, 11);
    sessionStorage.setItem(k, v);
    return v;
  }, []);

  const clientRef = useRef<Client | null>(null);
  const pingTimerRef = useRef<number | null>(null);
  const outboxRef = useRef<Array<{ destination: string; body: any }>>([]);

  const [state, setState] = useState<AttemptStompState>({
    connected: false,
    registering: false,
    registered: false,
  });

  const log = (...a: any[]) => debug && console.log('[attempt-stomp]', ...a);
  const cleanupPing = () => {
    if (pingTimerRef.current) {
      window.clearInterval(pingTimerRef.current);
      pingTimerRef.current = null;
    }
  };

  const connect = useCallback(() => {
    if (clientRef.current?.active) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(sockUrl, null, { withCredentials: true } as any),
      reconnectDelay: 3000,
      debug: debug ? (s) => console.log('[stomp]', s) : undefined,
      onConnect: () => {
        setState((s) => ({ ...s, connected: true, error: undefined }));
        client.subscribe(userQueueDest, (msg: IMessage) => {
          try {
            const payload = JSON.parse(msg.body);
            log('←', payload);
            setState((s) => ({ ...s, lastMessage: payload }));
            switch (payload.messageType) {
              case 'SESSION_VALIDATED':
                setState((s) => ({
                  ...s,
                  registering: false,
                  registered: true,
                }));
                if (autoStartHeartbeat && !pingTimerRef.current && payload.attemptId) {
                  startHeartbeat(payload.attemptId);
                }
                break;
              case 'PONG':
                setState((s) => ({ ...s, lastPongAt: Date.now() }));
                break;
              default:
                break;
            }
          } catch {
            setState((s) => ({
              ...s,
              error: 'Bad JSON',
              lastMessage: msg.body,
            }));
          }
        });
        // Flush any queued messages that were sent before the connection was established
        try {
          const c = clientRef.current;
          if (c?.connected && outboxRef.current.length) {
            log('flushing outbox', outboxRef.current.length);
            const queued = [...outboxRef.current];
            outboxRef.current = [];
            for (const m of queued) {
              c.publish({
                destination: m.destination,
                body: typeof m.body === 'string' ? m.body : JSON.stringify(m.body),
                headers: { 'content-type': 'application/json' },
              });
            }
          }
        } catch (e) {
          console.error('[attempt-stomp] flush outbox error', e);
        }
        log('connected');
      },
      onStompError: (f) => {
        setState((s) => ({
          ...s,
          error: f.headers['message'] || 'STOMP error',
        }));
      },
      onWebSocketClose: () => {
        log('socket closed');
        cleanupPing();
        setState({ connected: false, registering: false, registered: false });
      },
    });

    clientRef.current = client;
    client.activate();
  }, [sockUrl, userQueueDest, autoStartHeartbeat, debug]);

  const disconnect = useCallback(async () => {
    cleanupPing();
    if (clientRef.current?.active) await clientRef.current.deactivate();
    clientRef.current = null;
    setState({ connected: false, registering: false, registered: false });
  }, []);

  const send = useCallback((destination: string, body: any) => {
    const c = clientRef.current;
    const json = JSON.stringify(body);
    log('→', destination, json);

    // If the client is not connected yet, queue the message for later flush
    if (!c || !c.connected) {
      outboxRef.current.push({ destination, body: json });
      return;
    }

    // Connected: publish immediately
    c.publish({
      destination,
      body: json,
      headers: { 'content-type': 'application/json' },
    });
  }, []);

  const register = useCallback(
    (attemptId: string, userId?: string) => {
      if (!clientRef.current?.active) connect();
      setState((s) => ({ ...s, registering: true }));
      send(appDest.register, {
        messageType: 'REGISTER_ATTEMPT',
        attemptId,
        sessionId,
        userId,
        timestamp: Date.now(),
      });
      log('registering...', attemptId, userId);
    },
    [connect, send, appDest.register, sessionId]
  );

  const unregister = useCallback(
    (attemptId: string) => {
      send(appDest.unregister, {
        messageType: 'UNREGISTER_ATTEMPT',
        attemptId,
        sessionId,
        timestamp: Date.now(),
      });
      setState((s) => ({ ...s, registered: false }));
    },
    [send, appDest.unregister, sessionId]
  );

  const ping = useCallback(
    (attemptId: string) => {
      send(appDest.ping, {
        messageType: 'PING',
        attemptId,
        sessionId,
        timestamp: Date.now(),
      });
    },
    [send, appDest.ping, sessionId]
  );

  const startHeartbeat = useCallback(
    (attemptId: string) => {
      if (!attemptId || pingTimerRef.current) return;
      ping(attemptId); // ping ngay 1 phát
      pingTimerRef.current = window.setInterval(
        () => ping(attemptId),
        pingIntervalMs
      ) as unknown as number;
      log('heartbeat started', pingIntervalMs);
    },
    [ping, pingIntervalMs]
  );

  const stopHeartbeat = useCallback(() => {
    cleanupPing();
    log('heartbeat stopped');
  }, []);

  // Cleanup khi rời trang
  useEffect(() => {
    const onUnload = () => {
      cleanupPing();
      clientRef.current?.deactivate();
    };
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, []);

  return {
    state, // { connected, registered, lastPongAt, lastMessage, error }
    sessionId, // per-tab id
    connect,
    disconnect,
    register,
    unregister,
    startHeartbeat,
    stopHeartbeat,
  };
}
