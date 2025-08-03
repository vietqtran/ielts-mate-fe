'use client';

import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ModuleProgressResponse } from '@/lib/api/modules';
import { Clock, Target, TrendingUp, Zap } from 'lucide-react';

interface ModuleProgressBarProps {
  progress?: ModuleProgressResponse;
  totalCards: number;
  compact?: boolean;
}

export default function ModuleProgressBar({
  progress,
  totalCards,
  compact = false,
}: ModuleProgressBarProps) {
  const progressPercentage = progress?.progress_percentage || 0;
  const cardsCompleted = progress?.cards_completed || 0;
  const timeSpent = progress?.time_spent || 0;
  const streakCount = progress?.streak_count || 0;

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (compact) {
    return (
      <div className='space-y-2'>
        <div className='flex items-center justify-between text-sm'>
          <span className='text-medium-slate-blue-500'>Progress</span>
          <span className='text-tekhelet-400 font-medium'>{progressPercentage.toFixed(1)}%</span>
        </div>
        <Progress
          value={progressPercentage}
          className='h-2'
          indicatorClassName={getProgressColor(progressPercentage)}
        />
        <div className='flex items-center justify-between text-xs text-medium-slate-blue-500'>
          <span>
            {cardsCompleted}/{totalCards} cards
          </span>
          {streakCount > 0 && (
            <Badge variant='secondary' className='h-4 text-xs'>
              <Zap className='h-2 w-2 mr-1' />
              {streakCount}
            </Badge>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4 p-4 bg-gradient-to-r from-tekhelet-50 to-medium-slate-blue-50 rounded-lg border border-tekhelet-200'>
      {/* Progress Header */}
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold text-tekhelet-400 flex items-center'>
          <TrendingUp className='h-5 w-5 mr-2' />
          Learning Progress
        </h3>
        <Badge
          className={`text-white ${
            progressPercentage >= 80
              ? 'bg-green-500'
              : progressPercentage >= 60
                ? 'bg-yellow-500'
                : progressPercentage >= 40
                  ? 'bg-orange-500'
                  : 'bg-red-500'
          }`}
        >
          {progressPercentage.toFixed(1)}%
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className='space-y-2'>
        <Progress
          value={progressPercentage}
          className='h-3'
          indicatorClassName={getProgressColor(progressPercentage)}
        />
        <div className='flex justify-between text-sm text-medium-slate-blue-600'>
          <span>{cardsCompleted} completed</span>
          <span>{totalCards - cardsCompleted} remaining</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-3 gap-4'>
        <div className='text-center p-3 bg-white rounded-lg border border-tekhelet-200'>
          <div className='flex items-center justify-center mb-1'>
            <Target className='h-4 w-4 text-tekhelet-400' />
          </div>
          <div className='text-lg font-semibold text-tekhelet-400'>{cardsCompleted}</div>
          <div className='text-xs text-medium-slate-blue-500'>Cards Done</div>
        </div>

        <div className='text-center p-3 bg-white rounded-lg border border-tekhelet-200'>
          <div className='flex items-center justify-center mb-1'>
            <Clock className='h-4 w-4 text-selective-yellow-500' />
          </div>
          <div className='text-lg font-semibold text-selective-yellow-500'>
            {formatTime(timeSpent)}
          </div>
          <div className='text-xs text-medium-slate-blue-500'>Study Time</div>
        </div>

        <div className='text-center p-3 bg-white rounded-lg border border-tekhelet-200'>
          <div className='flex items-center justify-center mb-1'>
            <Zap className='h-4 w-4 text-persimmon-500' />
          </div>
          <div className='text-lg font-semibold text-persimmon-500'>{streakCount}</div>
          <div className='text-xs text-medium-slate-blue-500'>Streak</div>
        </div>
      </div>

      {/* Last Studied */}
      {progress?.last_studied && (
        <div className='text-xs text-medium-slate-blue-500 text-center'>
          Last studied: {new Date(progress.last_studied).toLocaleString()}
        </div>
      )}
    </div>
  );
}
