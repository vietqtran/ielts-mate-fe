'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useModules } from '@/hooks/apis/modules/useModules';
import { ModuleProgressResponse, ModuleResponse } from '@/lib/api/modules';
import {
  Award,
  BarChart3,
  BookOpen,
  Calendar,
  Clock,
  Play,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface ModuleProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  module: ModuleResponse;
  onStartStudy?: () => void;
}

export default function ModuleProgressModal({
  isOpen,
  onClose,
  module,
  onStartStudy,
}: ModuleProgressModalProps) {
  const [progress, setProgress] = useState<ModuleProgressResponse | null>(null);
  const { getModuleProgress, isLoading } = useModules();

  useEffect(() => {
    if (isOpen && module) {
      fetchProgress();
    }
  }, [isOpen, module]);

  const fetchProgress = async () => {
    const result = await getModuleProgress(module.module_id);
    if (result?.data) {
      setProgress(result.data);
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds} seconds`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getProgressLevel = (percentage: number) => {
    if (percentage >= 90) return { level: 'Expert', color: 'text-green-600', icon: Award };
    if (percentage >= 70) return { level: 'Advanced', color: 'text-blue-600', icon: Target };
    if (percentage >= 40)
      return { level: 'Intermediate', color: 'text-yellow-600', icon: BarChart3 };
    return { level: 'Beginner', color: 'text-red-600', icon: BookOpen };
  };

  const progressPercentage = progress?.progress_percentage || 0;
  const cardsCompleted = progress?.cards_completed || 0;
  const totalCards = module.flash_card_ids.length;
  const timeSpent = progress?.time_spent || 0;
  const streakCount = progress?.streak_count || 0;

  const levelInfo = getProgressLevel(progressPercentage);
  const LevelIcon = levelInfo.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[600px] bg-white/95 backdrop-blur-lg border border-tekhelet-200 max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center space-x-2 text-tekhelet-400'>
            <TrendingUp className='h-5 w-5' />
            <span>Progress Details</span>
          </DialogTitle>
          <DialogDescription className='text-medium-slate-blue-500'>
            Track your learning progress for "{module.module_name}"
          </DialogDescription>
        </DialogHeader>

        {isLoading.getModuleProgress ? (
          <div className='flex justify-center py-8'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-tekhelet-400 mx-auto mb-4'></div>
              <p className='text-medium-slate-blue-500'>Loading progress...</p>
            </div>
          </div>
        ) : (
          <div className='space-y-6 py-4'>
            {/* Overall Progress */}
            <Card className='bg-gradient-to-r from-tekhelet-50 to-medium-slate-blue-50 border-tekhelet-200'>
              <CardHeader>
                <CardTitle className='flex items-center justify-between'>
                  <span className='text-tekhelet-400'>Overall Progress</span>
                  <Badge className={`text-white ${getProgressColor(progressPercentage)}`}>
                    {progressPercentage.toFixed(1)}%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <Progress
                  value={progressPercentage}
                  className='h-4'
                  indicatorClassName={getProgressColor(progressPercentage)}
                />
                <div className='flex justify-between text-sm text-medium-slate-blue-600'>
                  <span>{cardsCompleted} cards completed</span>
                  <span>{totalCards - cardsCompleted} cards remaining</span>
                </div>
              </CardContent>
            </Card>

            {/* Level & Achievement */}
            <Card className='border-tekhelet-200'>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2 text-tekhelet-400'>
                  <LevelIcon className='h-5 w-5' />
                  <span>Current Level</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className={`text-2xl font-bold ${levelInfo.color}`}>{levelInfo.level}</p>
                    <p className='text-sm text-medium-slate-blue-500'>
                      Based on your completion rate
                    </p>
                  </div>
                  {streakCount > 0 && (
                    <div className='text-center'>
                      <div className='flex items-center justify-center mb-1'>
                        <Zap className='h-6 w-6 text-yellow-500' />
                      </div>
                      <p className='text-xl font-bold text-yellow-600'>{streakCount}</p>
                      <p className='text-xs text-medium-slate-blue-500'>Study Streak</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Statistics Grid */}
            <div className='grid grid-cols-2 gap-4'>
              <Card className='border-tekhelet-200'>
                <CardContent className='p-4 text-center'>
                  <div className='flex items-center justify-center mb-2'>
                    <Target className='h-8 w-8 text-tekhelet-400' />
                  </div>
                  <p className='text-2xl font-bold text-tekhelet-400'>{cardsCompleted}</p>
                  <p className='text-sm text-medium-slate-blue-500'>Cards Mastered</p>
                  <p className='text-xs text-medium-slate-blue-400 mt-1'>
                    out of {totalCards} total
                  </p>
                </CardContent>
              </Card>

              <Card className='border-tekhelet-200'>
                <CardContent className='p-4 text-center'>
                  <div className='flex items-center justify-center mb-2'>
                    <Clock className='h-8 w-8 text-selective-yellow-500' />
                  </div>
                  <p className='text-2xl font-bold text-selective-yellow-500'>
                    {formatTime(timeSpent)}
                  </p>
                  <p className='text-sm text-medium-slate-blue-500'>Total Study Time</p>
                  <p className='text-xs text-medium-slate-blue-400 mt-1'>across all sessions</p>
                </CardContent>
              </Card>
            </div>

            {/* Last Study Session */}
            {progress?.last_studied && (
              <Card className='border-tekhelet-200'>
                <CardHeader>
                  <CardTitle className='flex items-center space-x-2 text-tekhelet-400'>
                    <Calendar className='h-5 w-5' />
                    <span>Last Study Session</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-medium-slate-blue-600'>
                    {new Date(progress.last_studied).toLocaleString()}
                  </p>
                  <p className='text-sm text-medium-slate-blue-500 mt-1'>
                    Keep up the momentum! Regular practice leads to better retention.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Next Steps */}
            <Card className='border-tekhelet-200 bg-blue-50'>
              <CardHeader>
                <CardTitle className='text-tekhelet-400'>Next Steps</CardTitle>
                <CardDescription>
                  {progressPercentage < 100
                    ? `Continue studying to complete this module. You're ${(100 - progressPercentage).toFixed(1)}% away from completion!`
                    : 'Congratulations! You have completed this module. Consider reviewing or sharing it with others.'}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}

        <DialogFooter>
          <Button
            variant='outline'
            onClick={onClose}
            className='border-medium-slate-blue-200 text-medium-slate-blue-600'
          >
            Close
          </Button>
          {progressPercentage < 100 && (
            <Button
              onClick={() => {
                onStartStudy?.();
                onClose();
              }}
              className='bg-tekhelet-400 hover:bg-tekhelet-500 text-white'
            >
              <Play className='h-4 w-4 mr-2' />
              Continue Studying
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
