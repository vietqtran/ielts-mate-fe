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

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-gradient-to-r from-tekhelet-400 to-tekhelet-600';
    if (percentage >= 60) return 'bg-gradient-to-r from-tekhelet-600 to-tekhelet-700';
    if (percentage >= 40) return 'bg-gradient-to-r from-tekhelet-700 to-tekhelet-800';
    return 'bg-gradient-to-r from-tekhelet-300 to-tekhelet-500';
  };

  if (compact) {
    return (
      <div className='space-y-3 p-3 bg-white/90 backdrop-blur-xl border border-tekhelet-900 rounded-2xl shadow-lg'>
        <div className='flex items-center justify-between text-sm'>
          <span className='text-tekhelet-500 font-medium'>Progress</span>
          <span className='text-tekhelet-400 font-semibold'>{progressPercentage.toFixed(1)}%</span>
        </div>
        <Progress
          value={progressPercentage}
          className='h-3 rounded-full'
          indicatorClassName={`${getProgressColor(progressPercentage)} rounded-full`}
        />
        <div className='flex items-center justify-between text-xs text-tekhelet-500'>
          <span>
            {cardsCompleted}/{totalCards} cards
          </span>
          {streakCount > 0 && (
            <Badge
              variant='secondary'
              className='h-5 text-xs bg-tekhelet-900/60 text-tekhelet-400 border-tekhelet-900'
            >
              <Zap className='h-3 w-3 mr-1 text-tekhelet-500' />
              {streakCount}
            </Badge>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6 p-6 bg-white/90 backdrop-blur-xl rounded-3xl border border-tekhelet-900 shadow-2xl ring-1 ring-tekhelet-900/20'>
      {/* Progress Header */}
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold text-tekhelet-400 flex items-center'>
          <TrendingUp className='h-5 w-5 mr-2 text-tekhelet-500' />
          Learning Progress
        </h3>
        <Badge
          className={`text-white font-semibold px-3 py-1 rounded-xl ${getProgressColor(progressPercentage)}`}
        >
          {progressPercentage.toFixed(1)}%
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className='space-y-3'>
        <Progress
          value={progressPercentage}
          className='h-4 rounded-full'
          indicatorClassName={`${getProgressColor(progressPercentage)} rounded-full`}
        />
        <div className='flex justify-between text-sm text-tekhelet-500 font-medium'>
          <span>{cardsCompleted} completed</span>
          <span>{totalCards - cardsCompleted} remaining</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-3 gap-4'>
        <div className='text-center p-4 bg-tekhelet-900/60 backdrop-blur-sm rounded-2xl border border-tekhelet-900'>
          <div className='flex items-center justify-center mb-2'>
            <Target className='h-5 w-5 text-tekhelet-500' />
          </div>
          <div className='text-lg font-bold text-tekhelet-400'>{cardsCompleted}</div>
          <div className='text-xs text-tekhelet-500 font-medium'>Cards Done</div>
        </div>

        <div className='text-center p-4 bg-tekhelet-900/60 backdrop-blur-sm rounded-2xl border border-tekhelet-900'>
          <div className='flex items-center justify-center mb-2'>
            <Clock className='h-5 w-5 text-tekhelet-500' />
          </div>
          <div className='text-lg font-bold text-tekhelet-400'>{formatTime(timeSpent)}</div>
          <div className='text-xs text-tekhelet-500 font-medium'>Study Time</div>
        </div>

        <div className='text-center p-4 bg-tekhelet-900/60 backdrop-blur-sm rounded-2xl border border-tekhelet-900'>
          <div className='flex items-center justify-center mb-2'>
            <Zap className='h-5 w-5 text-tekhelet-500' />
          </div>
          <div className='text-lg font-bold text-tekhelet-400'>{streakCount}</div>
          <div className='text-xs text-tekhelet-500 font-medium'>Streak</div>
        </div>
      </div>

      {/* Last Studied */}
      {progress?.last_studied && (
        <div className='text-xs text-tekhelet-500 text-center font-medium'>
          Last studied: {new Date(progress.last_studied).toLocaleString()}
        </div>
      )}
    </div>
  );
}
