import { fetcher } from '@/lib/api/fetcher';
import instance from '@/lib/axios';
import { UpdateTargetConfigParams } from '@/types/config/target/target.types';
import { BaseResponse } from '@/types/reading/reading.types';
import { useRef, useState } from 'react';
import useSWR from 'swr';

export const useGetTargetConfig = () => {
  const { data, error, isLoading, mutate } = useSWR('personal/config/target', fetcher);
  return { data, error, isLoading, mutate };
};

export const useUpdateTargetConfig = (params: UpdateTargetConfigParams) => {
  const [isLoading, setIsLoading] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  if (abortControllerRef.current) {
    abortControllerRef.current.abort();
  }
  abortControllerRef.current = new AbortController();
  const currentController = abortControllerRef.current;

  const updateTargetConfig = async () => {
    setIsLoading(true);
    try {
      const { data } = await instance.put(`personal/config/target`, params, {
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

  return { updateTargetConfig, isLoading };
};

export const useRegisterNewTargetConfig = (params: UpdateTargetConfigParams) => {
  const [isLoading, setIsLoading] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  if (abortControllerRef.current) {
    abortControllerRef.current.abort();
  }
  abortControllerRef.current = new AbortController();
  const currentController = abortControllerRef.current;

  const registerNewTargetConfig = async () => {
    setIsLoading(true);
    try {
      const { data } = await instance.post(`personal/config/target`, params, {
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

  return { registerNewTargetConfig, isLoading };
};
