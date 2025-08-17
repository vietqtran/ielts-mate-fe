import { Payload, sendOne } from '@/utils/beacon';
// hooks/useUnloadSubmit.ts
import { useCallback, useEffect, useRef } from 'react';

type Options = {
  enabled?: boolean; // tắt khi đã nộp xong
  minIntervalMs?: number; // throttle
  endpoint: string; // "/attempts/submit/:id" hoặc absolute
  getPayload: () => Payload;
  closeOnly?: boolean; // chỉ bắn khi unload (mặc định true)
};

export function useUnloadSubmit(opts: Options) {
  const {
    enabled = true,
    minIntervalMs = 3000,
    endpoint,
    getPayload,
    closeOnly = true, // không dùng visibilitychange
  } = opts;

  const lastSentRef = useRef(0);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const flush = useCallback(() => {
    if (typeof window === 'undefined') return false;
    if (!enabledRef.current) return false;
    const now = Date.now();
    if (now - lastSentRef.current < minIntervalMs) return false;
    lastSentRef.current = now;
    const payload = getPayload();
    void sendOne(endpoint, payload);
    return true;
  }, [endpoint, getPayload, minIntervalMs]);

  useEffect(() => {
    if (!enabled) return;

    const onPageHide = (e: PageTransitionEvent) => {
      // Bỏ qua khi vào bfcache (trang chưa bị hủy thật)
      if (e.persisted) return;
      flush();
    };
    const onBeforeUnload = () => {
      flush();
      // không set returnValue để tránh warning/UX xấu
    };

    window.addEventListener('pagehide', onPageHide);
    window.addEventListener('beforeunload', onBeforeUnload);

    // closeOnly=true => KHÔNG add visibilitychange
    let offVis = () => {};
    if (!closeOnly) {
      const onVisibility = () => {
        if (document.visibilityState === 'hidden') flush();
      };
      document.addEventListener('visibilitychange', onVisibility);
      offVis = () => document.removeEventListener('visibilitychange', onVisibility);
    }

    return () => {
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('beforeunload', onBeforeUnload);
      offVis();
    };
  }, [enabled, flush, closeOnly]);

  return { flush };
}
