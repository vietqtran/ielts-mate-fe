'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ExamErrorStateProps {
  error: string;
}

export const ExamErrorState = ({ error }: ExamErrorStateProps) => {
  const router = useRouter();

  return (
    <div className='min-h-screen bg-medium-slate-blue-900 p-4 flex items-center justify-center'>
      <div className='max-w-md mx-auto'>
        <Card className='bg-white/70 backdrop-blur-lg border border-persimmon-300 rounded-2xl shadow-xl'>
          <CardContent className='p-6 text-center'>
            <XCircle className='w-16 h-16 text-persimmon-500 mx-auto mb-4' />
            <h1 className='text-2xl font-bold text-tekhelet-400 mb-2'>
              Error Loading Exam Details
            </h1>
            <p className='text-tekhelet-500 mb-6'>{error}</p>
            <div className='flex gap-2 justify-center'>
              <Button
                onClick={() => router.push('/history/exams/reading')}
                className='bg-medium-slate-blue-500 hover:bg-medium-slate-blue-400 text-white'
              >
                <ArrowLeft className='w-4 h-4 mr-2' />
                Back to History
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant='outline'
                className='border-tekhelet-300 text-tekhelet-500 hover:bg-tekhelet-100'
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
