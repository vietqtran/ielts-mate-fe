import instance from '@/lib/axios';
import {
  ReadingExamAttemptDetailsResponse,
  ReadingExamAttemptFiltersRequestParams,
  ReadingExamAttemptList,
  ReadingExamData,
  SubmitExamAttemptAnswersRequest,
  SubmitExamResultResponse,
} from '@/types/reading/reading-exam-attempt.types';
import { BaseResponse } from '@/types/reading/reading.types';
import { useRef, useState } from 'react';

const useReadingExamAttempt = () => {
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Record<string, Error | null>>({});
  const abortControllerRef = useRef<AbortController | null>(null);

  const setLoadingState = (key: string, value: boolean) => {
    setIsLoading((prev) => ({ ...prev, [key]: value }));
  };

  const setErrorState = (key: string, value: Error | null) => {
    setError((prev) => ({ ...prev, [key]: value }));
  };

  /**
   * Get all available reading exams for users
   */
  const getAllAvailableExams = async (params: {
    page: number;
    size: number;
    keyword?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc' | '';
  }) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const currentController = new AbortController();
    abortControllerRef.current = currentController;

    setLoadingState('getAllAvailableExams', true);
    setErrorState('getAllAvailableExams', null);

    try {
      const response = await instance.get('reading/reading-exams/active-exams', {
        params: {
          ...params,
        },
        signal: currentController.signal,
      });

      // Only return data if this is still the current request
      if (abortControllerRef.current === currentController) {
        return response.data;
      }
    } catch (error) {
      // Only handle error if this is still the current request
      if (abortControllerRef.current === currentController) {
        if ((error as any).name !== 'AbortError') {
          setErrorState('getAllAvailableExams', error as Error);
          throw error;
        }
      }
    } finally {
      // Only set loading to false if this is still the current request
      if (abortControllerRef.current === currentController) {
        setLoadingState('getAllAvailableExams', false);
      }
    }
  };

  const getExamAttempt = async (params: { attemptId: string }) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const currentController = new AbortController();
    abortControllerRef.current = currentController;

    setLoadingState('getExamAttempt', true);
    setErrorState('getExamAttempt', null);

    try {
      const response = await instance.get(`reading/exam/attempts/${params.attemptId}`);

      // Only return data if this is still the current request
      if (abortControllerRef.current === currentController) {
        return response.data;
      }
    } catch (error) {
      // Only handle error if this is still the current request
      if (abortControllerRef.current === currentController) {
        if ((error as any).name !== 'AbortError') {
          setErrorState('getExamAttempt', error as Error);
          throw error;
        }
      }
    } finally {
      // Only set loading to false if this is still the current request
      if (abortControllerRef.current === currentController) {
        setLoadingState('getExamAttempt', false);
      }
    }
  };

  const getExamAttemptHistory = async (params: ReadingExamAttemptFiltersRequestParams) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const currentController = new AbortController();
    abortControllerRef.current = currentController;

    setLoadingState('getExamAttemptHistory', true);
    setErrorState('getExamAttemptHistory', null);

    try {
      const response = await instance.get(`reading/exam/attempts/history`, {
        params: {
          ...params,
        },
        signal: currentController.signal,
      });

      // Only return data if this is still the current request
      if (abortControllerRef.current === currentController) {
        return response.data as BaseResponse<ReadingExamAttemptList>;
      }
    } catch (error) {
      // Only handle error if this is still the current request
      if (abortControllerRef.current === currentController) {
        if ((error as any).name !== 'AbortError') {
          setErrorState('getExamAttemptHistory', error as Error);
          throw error;
        }
      }
    } finally {
      // Only set loading to false if this is still the current request
      if (abortControllerRef.current === currentController) {
        setLoadingState('getExamAttemptHistory', false);
      }
    }
  };

  const getReadingExamHistoryDetails = async (params: {
    attemptId: string;
  }) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const currentController = new AbortController();
    abortControllerRef.current = currentController;

    setLoadingState('getReadingExamHistoryDetails', true);
    setErrorState('getReadingExamHistoryDetails', null);

    try {
      const response = await instance.get(`reading/exam/attempts/${params.attemptId}`);

      // Only return data if this is still the current request
      if (abortControllerRef.current === currentController) {
        return response.data.data as ReadingExamAttemptDetailsResponse;
      }
    } catch (error) {
      // Only handle error if this is still the current request
      if (abortControllerRef.current === currentController) {
        if ((error as any).name !== 'AbortError') {
          setErrorState('getReadingExamHistoryDetails', error as Error);
          throw error;
        }
      }
    } finally {
      // Only set loading to false if this is still the current request
      if (abortControllerRef.current === currentController) {
        setLoadingState('getReadingExamHistoryDetails', false);
      }
    }
  };

  const createExamAttempt = async (params: { urlSlug: string }) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const currentController = new AbortController();
    abortControllerRef.current = currentController;

    setLoadingState('createExamAttempt', true);
    setErrorState('createExamAttempt', null);

    try {
      const response = await instance.post(`reading/exam/attempts/${params.urlSlug}`);

      // Only return data if this is still the current request
      if (abortControllerRef.current === currentController) {
        return response.data.data as ReadingExamData;
      }
    } catch (error) {
      // Only handle error if this is still the current request
      if (abortControllerRef.current === currentController) {
        if ((error as any).name !== 'AbortError') {
          setErrorState('createExamAttempt', error as Error);
          throw error;
        }
      }
    } finally {
      // Only set loading to false if this is still the current request
      if (abortControllerRef.current === currentController) {
        setLoadingState('createExamAttempt', false);
      }
    }
  };

  const submitExamAttempt = async (params: {
    attemptId: string;
    payload: SubmitExamAttemptAnswersRequest;
  }) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const currentController = new AbortController();
    abortControllerRef.current = currentController;

    setLoadingState('submitExamAttempt', true);
    setErrorState('submitExamAttempt', null);

    try {
      const response = await instance.post(
        `reading/exam/attempts/save/${params.attemptId}`,
        params.payload
      );

      // Only return data if this is still the current request
      if (abortControllerRef.current === currentController) {
        return response.data.data as SubmitExamResultResponse;
      }
    } catch (error) {
      // Only handle error if this is still the current request
      if (abortControllerRef.current === currentController) {
        if ((error as any).name !== 'AbortError') {
          setErrorState('submitExamAttempt', error as Error);
          throw error;
        }
      }
    } finally {
      // Only set loading to false if this is still the current request
      if (abortControllerRef.current === currentController) {
        setLoadingState('submitExamAttempt', false);
      }
    }
  };

  return {
    isLoading,
    error,
    getAllAvailableExams,
    getExamAttempt,
    createExamAttempt,
    getExamAttemptHistory,
    getReadingExamHistoryDetails,
    submitExamAttempt,
  };
};

export default useReadingExamAttempt;
