'use client';

import { useEffect, useMemo, useRef } from 'react';

import { useAppSelector } from '@/hooks';
import { toast } from 'sonner';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const SSE_PATH = 'notification/sse/stream';

const CreatorSSEListener = () => {
  const userId = useAppSelector((state) => state.auth.user?.id);

  // Memoize the user ID to ensure stability and prevent unnecessary effect runs
  const stableUserId = useMemo(() => userId, [userId]);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const backoffMsRef = useRef<number>(1000); // start at 1s
  const maxBackoffMs = 30000; // 30s cap
  const currentUserIdRef = useRef<string | null>(null);
  const isConnectingRef = useRef<boolean>(false);

  useEffect(() => {
    const cleanup = () => {
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      isConnectingRef.current = false;
    };

    const connect = () => {
      if (!stableUserId) return;
      if (!API_BASE_URL) return;

      // Prevent duplicate connections for the same user
      if (
        isConnectingRef.current ||
        (currentUserIdRef.current === stableUserId &&
          eventSourceRef.current?.readyState === EventSource.OPEN)
      ) {
        if (process.env.NODE_ENV === 'production') {
          console.log(
            'SSE: Skipping connection - already connected or connecting for user:',
            stableUserId?.slice(0, 8) + '...'
          );
        } else {
          console.log(
            'SSE: Skipping connection - already connected or connecting for user:',
            stableUserId
          );
        }
        return;
      }

      cleanup();

      isConnectingRef.current = true;
      currentUserIdRef.current = stableUserId;

      const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
      const url = `${base}/${SSE_PATH}/${encodeURIComponent(stableUserId)}`;

      if (process.env.NODE_ENV === 'production') {
        console.log('SSE: Attempting to connect for user:', stableUserId?.slice(0, 8) + '...');
      } else {
        console.log('SSE: Attempting to connect to:', url);
      }

      const es = new EventSource(url, { withCredentials: true });
      eventSourceRef.current = es;

      console.log('SSE: EventSource created, readyState:', es.readyState);

      es.addEventListener('open', () => {
        console.log('SSE connection opened');
        backoffMsRef.current = 1000; // reset backoff on successful connection
        isConnectingRef.current = false; // reset connecting state
      });

      // Handle all event types (message, notification, etc.)
      const handleSSEEvent = (event: MessageEvent) => {
        console.log('SSE event received:', event.type, event);
        try {
          const data = JSON.parse(event.data) as { status?: string; message?: string };
          console.log('SSE data parsed:', data);
          if (data?.message) {
            if (data.status === 'success') {
              toast.success(data.message);
            } else if (data.status === 'error') {
              toast.error(data.message);
            } else {
              toast.info(data.message);
            }
          }
        } catch (error) {
          console.log('SSE data parse error:', error, 'Raw data:', event.data);
          // If not JSON or unexpected format, show a generic info toast
          if (event?.data) {
            toast.info(String(event.data));
          }
        }
      };

      es.addEventListener('message', handleSSEEvent);

      es.addEventListener('notification', handleSSEEvent);
      es.addEventListener('update', handleSSEEvent);

      es.addEventListener('error', (event) => {
        if (process.env.NODE_ENV === 'production') {
          console.error(
            'SSE error - readyState:',
            es.readyState,
            'user:',
            stableUserId?.slice(0, 8) + '...'
          );
        } else {
          console.log('SSE error event:', event, 'readyState:', es.readyState);
        }
        isConnectingRef.current = false;

        es.close();
        const delay = backoffMsRef.current;
        backoffMsRef.current = Math.min(backoffMsRef.current * 2, maxBackoffMs);

        if (process.env.NODE_ENV === 'production') {
          console.log(
            `SSE: Reconnecting in ${delay}ms for user:`,
            stableUserId?.slice(0, 8) + '...'
          );
        } else {
          console.log(`SSE: Reconnecting in ${delay}ms`);
        }

        reconnectTimeoutRef.current = window.setTimeout(() => {
          connect();
        }, delay);
      });

      // Add a generic event listener to catch ALL events
      es.onmessage = (event) => {
        console.log('SSE: Raw onmessage event:', event);
        handleSSEEvent(event);
      };
    };

    if (stableUserId && currentUserIdRef.current !== stableUserId) {
      if (process.env.NODE_ENV === 'production') {
        console.log('SSE: User changed, connecting for:', stableUserId?.slice(0, 8) + '...');
      }
      connect();
    } else if (!stableUserId && currentUserIdRef.current) {
      if (process.env.NODE_ENV === 'production') {
        console.log('SSE: User logged out, cleaning up connection');
      }
      currentUserIdRef.current = null;
      cleanup();
    }

    return () => {
      cleanup();
    };
  }, [stableUserId]);

  return null;
};

export default CreatorSSEListener;
