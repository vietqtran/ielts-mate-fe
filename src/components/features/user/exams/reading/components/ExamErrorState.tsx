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
    <div className='min-h-screen p-4 flex items-center justify-center'>
      <div className='max-w-md mx-auto'>
        <Card>
          <CardContent className='p-6 text-center'>
            <XCircle className='w-16 h-16 text-persimmon-500 mx-auto mb-4' />
            <h1 className='text-2xl font-bold text-tekhelet-400 mb-2'>
              Error Loading Exam Details
            </h1>
            <p className='text-tekhelet-500 mb-6'>{error}</p>
            <div className='flex gap-2 justify-center'>
              <Button
                onClick={() => router.push('/history/exams/reading')}
                className='bg-tekhelet-400 hover:bg-tekhelet-500 text-white'
              >
                <ArrowLeft className='w-4 h-4 mr-2' />
                Back to History
              </Button>
              <Button
                onClick={() => window.location.reload()}
                className='bg-selective-yellow-300 hover:bg-selective-yellow-400 text-white'
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
