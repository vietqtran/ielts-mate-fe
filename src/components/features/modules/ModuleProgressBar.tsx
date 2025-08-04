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
    if (percentage >= 80) return 'bg-gradient-to-r from-[#0074b7] to-[#60a3d9]';
    if (percentage >= 60) return 'bg-gradient-to-r from-[#60a3d9] to-[#bfd7ed]';
    if (percentage >= 40) return 'bg-gradient-to-r from-[#bfd7ed] to-[#60a3d9]';
    return 'bg-gradient-to-r from-[#003b73] to-[#0074b7]';
  };

  if (compact) {
    return (
      <div className='space-y-3 p-3 bg-white/90 backdrop-blur-xl border border-[#60a3d9]/30 rounded-2xl shadow-lg'>
        <div className='flex items-center justify-between text-sm'>
          <span className='text-[#0074b7] font-medium'>Progress</span>
          <span className='text-[#003b73] font-semibold'>{progressPercentage.toFixed(1)}%</span>
        </div>
        <Progress
          value={progressPercentage}
          className='h-3 rounded-full'
          indicatorClassName={`${getProgressColor(progressPercentage)} rounded-full`}
        />
        <div className='flex items-center justify-between text-xs text-[#0074b7]'>
          <span>
            {cardsCompleted}/{totalCards} cards
          </span>
          {streakCount > 0 && (
            <Badge
              variant='secondary'
              className='h-5 text-xs bg-gradient-to-r from-[#60a3d9]/20 to-[#0074b7]/10 text-[#003b73] border-[#60a3d9]/30'
            >
              <Zap className='h-3 w-3 mr-1 text-[#0074b7]' />
              {streakCount}
            </Badge>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6 p-6 bg-white/90 backdrop-blur-xl rounded-3xl border border-[#60a3d9]/30 shadow-2xl ring-1 ring-[#60a3d9]/20'>
      {/* Progress Header */}
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold text-[#003b73] flex items-center'>
          <TrendingUp className='h-5 w-5 mr-2 text-[#0074b7]' />
          Learning Progress
        </h3>
        <Badge
          className={`text-white font-semibold px-3 py-1 rounded-xl ${
            progressPercentage >= 80
              ? 'bg-gradient-to-r from-[#0074b7] to-[#60a3d9]'
              : progressPercentage >= 60
                ? 'bg-gradient-to-r from-[#60a3d9] to-[#bfd7ed]'
                : progressPercentage >= 40
                  ? 'bg-gradient-to-r from-[#bfd7ed] to-[#60a3d9]'
                  : 'bg-gradient-to-r from-[#003b73] to-[#0074b7]'
          }`}
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
        <div className='flex justify-between text-sm text-[#0074b7] font-medium'>
          <span>{cardsCompleted} completed</span>
          <span>{totalCards - cardsCompleted} remaining</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-3 gap-4'>
        <div className='text-center p-4 bg-gradient-to-br from-[#bfd7ed]/30 to-[#60a3d9]/10 rounded-2xl border border-[#60a3d9]/20 backdrop-blur-sm'>
          <div className='flex items-center justify-center mb-2'>
            <Target className='h-5 w-5 text-[#0074b7]' />
          </div>
          <div className='text-lg font-bold text-[#003b73]'>{cardsCompleted}</div>
          <div className='text-xs text-[#0074b7] font-medium'>Cards Done</div>
        </div>

        <div className='text-center p-4 bg-gradient-to-br from-[#bfd7ed]/30 to-[#60a3d9]/10 rounded-2xl border border-[#60a3d9]/20 backdrop-blur-sm'>
          <div className='flex items-center justify-center mb-2'>
            <Clock className='h-5 w-5 text-[#60a3d9]' />
          </div>
          <div className='text-lg font-bold text-[#003b73]'>{formatTime(timeSpent)}</div>
          <div className='text-xs text-[#0074b7] font-medium'>Study Time</div>
        </div>

        <div className='text-center p-4 bg-gradient-to-br from-[#bfd7ed]/30 to-[#60a3d9]/10 rounded-2xl border border-[#60a3d9]/20 backdrop-blur-sm'>
          <div className='flex items-center justify-center mb-2'>
            <Zap className='h-5 w-5 text-[#0074b7]' />
          </div>
          <div className='text-lg font-bold text-[#003b73]'>{streakCount}</div>
          <div className='text-xs text-[#0074b7] font-medium'>Streak</div>
        </div>
      </div>

      {/* Last Studied */}
      {progress?.last_studied && (
        <div className='text-xs text-[#0074b7] text-center font-medium'>
          Last studied: {new Date(progress.last_studied).toLocaleString()}
        </div>
      )}
    </div>
  );
}
