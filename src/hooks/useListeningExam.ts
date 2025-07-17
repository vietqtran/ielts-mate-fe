import instance from '@/lib/axios';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

interface ListeningExam {
  id: string;
  title: string;
  description?: string;
  tasks: ListeningTask[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

interface ListeningTask {
  id: string;
  title: string;
  audio: string;
  description?: string;
  questions: any[];
  partNumber: number;
  examId?: string;
}

export function useListeningExam() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [exams, setExams] = useState<ListeningExam[]>([]);
  const [exam, setExam] = useState<ListeningExam | null>(null);

  const fetchExams = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data } = await instance.get('/listening/exams/activate');

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

  const fetchExamById = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data } = await instance.get(`/listening/exams/${id}`);

      if (data && data.data) {
        setExam(data.data);
      }
    } catch (err) {
      console.error(`Failed to fetch listening exam with ID ${id}:`, err);
      setError(err as Error);
      toast.error('Failed to fetch listening exam details');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    exams,
    exam,
    fetchExams,
    fetchExamById,
  };
}
