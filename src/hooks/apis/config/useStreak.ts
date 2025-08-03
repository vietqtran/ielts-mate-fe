import { fetcher } from '@/lib/api/fetcher';
import { StreakResponse } from '@/types/config/streak/streak.types';
import { BaseResponse } from '@/types/reading/reading.types';
import useSWR from 'swr';

export const useGetStreakConfig = () => {
  const { data, error, isLoading, mutate } = useSWR<BaseResponse<StreakResponse>>(
    'personal/config/streak',
    fetcher
  );
  return { data, error, isLoading, mutate };
};
