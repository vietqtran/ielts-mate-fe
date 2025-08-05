'use client';

import { buildSWRKey, fetcher } from '@/lib/api/fetcher';
import instance from '@/lib/axios';
import { CommonPaginationResponseProperties } from '@/types/filter.types';
import {
  AddGroupQuestionRequest,
  AddGroupQuestionResponse,
  BaseListeningResponse,
  ListeningTaskCreationRequest,
  ListeningTaskDetailResponse,
  ListeningTaskFilterParams,
  ListeningTaskResponse,
  ListeningTaskUpdateRequest,
} from '@/types/listening/listening.types';
import { useRef, useState } from 'react';
import useSWR from 'swr';

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
          ielts_type: params?.ielts_type?.length ? params?.ielts_type?.join(',') : undefined,
          part_number: params?.part_number?.length ? params?.part_number?.join(',') : undefined,
          status: params?.status?.length ? params?.status.join(',') : undefined,
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

      // Add transcript if provided
      if (task.transcript) {
        formData.append('transcript', task.transcript);
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
      formData.append('transcript', task.transcript);

      // Handle status field - using set() to ensure single value
      formData.set('status', task.status.toString());

      // Only append audio_file if a new one is provided
      if (task.audio_file) {
        formData.append('audio_file', task.audio_file);
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

  // Add question group to listening task
  const addGroupQuestion = async (taskId: string, request: AddGroupQuestionRequest) => {
    setLoadingState('addGroupQuestion', true);
    setErrorState('addGroupQuestion', null);
    try {
      const { data } = await instance.post(`/listening/listens/${taskId}/groups`, request);
      return data as BaseListeningResponse<AddGroupQuestionResponse>;
    } catch (error) {
      setErrorState('addGroupQuestion', error as Error);
      throw error;
    } finally {
      setLoadingState('addGroupQuestion', false);
    }
  };

  // Get all question groups for listening task
  const getAllQuestionGroups = async (taskId: string) => {
    setLoadingState('getAllQuestionGroups', true);
    setErrorState('getAllQuestionGroups', null);
    try {
      const { data } = await instance.get(`/listening/listens/${taskId}/groups`);
      return data as BaseListeningResponse<AddGroupQuestionResponse[]>;
    } catch (error) {
      setErrorState('getAllQuestionGroups', error as Error);
      throw error;
    } finally {
      setLoadingState('getAllQuestionGroups', false);
    }
  };

  // Update question group
  const updateGroupQuestion = async (
    taskId: string,
    groupId: string,
    request: AddGroupQuestionRequest
  ) => {
    setLoadingState('updateGroupQuestion', true);
    setErrorState('updateGroupQuestion', null);
    try {
      const { data } = await instance.put(
        `/listening/listens/${taskId}/groups/${groupId}`,
        request
      );
      return data as BaseListeningResponse<AddGroupQuestionResponse>;
    } catch (error) {
      setErrorState('updateGroupQuestion', error as Error);
      throw error;
    } finally {
      setLoadingState('updateGroupQuestion', false);
    }
  };

  // Delete question group
  const deleteGroupQuestion = async (taskId: string, groupId: string) => {
    setLoadingState('deleteGroupQuestion', true);
    setErrorState('deleteGroupQuestion', null);
    try {
      const { data } = await instance.delete(`/listening/listens/${taskId}/groups/${groupId}`);
      return data as BaseListeningResponse<void>;
    } catch (error) {
      setErrorState('deleteGroupQuestion', error as Error);
      throw error;
    } finally {
      setLoadingState('deleteGroupQuestion', false);
    }
  };

  // Get group question by ID
  const getGroupQuestionById = async (taskId: string, groupId: string) => {
    setLoadingState('getGroupQuestionById', true);
    setErrorState('getGroupQuestionById', null);
    try {
      const { data } = await instance.get(`/listening/listens/${taskId}/groups/${groupId}`);
      return data as BaseListeningResponse<AddGroupQuestionResponse>;
    } catch (error) {
      setErrorState('getGroupQuestionById', error as Error);
      throw error;
    } finally {
      setLoadingState('getGroupQuestionById', false);
    }
  };

  return {
    getListeningTasks,
    getListeningTasksByCreator,
    getListeningTaskById,
    createListeningTask,
    updateListeningTask,
    deleteListeningTask,
    addGroupQuestion,
    getAllQuestionGroups,
    updateGroupQuestion,
    deleteGroupQuestion,
    getGroupQuestionById,
    isLoading,
    error,
  };
}

export const useGetListeningTaskCached = (params: ListeningTaskFilterParams) => {
  const endpoint = 'listening/listens';
  const key = buildSWRKey(endpoint, params);

  const { data, error, isLoading, mutate } = useSWR<{
    data: ListeningTaskResponse[];
    pagination: CommonPaginationResponseProperties;
  }>(key, fetcher);

  return { data, error, isLoading, mutate };
};
