// hooks/utils/useSegmentAudioPlay.ts
'use client';

import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { useSyncExternalStore } from 'react';

// ====== Tiny store per <audio> via WeakMap ======
type StoreState = {
  session: number;
  activeKey: string | null;
  isPlaying: boolean;
  endAt: number | null;
};
type Store = {
  getSnapshot: () => StoreState;
  subscribe: (fn: () => void) => () => void;
  set: (next: Partial<StoreState>) => void;
  reset: () => void;
};
const DEFAULT: StoreState = { session: 0, activeKey: null, isPlaying: false, endAt: null };
const AUDIO_STORES = new WeakMap<HTMLAudioElement, Store>();

function ensureStore(el: HTMLAudioElement): Store {
  let store = AUDIO_STORES.get(el);
  if (store) return store;

  let state: StoreState = { ...DEFAULT };
  const listeners = new Set<() => void>();
  store = {
    getSnapshot: () => state,
    subscribe: (fn) => (listeners.add(fn), () => listeners.delete(fn)),
    set: (next) => {
      state = { ...state, ...next };
      listeners.forEach((l) => l());
    },
    reset: () => {
      state = { ...DEFAULT, session: state.session + 1 };
      listeners.forEach((l) => l());
    },
  };
  AUDIO_STORES.set(el, store);
  return store;
}

// ====== utils ======
function parseHMS(v?: string | number | null): number {
  if (v == null) return 0;
  if (typeof v === 'number') return v;
  const parts = v.split(':').map(Number);
  if (parts.some(Number.isNaN)) return 0;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0];
}

async function waitLoadedMeta(el: HTMLAudioElement) {
  if (!Number.isNaN(el.duration) && el.readyState >= 1) return;
  await new Promise<void>((resolve) => {
    const on = () => {
      el.removeEventListener('loadedmetadata', on);
      resolve();
    };
    el.addEventListener('loadedmetadata', on, { once: true });
  });
}

async function seekTo(el: HTMLAudioElement, t: number) {
  await new Promise<void>((resolve) => {
    const on = () => {
      el.removeEventListener('seeked', on);
      resolve();
    };
    el.addEventListener('seeked', on, { once: true });
    // @ts-ignore
    el.fastSeek ? el.fastSeek(t) : (el.currentTime = t);
  });
}

// ====== main hook ======
export function useSegmentAudioPlay(audioRef: RefObject<HTMLAudioElement>, segmentKey: string) {
  // Track the current audio element and its store. Avoid depending on ref.current in deps.
  const elRef = useRef<HTMLAudioElement | null>(null);
  const [store, setStore] = useState<Store | null>(null);

  // Rebind to the correct <audio> element after commit. Reset old store to avoid stale UI.
  useEffect(() => {
    const el = audioRef.current ?? null;
    if (elRef.current !== el) {
      // reset previous session if any
      if (elRef.current && store) {
        store.reset();
      }
      elRef.current = el;
      setStore(el ? ensureStore(el) : null);
    }
    // Run after every render; cheap and ensures we pick up ref changes that don't trigger rerenders
  });

  const subscribe = useCallback(
    (fn: () => void) => (store ? store.subscribe(fn) : () => {}),
    [store]
  );
  const getSnapshot = useCallback(() => (store ? store.getSnapshot() : DEFAULT), [store]);
  const state = useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT);

  const isAnyPlaying = state.isPlaying;
  const isSegmentPlaying = isAnyPlaying && state.activeKey === segmentKey;

  // Attach timeupdate/pause listeners once per audio
  useEffect(() => {
    const el = elRef.current;
    if (!el || !store) return;

    const onTimeUpdate = () => {
      const s = store.getSnapshot();
      if (s.endAt == null) return;
      if (el.currentTime >= s.endAt - 0.06) {
        el.pause(); // will trigger onPause below
      }
    };
    const onPause = () => {
      // Only reset if we truly were in a segment session
      const s = store.getSnapshot();
      if (s.isPlaying) store.set({ isPlaying: false, activeKey: null, endAt: null });
    };
    el.addEventListener('timeupdate', onTimeUpdate);
    el.addEventListener('pause', onPause);
    return () => {
      el.removeEventListener('timeupdate', onTimeUpdate);
      el.removeEventListener('pause', onPause);
    };
  }, [store]);

  const playSegment = useCallback(
    async (start: string | number, end: string | number) => {
      const el = audioRef.current;
      if (!el) return;
      // Lazily ensure store is bound to the current element so first click works after tab switch
      let s = store;
      if (!s || elRef.current !== el) {
        if (elRef.current && s) s.reset();
        elRef.current = el;
        s = ensureStore(el);
        setStore(s);
      }
      const startAt = parseHMS(start);
      const endAt = Math.max(startAt, parseHMS(end));

      // New session: stop current and take over
      el.pause();
      s.set({
        session: s.getSnapshot().session + 1,
        activeKey: segmentKey,
        isPlaying: false,
        endAt: null,
      });

      await waitLoadedMeta(el);
      await seekTo(el, startAt);
      s.set({ endAt });

      try {
        await el.play();
        s.set({ isPlaying: true });
      } catch (e) {
        // keep state consistent
        s.reset();
      }
    },
    [audioRef, segmentKey, store]
  );

  const stopSegment = useCallback(() => {
    const el = elRef.current;
    if (!el || !store) return;
    el.pause();
    store.reset();
  }, [store]);

  return {
    playSegment,
    stopSegment,
    isSegmentPlaying,
    isAnyPlaying,
    activeKey: state.activeKey,
  };
}
