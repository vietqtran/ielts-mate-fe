import { fetcher } from '@/lib/api/fetcher';
import useSWR from 'swr';

export const useGetStreakConfig = () => {
  const { data, error, isLoading, mutate } = useSWR('personal/config/streak', fetcher);
  return { data, error, isLoading, mutate };
};
