import { fetcher } from '@/lib/api/fetcher';
import instance from '@/lib/axios';
import { UpdateReminderConfigParams } from '@/types/config/reminder/reminder.types';
import { BaseResponse } from '@/types/reading/reading.types';
import { useRef, useState } from 'react';
import useSWR from 'swr';

export const useGetReminderConfig = () => {
  const { data, error, isLoading, mutate } = useSWR('personal/config/reminder', fetcher);
  return { data, error, isLoading, mutate };
};

export const useUpdateReminderConfig = (params: UpdateReminderConfigParams) => {
  const [isLoading, setIsLoading] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  if (abortControllerRef.current) {
    abortControllerRef.current.abort();
  }
  abortControllerRef.current = new AbortController();
  const currentController = abortControllerRef.current;

  const updateReminderConfig = async () => {
    setIsLoading(true);
    try {
      const { data } = await instance.put(`personal/config/reminder`, params, {
        signal: currentController.signal,
        notify: false,
      });
      return data as BaseResponse<UpdateReminderConfigParams>;
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

  return { updateReminderConfig, isLoading };
};

export const useRegisterNewReminderConfig = (params: UpdateReminderConfigParams) => {
  const [isLoading, setIsLoading] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  if (abortControllerRef.current) {
    abortControllerRef.current.abort();
  }
  abortControllerRef.current = new AbortController();
  const currentController = abortControllerRef.current;

  const registerNewReminderConfig = async () => {
    setIsLoading(true);
    try {
      const { data } = await instance.post(`personal/config/reminder`, params, {
        signal: currentController.signal,
        notify: false,
      });
      return data as BaseResponse<UpdateReminderConfigParams>;
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

  return { registerNewReminderConfig, isLoading };
};
