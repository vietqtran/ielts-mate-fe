import instance from '@/lib/axios';
import {
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

export function useListeningExam() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [exams, setExams] = useState<ListActiveListeningExamsResponse[]>([]);

  const fetchListeningExamsList = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data } = await instance.get('listening/exams/activate');

      if (data && data.data) {
        setExams(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch listening exams:', err);
      setError(err as Error);
      toast.error('Failed to fetch listening exams');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submitListeningExamAnswers = useCallback(
    async (params: {
      attempt_id: string;
      payload: SubmitListeningExamAttemptAnswersRequest;
    }) => {
      try {
        setIsLoading(true);
        setError(null);

        const res = await instance.put(
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

  const getListeningExamAttemptsHistory = useCallback(async (params: { attempt_id: string }) => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await instance.get(`listening/exam/history`);

      return res.data as BaseResponse<ListeningExamAttemptsHistoryResponse[]>;
    } catch (err) {
      console.error('Failed to fetch listening exams:', err);
      setError(err as Error);
      toast.error('Failed to fetch listening exams');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    exams,
    fetchListeningExamsList,
    submitListeningExamAnswers,
    startNewListeningExamAttempt,
    getListeningExamAttemptResult,
    getListeningExamAttemptsHistory,
  };
}
