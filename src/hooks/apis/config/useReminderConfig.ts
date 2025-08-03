import { fetcher } from '@/lib/api/fetcher';
import instance from '@/lib/axios';
import {
  ReminderConfigData,
  UpdateReminderConfigParams,
} from '@/types/config/reminder/reminder.types';
import { BaseResponse } from '@/types/reading/reading.types';
import { useState } from 'react';
import useSWR from 'swr';

export const useGetReminderConfig = () => {
  const { data, error, isLoading, mutate } = useSWR<BaseResponse<ReminderConfigData>>(
    'personal/config/reminder',
    fetcher,
    {
      keepPreviousData: false,
    }
  );
  return { data, error, isLoading, mutate };
};

export const useUpdateReminderConfig = () => {
  const [isLoading, setIsLoading] = useState(false);

  const updateReminderConfig = async (params: UpdateReminderConfigParams) => {
    setIsLoading(true);
    try {
      const { data } = await instance.put(`personal/config/reminder`, params, {
        notify: false,
      });
      return data as BaseResponse<UpdateReminderConfigParams>;
    } catch (error) {
      if ((error as any).name === 'AbortError') {
        return;
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateReminderConfig, isLoading };
};

export const useRegisterNewReminderConfig = () => {
  const [isLoading, setIsLoading] = useState(false);

  const registerNewReminderConfig = async (params: UpdateReminderConfigParams) => {
    setIsLoading(true);
    try {
      const { data } = await instance.post(`personal/config/reminder`, params, {
        notify: false,
      });
      return data as BaseResponse<UpdateReminderConfigParams>;
    } catch (error) {
      if ((error as any).name !== 'AbortError') {
        throw error;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { registerNewReminderConfig, isLoading };
};
