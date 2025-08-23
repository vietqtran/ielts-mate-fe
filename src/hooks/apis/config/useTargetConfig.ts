import { fetcher } from '@/lib/api/fetcher';
import instance from '@/lib/axios';
import {
  TargetConfigResponseData,
  UpdateTargetConfigParams,
} from '@/types/config/target/target.types';
import { BaseResponse } from '@/types/reading/reading.types';
import { useState } from 'react';
import useSWR from 'swr';

export const useGetTargetConfig = (enabled: boolean = true) => {
  const { data, error, isLoading, mutate } = useSWR(
    enabled ? 'personal/config/target' : null,
    fetcher
  );
  return { data, error, isLoading, mutate };
};

export const useUpdateTargetConfig = () => {
  const [isLoading, setIsLoading] = useState(false);

  const updateTargetConfig = async (params: UpdateTargetConfigParams) => {
    setIsLoading(true);
    try {
      const { data } = await instance.post(`personal/config/target`, params, {
        notify: false,
      });
      return data as BaseResponse<TargetConfigResponseData>;
    } catch (error) {
      if ((error as any).name !== 'AbortError') {
        throw error;
      }
    } finally {
      setIsLoading(false);
    }
  };
  return { updateTargetConfig, isLoading };
};

export const useRegisterNewTargetConfig = () => {
  const [isLoading, setIsLoading] = useState(false);

  const registerNewTargetConfig = async (params: UpdateTargetConfigParams) => {
    setIsLoading(true);
    try {
      const { data } = await instance.post(`personal/config/target`, params, {
        notify: false,
      });
      return data as BaseResponse<TargetConfigResponseData>;
    } catch (error) {
      if ((error as any).name !== 'AbortError') {
        throw error;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { registerNewTargetConfig, isLoading };
};
