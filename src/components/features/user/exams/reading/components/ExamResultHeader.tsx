'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, Trophy } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ExamResultHeaderProps {
  title?: string;
  subtitle?: string;
  backUrl?: string;
}

export const ExamResultHeader = ({
  title = 'Exam Results',
  subtitle = 'Detailed analysis of your performance',
  backUrl = '/history/exams/reading',
}: ExamResultHeaderProps) => {
  const router = useRouter();

  return (
    <div className='flex items-center justify-between mb-6'>
      <div className='flex gap-3 items-center'>
        <Trophy className='w-8 h-8 text-selective-yellow-400' />
        <div>
          <h1 className='text-3xl font-bold text-tekhelet-400'>{title}</h1>
          <p className='text-medium-slate-blue-300'>{subtitle}</p>
        </div>
      </div>
      <div className='flex gap-2'>
        <Button
          variant='outline'
          onClick={() => router.push(backUrl)}
          className='bg-medium-slate-blue-400 text-white backdrop-blur-sm hover:bg-medium-slate-blue-300 hover:text-white'
        >
          <ArrowLeft className='w-4 h-4' />
          Back
        </Button>
        <Button
          onClick={() => router.push('/')}
          className='bg-selective-yellow-300 hover:bg-selective-yellow-200 text-white font-medium'
        >
          <Home className='w-4 h-4 mr-2' />
          Home
        </Button>
      </div>
    </div>
  );
};
