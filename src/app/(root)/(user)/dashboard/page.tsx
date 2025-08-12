'use client';

import {
  BandStatsCard,
  OverviewCards,
  RecentActivityCard,
  TimeFrameSelector,
} from '@/components/features/dashboard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useDashboard } from '@/hooks/apis/config/useDashboard';
import { DashboardOverviewData, TimeFrame } from '@/types/dashboard.types';
import { AlertCircle, RefreshCw, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

const Dashboard = () => {
  const { getProgressOverview, isLoading, error } = useDashboard();
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('weekly');
  const [dashboardData, setDashboardData] = useState<DashboardOverviewData | null>(null);

  const fetchDashboardData = async () => {
    try {
      const response = await getProgressOverview(timeFrame);
      if (response?.data) {
        setDashboardData(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeFrame]);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const handleTimeFrameChange = (newTimeFrame: TimeFrame) => {
    setTimeFrame(newTimeFrame);
  };

  if (error.getProgressOverview) {
    return (
      <div className='container mx-auto px-4 py-8 max-w-7xl'>
        <Alert className='border-persimmon-400/50'>
          <AlertCircle className='h-4 w-4 text-persimmon-400' />
          <AlertDescription className='text-persimmon-400'>
            Failed to load dashboard data. Please try again.
          </AlertDescription>
        </Alert>
        <div className='mt-6 text-center'>
          <Button
            onClick={handleRefresh}
            className='bg-selective-yellow-400 hover:bg-selective-yellow-300 text-tekhelet-400 font-semibold'
          >
            <RefreshCw className='h-4 w-4 mr-2' />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='container overflow-y-scroll mx-auto px-4 py-8 max-w-7xl space-y-8'>
      {/* Header */}
      <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold text-tekhelet-300 flex items-center gap-3'>
            <div className='p-3 bg-gradient-to-br from-tekhelet-900/30 to-tekhelet-800/10 rounded-xl border border-tekhelet-800/20 backdrop-blur-sm'>
              <TrendingUp className='h-8 w-8 text-tekhelet-400' />
            </div>
            Dashboard
          </h1>
          <p className='text-tekhelet-500 mt-2'>
            Track your IELTS preparation progress and performance
          </p>
        </div>

        <div className='flex items-center gap-4'>
          <TimeFrameSelector
            value={timeFrame}
            onChange={handleTimeFrameChange}
            isLoading={isLoading.getProgressOverview}
          />
          <Button
            variant='outline'
            size='sm'
            onClick={handleRefresh}
            disabled={isLoading.getProgressOverview}
            className='border-tekhelet-900/20 text-tekhelet-400 hover:bg-tekhelet-900/10 hover:text-tekhelet-300'
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading.getProgressOverview ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading.getProgressOverview && !dashboardData && (
        <div className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {[...Array(4)].map((_, i) => (
              <Card
                key={i}
                className='bg-white/70 backdrop-blur-lg border border-tekhelet-900/20 rounded-2xl shadow-xl animate-pulse'
              >
                <CardHeader className='pb-3'>
                  <div className='flex items-center justify-between'>
                    <div className='h-8 w-8 bg-tekhelet-900/20 rounded'></div>
                    <div className='h-6 w-16 bg-tekhelet-900/20 rounded-full'></div>
                  </div>
                  <div className='h-4 w-24 bg-tekhelet-900/20 rounded'></div>
                </CardHeader>
                <CardContent className='pt-0'>
                  <div className='space-y-3'>
                    <div className='h-8 w-16 bg-tekhelet-900/20 rounded'></div>
                    <div className='h-2 w-full bg-tekhelet-900/20 rounded-full'></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      {dashboardData && (
        <>
          {/* Overview Cards */}
          <OverviewCards data={dashboardData} />

          {/* Statistics and Recent Activity */}
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* Band Statistics */}
            <div className='lg:col-span-2'>
              <BandStatsCard data={dashboardData} />
            </div>

            {/* Recent Activity */}
            <div className='lg:col-span-1'>
              <RecentActivityCard lastLearningDate={dashboardData.last_learning_date} />
            </div>
          </div>

          {/* Welcome Message */}
          {!isLoading.getProgressOverview && (
            <Card className='bg-gradient-to-r from-medium-slate-blue-900/20 to-tekhelet-900/20 backdrop-blur-lg border border-tekhelet-900/20 rounded-2xl shadow-xl'>
              <CardContent className='p-8 text-center'>
                <h3 className='text-xl font-semibold text-tekhelet-300 mb-2'>
                  Welcome to your IELTS journey! 🎯
                </h3>
                <p className='text-tekhelet-500'>
                  Keep practicing regularly to improve your band scores and achieve your target
                  goals.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
