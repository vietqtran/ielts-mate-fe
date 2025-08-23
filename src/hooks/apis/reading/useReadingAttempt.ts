'use client';

import instance from '@/lib/axios';
import {
  AnswersPayload,
  AttemptData,
  DataResponse,
  GetReadingAttemptHistoryRequest,
  LoadAttemptResponse,
  ReadingAttemptHistoryResponse,
} from '@/types/attempt.types';
import { BaseResponse } from '@/types/reading/reading.types';
import { useRef, useState } from 'react';

const useReadingAttempt = () => {
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
      const { data } = await instance.post(
        `reading/attempts/passages/${passageId}`,
        {},
        { signal: currentController.signal, notify: false }
      );
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

  const submitAttempt = async ({
    attempt_id,
    payload,
  }: {
    attempt_id: string;
    payload: AnswersPayload;
  }) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const currentController = abortControllerRef.current;

    setLoadingState('submitAttempt', true);
    setErrorState('submitAttempt', null);

    try {
      const { data } = await instance.put(`reading/attempts/submit/${attempt_id}`, {
        ...payload,
      });
      return data as BaseResponse<AttemptData>;
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
    payload: AnswersPayload;
  }) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const currentController = abortControllerRef.current;

    setLoadingState('saveAttemptProgress', true);
    setErrorState('saveAttemptProgress', null);

    try {
      const { data } = await instance.put(`reading/attempts/save/${attempt_id}`, {
        ...payload,
      });
      return data as BaseResponse<DataResponse>;
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

  const getAllReadingAttemptHistory = async (params: GetReadingAttemptHistoryRequest) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const currentController = abortControllerRef.current;

    setLoadingState('getAllReadingAttemptHistory', true);
    setErrorState('getAllReadingAttemptHistory', null);

    try {
      // Transform array parameters to comma-separated strings
      const transformedParams = {
        ...params,
        ieltsType: params.ieltsType?.length ? params.ieltsType.join(',') : undefined,
        partNumber: params.partNumber?.length ? params.partNumber.join(',') : undefined,
        status: params.status?.length ? params.status.join(',') : undefined,
      };

      const { data } = await instance.get(`reading/attempts`, {
        params: transformedParams,
        notify: false,
        signal: currentController.signal,
      });
      return data as BaseResponse<ReadingAttemptHistoryResponse[]>;
    } catch (error) {
      if (abortControllerRef.current === currentController) {
        if ((error as any).name !== 'AbortError') {
          setErrorState('getAllAttemptHistory', error as Error);
          throw error;
        }
      }
    } finally {
      if (abortControllerRef.current === currentController) {
        setLoadingState('getAllReadingAttemptHistory', false);
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
      const { data } = await instance.get(`reading/attempts/load/${params.attempt_id}`, {
        notify: false,
        signal: currentController.signal,
      });
      return data as BaseResponse<LoadAttemptResponse>;
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

  const getAttemptResultById = async (params: { attempt_id: string }) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const currentController = abortControllerRef.current;

    setLoadingState('getAttemptResultById', true);
    setErrorState('getAttemptResultById', null);

    try {
      const { data } = await instance.get(`reading/attempts/result/${params.attempt_id}`, {
        notify: false,
        signal: currentController.signal,
      });
      return data as BaseResponse<LoadAttemptResponse>;
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

  return {
    startNewAttempt,
    submitAttempt,
    saveAttemptProgress,
    getAllReadingAttemptHistory,
    getAttemptResultById,
    loadAttemptById,
    isLoading,
    error,
  };
};

export default useReadingAttempt;
