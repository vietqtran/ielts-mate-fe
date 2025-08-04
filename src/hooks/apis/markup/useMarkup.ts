import { buildSWRKey, fetcher } from '@/lib/api/fetcher';
import instance from '@/lib/axios';
import { CommonPaginationResponseProperties } from '@/types/filter.types';
import {
  CreateTaskMarkupPayload,
  GetTaskMarkupParams,
  GetTaskMarkupResponse,
} from '@/types/markup/task/task.types';
import { BaseResponse } from '@/types/reading/reading.types';
import { useRef, useState } from 'react';
import useSWR from 'swr';

export const useGetMarkupTask = (params: GetTaskMarkupParams) => {
  const endpoint = 'personal/markup/task';
  const key = buildSWRKey(endpoint, params);

  const { data, error, isLoading, mutate } = useSWR<{
    data: GetTaskMarkupResponse[];
    pagination: CommonPaginationResponseProperties;
  }>(key, fetcher);

  return { data, error, isLoading, mutate };
};

export const useUpdateMarkupTask = (params: CreateTaskMarkupPayload) => {
  const [isLoading, setIsLoading] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  if (abortControllerRef.current) {
    abortControllerRef.current.abort();
  }
  abortControllerRef.current = new AbortController();
  const currentController = abortControllerRef.current;

  const updateMarkupTask = async () => {
    setIsLoading(true);
    try {
      const { data } = await instance.put(`personal/markup`, params, {
        signal: currentController.signal,
        notify: false,
      });
      return data as BaseResponse<any>;
    } catch (error) {
      if (abortControllerRef.current === currentController) {
        if ((error as any).name !== 'AbortError') {
          throw error;
        }
      }
    } finally {
      if (abortControllerRef.current === currentController) {
        setIsLoading(false);
      }
      abortControllerRef.current = null;
    }
  };

  return { updateMarkupTask, isLoading };
};

export const useDeleteMarkup = (params: { taskId: string }) => {
  const [isLoading, setIsLoading] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  if (abortControllerRef.current) {
    abortControllerRef.current.abort();
  }
  abortControllerRef.current = new AbortController();
  const currentController = abortControllerRef.current;

  const deleteMarkupTask = async () => {
    setIsLoading(true);
    try {
      const { data } = await instance.post(`personal/markup/${params.taskId}`, {
        signal: currentController.signal,
        notify: false,
      });
      return data as BaseResponse<any>;
    } catch (error) {
      if (abortControllerRef.current === currentController) {
        if ((error as any).name !== 'AbortError') {
          throw error;
        }
      }
    } finally {
      if (abortControllerRef.current === currentController) {
        setIsLoading(false);
      }
      abortControllerRef.current = null;
    }
  };

  return { deleteMarkupTask, isLoading };
};
