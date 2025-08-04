'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetTargetConfig } from '@/hooks/apis/config/useTargetConfig';
import { TargetConfigResponseData } from '@/types/config/target/target.types';
import { BaseResponse } from '@/types/reading/reading.types';
import { format } from 'date-fns';
import { BookOpenIcon, CalendarIcon, HeadphonesIcon, Target } from 'lucide-react';

const TargetConfigDisplay = () => {
  const { data, error, isLoading } = useGetTargetConfig();
  const typedData = data as BaseResponse<TargetConfigResponseData> | undefined;

  if (isLoading) {
    return (
      <Card className='backdrop-blur-lg border rounded-2xl'>
        <CardHeader>
          <CardTitle className='text-tekhelet-400'>Your Target</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-6 w-32' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-6 w-32' />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !typedData?.data) {
    return (
      <Card className='backdrop-blur-lg border rounded-2xl'>
        <CardContent className='p-6'>
          <div className='text-center text-tekhelet-500'>
            <BookOpenIcon className='mx-auto h-12 w-12 text-tekhelet-300 mb-4' />
            <p className='text-lg font-medium mb-2'>No Target Found</p>
            <p className='text-sm'>Set your IELTS targets to start tracking your progress.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const targetConfig = typedData.data;

  return (
    <Card className='backdrop-blur-lg border rounded-2xl'>
      <CardHeader>
        <CardTitle className='text-tekhelet-400 flex items-center gap-2'>
          <Target className='h-5 w-5' />
          Your Target
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Listening Target */}
        <div className='space-y-2'>
          <div className='flex items-center gap-2'>
            <HeadphonesIcon className='h-4 w-4 text-tekhelet-400' />
            <span className='text-sm font-medium text-tekhelet-500'>Listening Target</span>
          </div>
          <div className='flex items-center justify-between'>
            <Badge
              variant='secondary'
              className='bg-selective-yellow-300 text-white text-lg px-3 py-1'
            >
              {targetConfig.listening_target}/9
            </Badge>
            <div className='flex items-center gap-1 text-sm text-tekhelet-500'>
              <CalendarIcon className='h-4 w-4' />
              <span>
                Target: {format(new Date(targetConfig.listening_target_date), 'MMM dd, yyyy')}
              </span>
            </div>
          </div>
        </div>

        {/* Reading Target */}
        <div className='space-y-2'>
          <div className='flex items-center gap-2'>
            <BookOpenIcon className='h-4 w-4 text-tekhelet-400' />
            <span className='text-sm font-medium text-tekhelet-500'>Reading Target</span>
          </div>
          <div className='flex items-center justify-between'>
            <Badge
              variant='secondary'
              className='bg-selective-yellow-300 text-white text-lg px-3 py-1'
            >
              {targetConfig.reading_target}/9
            </Badge>
            <div className='flex items-center gap-1 text-sm text-tekhelet-500'>
              <CalendarIcon className='h-4 w-4' />
              <span>
                Target: {format(new Date(targetConfig.reading_target_date), 'MMM dd, yyyy')}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TargetConfigDisplay;
