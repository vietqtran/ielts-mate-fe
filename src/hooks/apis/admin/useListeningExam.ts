'use client';

import {
  createListeningExam,
  deleteListeningExam,
  fetchListeningExams,
  getListeningExamById,
  updateListeningExam,
} from '@/lib/api/listening-exams';
import { useRef, useState } from 'react';

export function useListeningExam() {
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Record<string, Error | null>>({});
  const abortControllerRef = useRef<AbortController | null>(null);

  const setLoadingState = (key: string, value: boolean) => {
    setIsLoading((prev) => ({ ...prev, [key]: value }));
  };

  const setErrorState = (key: string, value: Error | null) => {
    setError((prev) => ({ ...prev, [key]: value }));
  };

  const createExam = async (request: any) => {
    setLoadingState('createExam', true);
    setErrorState('createExam', null);
    try {
      const response = await createListeningExam(request);
      return response;
    } catch (error) {
      setErrorState('createExam', error as Error);
      throw error;
    } finally {
      setLoadingState('createExam', false);
    }
  };

  const updateExam = async (examId: string, request: any) => {
    setLoadingState('updateExam', true);
    setErrorState('updateExam', null);
    try {
      const response = await updateListeningExam(examId, request);
      return response;
    } catch (error) {
      setErrorState('updateExam', error as Error);
      throw error;
    } finally {
      setLoadingState('updateExam', false);
    }
  };

  const deleteExam = async (examId: string) => {
    setLoadingState('deleteExam', true);
    setErrorState('deleteExam', null);
    try {
      await deleteListeningExam(examId);
    } catch (error) {
      setErrorState('deleteExam', error as Error);
      throw error;
    } finally {
      setLoadingState('deleteExam', false);
    }
  };

  const getExamById = async (examId: string) => {
    setLoadingState('getExamById', true);
    setErrorState('getExamById', null);
    try {
      const response = await getListeningExamById(examId);
      return response;
    } catch (error) {
      setErrorState('getExamById', error as Error);
      throw error;
    } finally {
      setLoadingState('getExamById', false);
    }
  };

  const getAllExams = async (params?: any) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const currentController = new AbortController();
    abortControllerRef.current = currentController;
    setLoadingState('getAllExams', true);
    setErrorState('getAllExams', null);
    try {
      const response = await fetchListeningExams(params);
      if (abortControllerRef.current === currentController) {
        return response;
      }
    } catch (error) {
      if (abortControllerRef.current === currentController) {
        setErrorState('getAllExams', error as Error);
        throw error;
      }
    } finally {
      if (abortControllerRef.current === currentController) {
        setLoadingState('getAllExams', false);
      }
    }
  };

  return {
    createExam,
    updateExam,
    deleteExam,
    getExamById,
    getAllExams,
    isLoading,
    error,
  };
}
