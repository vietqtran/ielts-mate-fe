'use client';

import instance from '@/lib/axios';
import { DashboardOverviewResponse, TimeFrame } from '@/types/dashboard.types';
import { useState } from 'react';

export function useDashboard() {
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Record<string, Error | null>>({});

  const setLoadingState = (key: string, value: boolean) => {
    setIsLoading((prev) => ({ ...prev, [key]: value }));
  };

  const setErrorState = (key: string, value: Error | null) => {
    setError((prev) => ({ ...prev, [key]: value }));
  };

  const getProgressOverview = async (timeFrame: TimeFrame = 'weekly') => {
    setLoadingState('getProgressOverview', true);
    setErrorState('getProgressOverview', null);

    try {
      const { data } = await instance.get<DashboardOverviewResponse>(
        '/personal/progress/overview',
        {
          params: { timeFrame },
        }
      );
      return data;
    } catch (error) {
      setErrorState('getProgressOverview', error as Error);
      throw error;
    } finally {
      setLoadingState('getProgressOverview', false);
    }
  };

  return {
    getProgressOverview,
    isLoading,
    error,
  };
}
