'use client';

import instance from '@/lib/axios';
import {
  BaseListeningResponse,
  ListeningTaskCreationRequest,
  ListeningTaskDetailResponse,
  ListeningTaskFilterParams,
  ListeningTaskResponse,
  ListeningTaskUpdateRequest,
} from '@/types/listening.types';
import { useRef, useState } from 'react';

export function useListeningTask() {
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Record<string, Error | null>>({});
  const abortControllerRef = useRef<AbortController | null>(null);

  const setLoadingState = (key: string, value: boolean) => {
    setIsLoading((prev) => ({ ...prev, [key]: value }));
  };

  const setErrorState = (key: string, value: Error | null) => {
    setError((prev) => ({ ...prev, [key]: value }));
  };

  // Get listening tasks with filters
  const getListeningTasks = async (params?: ListeningTaskFilterParams) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const currentController = new AbortController();
    abortControllerRef.current = currentController;

    setLoadingState('getListeningTasks', true);
    setErrorState('getListeningTasks', null);

    try {
      const { data } = await instance.get('/listening/listens', {
        params: {
          page: params?.page,
          size: params?.size,
          ielts_type: params?.ielts_type,
          part_number: params?.part_number,
          status: params?.status,
          question_category: params?.question_category,
          sort_by: params?.sort_by,
          sort_direction: params?.sort_direction,
          title: params?.title,
          created_by: params?.created_by,
        },
        signal: currentController.signal,
      });

      // Only return data if this is still the current request
      if (abortControllerRef.current === currentController) {
        return data as BaseListeningResponse<ListeningTaskResponse[]>;
      }
    } catch (error) {
      // Only handle error if this is still the current request
      if (abortControllerRef.current === currentController) {
        if ((error as any).name !== 'AbortError') {
          setErrorState('getListeningTasks', error as Error);
          throw error;
        }
      }
    } finally {
      // Only set loading to false if this is still the current request
      if (abortControllerRef.current === currentController) {
        setLoadingState('getListeningTasks', false);
      }
    }
  };

  // Get listening tasks created by the current user
  const getListeningTasksByCreator = async (params?: ListeningTaskFilterParams) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const currentController = new AbortController();
    abortControllerRef.current = currentController;

    setLoadingState('getListeningTasksByCreator', true);
    setErrorState('getListeningTasksByCreator', null);

    try {
      const { data } = await instance.get('/listening/listens/creator', {
        params: {
          page: params?.page,
          size: params?.size,
          ielts_type: params?.ielts_type,
          part_number: params?.part_number,
          status: params?.status,
          question_category: params?.question_category,
          sort_by: params?.sort_by,
          sort_direction: params?.sort_direction,
          title: params?.title,
          created_by: params?.created_by,
        },
        signal: currentController.signal,
      });

      // Only return data if this is still the current request
      if (abortControllerRef.current === currentController) {
        return data as BaseListeningResponse<ListeningTaskResponse[]>;
      }
    } catch (error) {
      // Only handle error if this is still the current request
      if (abortControllerRef.current === currentController) {
        if ((error as any).name !== 'AbortError') {
          setErrorState('getListeningTasksByCreator', error as Error);
          throw error;
        }
      }
    } finally {
      // Only set loading to false if this is still the current request
      if (abortControllerRef.current === currentController) {
        setLoadingState('getListeningTasksByCreator', false);
      }
    }
  };

  // Get listening task by ID
  const getListeningTaskById = async (taskId: string) => {
    setLoadingState('getListeningTaskById', true);
    setErrorState('getListeningTaskById', null);

    try {
      const { data } = await instance.get(`/listening/listens/${taskId}`);
      return data as BaseListeningResponse<ListeningTaskDetailResponse>;
    } catch (error) {
      setErrorState('getListeningTaskById', error as Error);
      throw error;
    } finally {
      setLoadingState('getListeningTaskById', false);
    }
  };

  // Create new listening task
  const createListeningTask = async (task: ListeningTaskCreationRequest) => {
    setLoadingState('createListeningTask', true);
    setErrorState('createListeningTask', null);

    try {
      // Create FormData for multipart/form-data submission
      const formData = new FormData();

      // Add parameters as RequestParam (form fields)
      formData.append('ielts_type', task.ielts_type.toString());
      formData.append('part_number', task.part_number.toString());
      formData.append('instruction', task.instruction);
      formData.append('title', task.title);
      formData.append('is_automatic_transcription', task.is_automatic_transcription.toString());

      // Add status as a simple form field
      formData.append('status', task.status.toString());

      // Add audio file
      formData.append('audio_file', task.audio_file);

      // Add transcription if provided
      if (task.transcription) {
        formData.append('transcription', task.transcription);
      }

      // Send request with formData body - DO NOT set Content-Type header manually
      const { data } = await instance.post('/listening/listens', formData);

      return data as BaseListeningResponse<ListeningTaskDetailResponse>;
    } catch (error) {
      setErrorState('createListeningTask', error as Error);
      throw error;
    } finally {
      setLoadingState('createListeningTask', false);
    }
  };

  // Update listening task
  const updateListeningTask = async (taskId: string, task: ListeningTaskUpdateRequest) => {
    setLoadingState('updateListeningTask', true);
    setErrorState('updateListeningTask', null);

    try {
      // Create FormData for multipart/form-data submission
      const formData = new FormData();

      // Add parameters as RequestParam (form fields)
      formData.append('ielts_type', task.ielts_type.toString());
      formData.append('part_number', task.part_number.toString());
      formData.append('instruction', task.instruction);
      formData.append('title', task.title);
      formData.append('transcription', task.transcription);

      // Handle status field - using set() to ensure single value
      formData.set('status', task.status.toString());

      // Always include audio_file parameter since backend expects it as @RequestPart
      // If no new file is provided, send an empty Blob to satisfy the multipart requirement
      if (task.audio_file) {
        formData.append('audio_file', task.audio_file);
      } else {
        // Create an empty file to satisfy the @RequestPart requirement
        const emptyBlob = new Blob([], { type: 'audio/mp3' });
        const emptyFile = new File([emptyBlob], 'empty.mp3', { type: 'audio/mp3' });
        formData.append('audio_file', emptyFile);
      }

      // Send request with formData body - DO NOT set Content-Type header manually
      // Use task-Id with capital I to match backend controller's path variable naming
      const { data } = await instance.put(`/listening/listens/${taskId}`, formData);

      return data as BaseListeningResponse<ListeningTaskDetailResponse>;
    } catch (error) {
      setErrorState('updateListeningTask', error as Error);
      throw error;
    } finally {
      setLoadingState('updateListeningTask', false);
    }
  };

  // Delete listening task
  const deleteListeningTask = async (taskId: string) => {
    setLoadingState('deleteListeningTask', true);
    setErrorState('deleteListeningTask', null);

    try {
      const { data } = await instance.delete(`/listening/listens/${taskId}`);
      return data as BaseListeningResponse<any>;
    } catch (error) {
      setErrorState('deleteListeningTask', error as Error);
      throw error;
    } finally {
      setLoadingState('deleteListeningTask', false);
    }
  };

  return {
    getListeningTasks,
    getListeningTasksByCreator,
    getListeningTaskById,
    createListeningTask,
    updateListeningTask,
    deleteListeningTask,
    isLoading,
    error,
  };
}
