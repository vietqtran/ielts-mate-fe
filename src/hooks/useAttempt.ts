'use client';

import instance from '@/lib/axios';
import { AttemptData } from '@/types/attemp.types';
import { BaseResponse } from '@/types/reading.types';
import { useRef, useState } from 'react';

const useAttempt = () => {
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Record<string, Error | null>>({});
  const abortControllerRef = useRef<AbortController | null>(null);

  const setLoadingState = (key: string, value: boolean) => {
    setIsLoading((prev) => ({ ...prev, [key]: value }));
  };

  const setErrorState = (key: string, value: Error | null) => {
    setError((prev) => ({ ...prev, [key]: value }));
  };

  // Get active passages for public
  const startNewAttempt = async ({ passageId }: { passageId: string }) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const currentController = abortControllerRef.current;

    setLoadingState('startNewAttempt', true);
    setErrorState('startNewAttempt', null);

    try {
      const { data } = await instance.post(`reading/attempts/passages/${passageId}`, {
        signal: currentController.signal,
      });
      return data as BaseResponse<AttemptData>;
    } catch (error) {
      if (abortControllerRef.current === currentController) {
        if ((error as any).name !== 'AbortError') {
          setErrorState('startNewAttempt', error as Error);
          throw error;
        }
      }
    } finally {
      if (abortControllerRef.current === currentController) {
        setLoadingState('startNewAttempt', false);
      }
      abortControllerRef.current = null;
    }
  };

  return {
    startNewAttempt,
  };
};

export default useAttempt;
