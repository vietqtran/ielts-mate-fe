import { buildSWRKey, fetcher } from '@/lib/api/fetcher';
import instance from '@/lib/axios';
import { CommonPaginationResponseProperties } from '@/types/filter.types';
import {
  CreateTaskMarkupPayload,
  GetTaskMarkupParams,
  GetTaskMarkupResponse,
} from '@/types/markup/markup.types';
import { BaseResponse } from '@/types/reading/reading.types';
import { useState } from 'react';
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

export const useCreateMarkupTask = () => {
  const [isLoading, setIsLoading] = useState(false);

  const createMarkupTask = async (params: CreateTaskMarkupPayload) => {
    setIsLoading(true);
    try {
      const { data } = await instance.post(`personal/markup`, params, {
        notify: false,
      });
      return data as BaseResponse<any>;
    } catch (error) {
      if ((error as any).name !== 'AbortError') {
        throw error;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { createMarkupTask, isLoading };
};

export const useDeleteMarkup = () => {
  const [isLoading, setIsLoading] = useState(false);

  const deleteMarkupTask = async (taskId: number) => {
    setIsLoading(true);
    try {
      const { data } = await instance.delete(`personal/markup/${taskId}`, {
        notify: false,
      });
      return data as BaseResponse<any>;
    } catch (error) {
      if ((error as any).name !== 'AbortError') {
        throw error;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { deleteMarkupTask, isLoading };
};
