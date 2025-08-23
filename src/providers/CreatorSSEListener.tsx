'use client';

import { useEffect, useRef } from 'react';

import { useAppSelector } from '@/hooks';
import { toast } from 'sonner';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const SSE_PATH = 'notification/sse/stream';

const CreatorSSEListener = () => {
  const { user } = useAppSelector((state) => state.auth);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const backoffMsRef = useRef<number>(1000); // start at 1s
  const maxBackoffMs = 30000; // 30s cap

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
    };

    const connect = () => {
      if (!user?.id) return;
      if (!API_BASE_URL) return;

      // Always cleanup any previous connection before opening a new one
      cleanup();

      const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
      const url = `${base}/${SSE_PATH}/${encodeURIComponent(user.id)}`;
      const es = new EventSource(url, { withCredentials: true });
      eventSourceRef.current = es;

      es.addEventListener('open', () => {
        console.log('SSE connection opened');
        backoffMsRef.current = 1000; // reset backoff on successful connection
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

      // Listen for default 'message' events
      es.addEventListener('message', handleSSEEvent);

      // Listen for custom event types that servers might send
      es.addEventListener('notification', handleSSEEvent);
      es.addEventListener('update', handleSSEEvent);

      es.addEventListener('error', () => {
        // Close and attempt reconnect with exponential backoff
        es.close();
        const delay = backoffMsRef.current;
        backoffMsRef.current = Math.min(backoffMsRef.current * 2, maxBackoffMs);
        reconnectTimeoutRef.current = window.setTimeout(() => {
          connect();
        }, delay);
      });
    };

    if (user?.id) {
      connect();
    }

    return () => {
      cleanup();
    };
  }, [user?.id]);

  return null;
};

export default CreatorSSEListener;
