'use client';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { AlertTriangle, BookOpen, Clock } from 'lucide-react';
import React from 'react';

export interface PracticeHeaderProps {
  title: string;
  description?: string;
  answered: number;
  total: number;
  timeLeftSec: number;
  onSubmit?: () => void;
  submitting?: boolean;
  saving?: boolean;
  showUnansweredWarning?: boolean;
  unansweredCount?: number;
  className?: string;
  submitText?: string;
  glass?: boolean; // enable glassmorphism by default
  onSave: () => void;
  saveText?: string;
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  const mm = m.toString();
  const ss = s.toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

export const PracticeHeader: React.FC<PracticeHeaderProps> = ({
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
  submitText = 'Submit',
  glass = true,
  onSave,
  saving = false,
  saveText = 'Save Progress',
}) => {
  const progress = total > 0 ? (answered / total) * 100 : 0;

  return (
    <div
      className={cn(
        'w-full border-b',
        glass ? 'bg-white backdrop-blur-lg shadow-sm' : 'bg-white',
        className
      )}
    >
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
          <div className='flex items-center justify-center gap-2 rounded-lg w-30 text-tekhelet-600'>
            <Clock className='w-5 h-5' />
            <span className='text-lg font-semibold'>{formatTime(timeLeftSec)}</span>
          </div>
          <Button
            onClick={onSave}
            className={cn(
              'bg-tangerine-400 hover:bg-tangerine-500 text-white',
              saving && 'opacity-80 cursor-not-allowed'
            )}
            size='lg'
            disabled={saving}
          >
            {saving ? 'Saving...' : saveText}
          </Button>
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
        <div className='flex justify-between text-xs text-medium-slate-blue-300 mb-2'>
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

export default PracticeHeader;
