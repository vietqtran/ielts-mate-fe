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
      const { data } = await instance.get('/listens', {
        params,
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
      const { data } = await instance.get('/listens/creator', {
        params,
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
      const { data } = await instance.get(`/listens/${taskId}`);
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

      // Add form fields
      formData.append('ielts_type', task.ielts_type.toString());
      formData.append('part_number', task.part_number.toString());
      formData.append('instruction', task.instruction);
      formData.append('title', task.title);
      formData.append('status', task.status.toString());
      formData.append('is_automatic_transcription', task.is_automatic_transcription.toString());

      // Add transcription if provided
      if (task.transcription) {
        formData.append('transcription', task.transcription);
      }

      // Add audio file
      formData.append('audio_file', task.audio_file);

      const { data } = await instance.post('/listens', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

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

      // Add form fields
      formData.append('ielts_type', task.ielts_type.toString());
      formData.append('part_number', task.part_number.toString());
      formData.append('instruction', task.instruction);
      formData.append('title', task.title);
      formData.append('status', task.status.toString());
      formData.append('transcription', task.transcription);

      // Add audio file if provided
      if (task.audio_file) {
        formData.append('audio_file', task.audio_file);
      }

      const { data } = await instance.put(`/listens/${taskId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params: {
          ielts_type: task.ielts_type,
          part_number: task.part_number,
          instruction: task.instruction,
          status: task.status,
          title: task.title,
          transcription: task.transcription,
        },
      });

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
      const { data } = await instance.delete(`/listens/${taskId}`);
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
