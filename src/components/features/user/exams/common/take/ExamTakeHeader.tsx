'use client';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { AlertTriangle, BookOpen, Clock } from 'lucide-react';
import React from 'react';

export interface ExamTakeHeaderProps {
  title: string;
  description?: string;
  answered: number;
  total: number;
  timeLeftSec: number;
  onSubmit?: () => void;
  submitting?: boolean;
  showUnansweredWarning?: boolean;
  unansweredCount?: number;
  className?: string;
  submitText?: string;
  glass?: boolean; // enable glassmorphism by default
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  const mm = m.toString();
  const ss = s.toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

export const ExamTakeHeader: React.FC<ExamTakeHeaderProps> = ({
  title,
  description,
  answered,
  total,
  timeLeftSec,
  onSubmit,
  submitting = false,
  showUnansweredWarning = false,
  unansweredCount = 0,
  className,
  submitText = 'Submit Exam',
  glass = true,
}) => {
  const progress = total > 0 ? (answered / total) * 100 : 0;

  const getTimerColor = () => {
    if (timeLeftSec <= 300) return 'text-persimmon-600'; // last 5m
    if (timeLeftSec <= 600) return 'text-tangerine-600'; // last 10m
    return 'text-tekhelet-600';
  };

  const timerFrameClasses = () => {
    if (timeLeftSec <= 300) return 'border-persimmon-300 bg-persimmon-50';
    if (timeLeftSec <= 600) return 'border-tangerine-300 bg-tangerine-50';
    return 'border-tekhelet-300 bg-tekhelet-50';
  };

  return (
    <div className='w-full border-b bg-white'>
      <div className='grid grid-cols-2 md:grid-cols-3 items-center p-4 gap-4'>
        <div className='col-span-1 min-w-0'>
          <h1 className='text-xl font-bold text-tekhelet-600 truncate'>{title}</h1>
          {description && (
            <p className='text-sm text-medium-slate-blue-500 mt-1 truncate'>{description}</p>
          )}
        </div>

        <div className='col-span-1 flex items-center gap-6 justify-center'>
          <div className='flex items-center gap-2'>
            <BookOpen className='w-4 h-4 text-medium-slate-blue-400' />
            <span className='text-sm font-medium text-tekhelet-600'>
              {answered}/{total} questions
            </span>
          </div>
        </div>

        <div className='col-span-1 gap-2 flex justify-end'>
          <div
            className={cn(
              'flex items-center justify-center gap-2 rounded-lg w-30',
              timerFrameClasses()
            )}
          >
            <Clock className={cn('w-5 h-5', getTimerColor())} />
            <span className={cn('text-lg font-bold', getTimerColor())}>
              {formatTime(timeLeftSec)}
            </span>
          </div>
          <Button
            onClick={onSubmit}
            className={cn(
              'bg-tekhelet-500 hover:bg-tekhelet-600 text-white',
              submitting && 'opacity-80 cursor-not-allowed'
            )}
            size='lg'
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : submitText}
          </Button>
        </div>
      </div>

      <div className='px-4 pb-4'>
        <div className='flex justify-between text-xs text-medium-slate-blue-500 mb-2'>
          <span>Progress: {Math.round(progress)}%</span>
          {showUnansweredWarning && unansweredCount > 0 && (
            <span className='flex items-center gap-1 text-tangerine-300'>
              <AlertTriangle className='w-3 h-3' />
              {unansweredCount} unanswered
            </span>
          )}
        </div>
        <Progress value={progress} className='h-2 [&>div]:bg-selective-yellow-400' />
      </div>
    </div>
  );
};

export default ExamTakeHeader;
