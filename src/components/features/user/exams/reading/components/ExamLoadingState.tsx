'use client';

import { Card } from '@/components/ui/card';

export const ExamLoadingState = () => {
  return (
    <div className='min-h-screen bg-medium-slate-blue-900 p-4'>
      <div className='max-w-6xl mx-auto'>
        <Card className='bg-white/70 backdrop-blur-lg border border-tekhelet-200 rounded-2xl shadow-xl p-6'>
          <div className='animate-pulse space-y-4'>
            <div className='h-8 bg-tekhelet-200 rounded w-1/3'></div>
            <div className='h-4 bg-tekhelet-200 rounded w-2/3'></div>
            <div className='space-y-2'>
              <div className='h-4 bg-tekhelet-200 rounded'></div>
              <div className='h-4 bg-tekhelet-200 rounded w-5/6'></div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
