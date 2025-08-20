import { buildSWRKey, fetcher } from '@/lib/api/fetcher';
import instance from '@/lib/axios';
import { CommonPaginationResponseProperties } from '@/types/filter.types';
import {
  GetListeningExamParams,
  ListActiveListeningExamsResponse,
  ListeningExamAttemptDetailsResponse,
  ListeningExamAttemptsHistoryResponse,
  StartListeningExamResponse,
  SubmitListeningExamAttemptAnswersRequest,
  SubmitListeningExamAttemptAnswersResponse,
} from '@/types/listening/listening-exam.types';
import { BaseResponse } from '@/types/reading/reading.types';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';

// This hook is used to manage listening exam operations on the user side.
export function useListeningExam() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchListeningExamsList = useCallback(
    async (params: {
      page: number;
      size: number;
      keyword?: string;
      sortBy?: string;
      sortDirection?: 'asc' | 'desc' | '';
    }) => {
      try {
        setIsLoading(true);
        setError(null);

        const res = await instance.get('listening/exams/activate', {
          params,
        });

        return res.data as BaseResponse<ListActiveListeningExamsResponse[]>;
      } catch (err) {
        console.error('Failed to fetch listening exams:', err);
        setError(err as Error);
        toast.error('Failed to fetch listening exams');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const submitListeningExamAnswers = useCallback(
    async (params: {
      attempt_id: string;
      payload: SubmitListeningExamAttemptAnswersRequest;
    }) => {
      try {
        setIsLoading(true);
        setError(null);

        const res = await instance.post(
          `listening/exam/attempts/save/${params.attempt_id}`,
          params.payload
        );
        return res.data as BaseResponse<SubmitListeningExamAttemptAnswersResponse>;
      } catch (err) {
        console.error('Failed to fetch listening exams:', err);
        setError(err as Error);
        toast.error('Failed to fetch listening exams');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const startNewListeningExamAttempt = useCallback(async (params: { url_slug: string }) => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await instance.post(`listening/exam/attempts/${params.url_slug}`);
      return res.data as BaseResponse<StartListeningExamResponse>;
    } catch (err) {
      console.error('Failed to start new listening exam attempt:', err);
      setError(err as Error);
      toast.error('Failed to start new listening exam attempt');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getListeningExamAttemptResult = useCallback(async (params: { attempt_id: string }) => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await instance.get(`listening/exam/attempts/${params.attempt_id}`);

      return res.data as BaseResponse<ListeningExamAttemptDetailsResponse>;
    } catch (err) {
      console.error('Failed to fetch listening exams:', err);
      setError(err as Error);
      toast.error('Failed to fetch listening exams');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getListeningExamAttemptsHistory = useCallback(
    async (params: {
      page: number;
      size: number;
      listeningExamName?: string;
      sortBy?: string;
      sortDirection?: 'asc' | 'desc' | '';
    }) => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await instance.get(`listening/exam/attempts/history`, {
          params,
        });
        return res.data as BaseResponse<ListeningExamAttemptsHistoryResponse[]>;
      } catch (err) {
        console.error('Failed to fetch listening exams:', err);
        setError(err as Error);
        toast.error('Failed to fetch listening exams');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    isLoading,
    error,
    fetchListeningExamsList,
    submitListeningExamAnswers,
    startNewListeningExamAttempt,
    getListeningExamAttemptResult,
    getListeningExamAttemptsHistory,
  };
}

export const useGetListListeningExamCached = (params: GetListeningExamParams) => {
  const endpoint = 'listening/exams/activate';
  const key = buildSWRKey(endpoint, params);

  const { data, error, isLoading, mutate } = useSWR<{
    data: ListActiveListeningExamsResponse[];
    pagination: CommonPaginationResponseProperties;
  }>(key, fetcher);

  return { data, error, isLoading, mutate };
};
