'use client';

import instance from '@/lib/axios';
import {
  ListeningAttemptHistoryRequest,
  ListeningAttemptHistoryResponse,
} from '@/types/attempt.types';
import {
  LoadListeningAttemptResponse,
  LoadListeningAttemptResultResponse,
  SaveListeningAttemptProgressRequest,
  StartListeningAttemptResponse,
  SubmitListeningAttemptRequest,
  SubmitListeningAttemptResponse,
} from '@/types/listening/listening-attempt.types';
import { BaseResponse } from '@/types/reading/reading.types';
import { useRef, useState } from 'react';

const useListeningAttempt = () => {
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
  const startNewAttempt = async ({ taskId }: { taskId: string }) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const currentController = abortControllerRef.current;

    setLoadingState('startNewAttempt', true);
    setErrorState('startNewAttempt', null);

    try {
      const { data } = await instance.post(
        `listening/attempts/${taskId}`,
        {},
        { signal: currentController.signal, notify: false }
      );
      return data as BaseResponse<StartListeningAttemptResponse>;
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

  const submitAttempt = async ({
    attempt_id,
    payload,
  }: {
    attempt_id: string;
    payload: SubmitListeningAttemptRequest;
  }) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const currentController = abortControllerRef.current;

    setLoadingState('submitAttempt', true);
    setErrorState('submitAttempt', null);

    try {
      const { data } = await instance.put(`listening/attempts/submit/${attempt_id}`, payload);
      return data as BaseResponse<SubmitListeningAttemptResponse>;
    } catch (error) {
      if (abortControllerRef.current === currentController) {
        if ((error as any).name !== 'AbortError') {
          setErrorState('submitAttempt', error as Error);
          throw error;
        }
      }
    } finally {
      if (abortControllerRef.current === currentController) {
        setLoadingState('submitAttempt', false);
      }
      abortControllerRef.current = null;
    }
  };

  const saveAttemptProgress = async ({
    attempt_id,
    payload,
  }: {
    attempt_id: string;
    payload: SaveListeningAttemptProgressRequest;
  }) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const currentController = abortControllerRef.current;

    setLoadingState('saveAttemptProgress', true);
    setErrorState('saveAttemptProgress', null);

    try {
      const { data } = await instance.put(`listening/attempts/save/${attempt_id}`, payload, {
        notifyError: false,
      });
      return data as BaseResponse<any>;
    } catch (error) {
      if (abortControllerRef.current === currentController) {
        if ((error as any).name !== 'AbortError') {
          setErrorState('saveAttemptProgress', error as Error);
          throw error;
        }
      }
    } finally {
      if (abortControllerRef.current === currentController) {
        setLoadingState('saveAttemptProgress', false);
      }
      abortControllerRef.current = null;
    }
  };

  const getAllListeningAttemptHistory = async (params: ListeningAttemptHistoryRequest) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const currentController = abortControllerRef.current;

    setLoadingState('getAllListeningAttemptHistory', true);
    setErrorState('getAllListeningAttemptHistory', null);

    try {
      // Transform array parameters to comma-separated strings
      const transformedParams = {
        ...params,
        ieltsType: params.ieltsType?.length ? params.ieltsType.join(',') : undefined,
        partNumber: params.partNumber?.length ? params.partNumber.join(',') : undefined,
        status: params.status?.length ? params.status.join(',') : undefined,
      };

      const { data } = await instance.get(`listening/attempts`, {
        params: transformedParams,
        notify: false,
        signal: currentController.signal,
      });
      return data as BaseResponse<ListeningAttemptHistoryResponse[]>;
    } catch (error) {
      if (abortControllerRef.current === currentController) {
        if ((error as any).name !== 'AbortError') {
          setErrorState('getAllListeningAttemptHistory', error as Error);
          throw error;
        }
      }
    } finally {
      if (abortControllerRef.current === currentController) {
        setLoadingState('getAllListeningAttemptHistory', false);
      }
      abortControllerRef.current = null;
    }
  };

  const getAttemptResultById = async (params: { attempt_id: string }) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const currentController = abortControllerRef.current;

    setLoadingState('getAttemptResultById', true);
    setErrorState('getAttemptResultById', null);

    try {
      const { data } = await instance.get(`listening/attempts/result/${params.attempt_id}`, {
        notify: false,
        signal: currentController.signal,
      });
      return data as BaseResponse<LoadListeningAttemptResultResponse>;
    } catch (error) {
      if (abortControllerRef.current === currentController) {
        if ((error as any).name !== 'AbortError') {
          setErrorState('getAttemptResultById', error as Error);
          throw error;
        }
      }
    } finally {
      if (abortControllerRef.current === currentController) {
        setLoadingState('getAttemptResultById', false);
      }
      abortControllerRef.current = null;
    }
  };

  const loadAttemptById = async (params: { attempt_id: string }) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const currentController = abortControllerRef.current;

    setLoadingState('loadAttemptById', true);
    setErrorState('loadAttemptById', null);

    try {
      const { data } = await instance.get(`listening/attempts/load/${params.attempt_id}`, {
        notify: false,
        signal: currentController.signal,
      });
      return data as BaseResponse<LoadListeningAttemptResponse>;
    } catch (error) {
      if (abortControllerRef.current === currentController) {
        if ((error as any).name !== 'AbortError') {
          setErrorState('loadAttemptById', error as Error);
          throw error;
        }
      }
    } finally {
      if (abortControllerRef.current === currentController) {
        setLoadingState('loadAttemptById', false);
      }
      abortControllerRef.current = null;
    }
  };

  return {
    startNewAttempt,
    submitAttempt,
    saveAttemptProgress,
    getAllListeningAttemptHistory,
    getAttemptResultById,
    loadAttemptById,
    isLoading,
    error,
  };
};

export default useListeningAttempt;
