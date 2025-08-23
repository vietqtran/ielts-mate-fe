'use client';

import {
  checkReadingExamSlug,
  createReadingExam,
  deleteReadingExam,
  generateReadingExamSlug,
  getReadingExam,
  getReadingExams,
  updateReadingExam,
} from '@/lib/api/reading-exams';
import instance from '@/lib/axios';
import {
  ReadingExamCreateRequest,
  ReadingExamUpdateRequest,
} from '@/types/reading/reading-exam.types';
import { useRef, useState } from 'react';

export function useReadingExam() {
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
   * Create a new reading exam
   * @param request Reading exam creation data
   */
  const createExam = async (request: ReadingExamCreateRequest) => {
    setLoadingState('createExam', true);
    setErrorState('createExam', null);

    try {
      const response = await createReadingExam(request);
      return response;
    } catch (error) {
      setErrorState('createExam', error as Error);
      throw error;
    } finally {
      setLoadingState('createExam', false);
    }
  };

  /**
   * Update an existing reading exam
   * @param examId Reading exam ID
   * @param request Data to update
   */
  const updateExam = async (examId: string, request: ReadingExamUpdateRequest) => {
    setLoadingState('updateExam', true);
    setErrorState('updateExam', null);

    try {
      const response = await updateReadingExam(examId, request);
      return response;
    } catch (error) {
      setErrorState('updateExam', error as Error);
      throw error;
    } finally {
      setLoadingState('updateExam', false);
    }
  };

  /**
   * Delete a reading exam
   * @param examId Reading exam ID
   */
  const deleteExam = async (examId: string) => {
    setLoadingState('deleteExam', true);
    setErrorState('deleteExam', null);

    try {
      const response = await deleteReadingExam(examId);
      return response;
    } catch (error) {
      setErrorState('deleteExam', error as Error);
      throw error;
    } finally {
      setLoadingState('deleteExam', false);
    }
  };

  /**
   * Get a specific reading exam by ID
   * @param examId Reading exam ID
   */
  const getExamById = async (examId: string) => {
    setLoadingState('getExamById', true);
    setErrorState('getExamById', null);

    try {
      const response = await getReadingExam(examId);
      return response;
    } catch (error) {
      setErrorState('getExamById', error as Error);
      throw error;
    } finally {
      setLoadingState('getExamById', false);
    }
  };

  /**
   * Get all reading exams (for creator only)
   */
  const getAllExams = async (params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc' | '';
    keyword?: string;
  }) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const currentController = new AbortController();
    abortControllerRef.current = currentController;

    setLoadingState('getAllExams', true);
    setErrorState('getAllExams', null);

    try {
      const response = await getReadingExams(params);

      // Only return data if this is still the current request
      if (abortControllerRef.current === currentController) {
        return response;
      }
    } catch (error) {
      // Only handle error if this is still the current request
      if (abortControllerRef.current === currentController) {
        if ((error as any).name !== 'AbortError') {
          setErrorState('getAllExams', error as Error);
          throw error;
        }
      }
    } finally {
      // Only set loading to false if this is still the current request
      if (abortControllerRef.current === currentController) {
        setLoadingState('getAllExams', false);
      }
    }
  };

  /**
   * Get reading exams with filter for "Test" status
   * Specifically for selecting passages with Test status
   */
  const getTestStatusPassages = async () => {
    setLoadingState('getTestStatusPassages', true);
    setErrorState('getTestStatusPassages', null);

    try {
      // Using the existing API for passages, but adding a filter for Test status
      const { data } = await instance.get('/reading/passages/teacher', {
        params: {
          status: 4, // Test status (4)
        },
      });
      return data;
    } catch (error) {
      setErrorState('getTestStatusPassages', error as Error);
      throw error;
    } finally {
      setLoadingState('getTestStatusPassages', false);
    }
  };

  /**
   * Generate a slug from exam name
   * @param examName The exam name to generate slug from
   */
  const generateSlug = async (examName: string) => {
    setLoadingState('generateSlug', true);
    setErrorState('generateSlug', null);

    try {
      const response = await generateReadingExamSlug(examName);
      return response;
    } catch (error) {
      setErrorState('generateSlug', error as Error);
      throw error;
    } finally {
      setLoadingState('generateSlug', false);
    }
  };

  /**
   * Check if a slug is available
   * @param slug The slug to check
   */
  const checkSlug = async (slug: string) => {
    setLoadingState('checkSlug', true);
    setErrorState('checkSlug', null);

    try {
      const response = await checkReadingExamSlug(slug);
      return response;
    } catch (error) {
      setErrorState('checkSlug', error as Error);
      throw error;
    } finally {
      setLoadingState('checkSlug', false);
    }
  };

  return {
    createExam,
    updateExam,
    deleteExam,
    getExamById,
    getAllExams,
    getTestStatusPassages,
    generateSlug,
    checkSlug,
    isLoading,
    error,
  };
}
