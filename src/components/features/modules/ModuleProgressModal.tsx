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
import { ModuleProgressDetailResponse, ModuleResponse } from '@/lib/api/modules';
import { Award, BarChart3, BookOpen, Clock, Play, Target, TrendingUp, Zap } from 'lucide-react';
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
  const [progress, setProgress] = useState<ModuleProgressDetailResponse | null>(null);
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

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    if (seconds < 60) return `${seconds} seconds`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-gradient-to-r from-tekhelet-400 to-tekhelet-600';
    if (percentage >= 60) return 'bg-gradient-to-r from-tekhelet-600 to-tekhelet-700';
    if (percentage >= 40) return 'bg-gradient-to-r from-tekhelet-700 to-tekhelet-800';
    return 'bg-gradient-to-r from-tekhelet-300 to-tekhelet-500';
  };

  const getProgressLevel = (percentage: number) => {
    if (percentage >= 90) return { level: 'Expert', color: 'text-green-600', icon: Award };
    if (percentage >= 70) return { level: 'Advanced', color: 'text-blue-600', icon: Target };
    if (percentage >= 40)
      return { level: 'Intermediate', color: 'text-yellow-600', icon: BarChart3 };
    return { level: 'Beginner', color: 'text-red-600', icon: BookOpen };
  };

  const getLearningStatusColor = (status: string) => {
    switch (status) {
      case 'MASTERED':
        return 'bg-green-100 text-green-800';
      case 'LEARNING':
        return 'bg-blue-100 text-blue-800';
      case 'NEW':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const progressPercentage = progress?.progress || 0;
  const cardsCompleted =
    progress?.flashcard_progresses?.filter((fp) => fp.status === 2).length || 0;
  const totalCards = module.flash_card_ids.length;
  const timeSpent = progress?.time_spent || 0;
  const learningStatus = progress?.learning_status || 'NEW';
  const attempts = progress?.attempts || 0;

  const levelInfo = getProgressLevel(progressPercentage);
  const LevelIcon = levelInfo.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[700px] bg-white/90 backdrop-blur-xl border border-[#60a3d9]/30 rounded-3xl shadow-2xl max-h-[85vh] overflow-y-auto ring-1 ring-[#60a3d9]/20'>
        <DialogHeader>
          <DialogTitle className='flex items-center space-x-3 text-[#003b73] text-xl font-bold'>
            <TrendingUp className='h-6 w-6 text-[#0074b7]' />
            <span>Progress Details</span>
          </DialogTitle>
          <DialogDescription className='text-[#0074b7] text-base font-medium'>
            Track your learning progress for "{module.module_name}"
          </DialogDescription>
        </DialogHeader>

        {isLoading.getModuleProgress ? (
          <div className='flex justify-center py-12'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-12 w-12 border-4 border-[#bfd7ed] border-t-[#0074b7] mx-auto mb-4'></div>
              <p className='text-[#0074b7] font-medium'>Loading progress...</p>
            </div>
          </div>
        ) : (
          <div className='space-y-6 py-4'>
            {/* Overall Progress */}
            <Card className='bg-gradient-to-br from-[#bfd7ed]/40 to-[#60a3d9]/20 border border-[#60a3d9]/30 rounded-2xl shadow-lg backdrop-blur-sm'>
              <CardHeader>
                <CardTitle className='flex items-center justify-between'>
                  <span className='text-[#003b73] font-bold text-lg'>Overall Progress</span>
                  <div className='flex gap-2'>
                    <Badge
                      className={`text-white font-semibold px-3 py-1 rounded-xl ${getProgressColor(progressPercentage)}`}
                    >
                      {progressPercentage.toFixed(1)}%
                    </Badge>
                    <Badge
                      className={`font-semibold px-3 py-1 rounded-xl ${getLearningStatusColor(learningStatus)}`}
                    >
                      {learningStatus}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <Progress
                  value={progressPercentage}
                  className='h-5 rounded-full'
                  indicatorClassName={`${getProgressColor(progressPercentage)} rounded-full`}
                />
                <div className='flex justify-between text-sm text-[#0074b7] font-medium'>
                  <span>{cardsCompleted} cards completed</span>
                  <span>{totalCards - cardsCompleted} cards remaining</span>
                </div>
              </CardContent>
            </Card>

            {/* Level & Achievement */}
            <Card className='border-[#60a3d9]/30 rounded-2xl shadow-lg bg-white/90 backdrop-blur-sm'>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2 text-[#003b73] font-semibold'>
                  <LevelIcon className='h-5 w-5' />
                  <span>Current Level</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className={`text-2xl font-bold ${levelInfo.color}`}>{levelInfo.level}</p>
                    <p className='text-sm text-[#0074b7] font-medium'>
                      Based on your completion rate
                    </p>
                  </div>
                  {attempts > 0 && (
                    <div className='text-center'>
                      <div className='flex items-center justify-center mb-1'>
                        <Zap className='h-6 w-6 text-yellow-500' />
                      </div>
                      <p className='text-xl font-bold text-yellow-600'>{attempts}</p>
                      <p className='text-xs text-[#0074b7] font-medium'>Study Attempts</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Statistics Grid */}
            <div className='grid grid-cols-2 gap-4'>
              <Card className='border-[#60a3d9]/30 rounded-2xl shadow-lg bg-white/90 backdrop-blur-sm'>
                <CardContent className='p-4 text-center'>
                  <div className='flex items-center justify-center mb-2'>
                    <Target className='h-8 w-8 text-[#003b73] font-semibold' />
                  </div>
                  <p className='text-2xl font-bold text-[#003b73] font-semibold'>
                    {cardsCompleted}
                  </p>
                  <p className='text-sm text-[#0074b7] font-medium'>Cards Mastered</p>
                  <p className='text-xs text-[#60a3d9] font-medium mt-1'>
                    out of {totalCards} total
                  </p>
                </CardContent>
              </Card>

              <Card className='border-[#60a3d9]/30 rounded-2xl shadow-lg bg-white/90 backdrop-blur-sm'>
                <CardContent className='p-4 text-center'>
                  <div className='flex items-center justify-center mb-2'>
                    <Clock className='h-8 w-8 text-[#0074b7] font-bold' />
                  </div>
                  <p className='text-2xl font-bold text-[#0074b7] font-bold'>
                    {formatTime(timeSpent)}
                  </p>
                  <p className='text-sm text-[#0074b7] font-medium'>Total Study Time</p>
                  <p className='text-xs text-[#60a3d9] font-medium mt-1'>across all sessions</p>
                </CardContent>
              </Card>
            </div>

            {/* Flashcard Progress Details */}
            {progress?.flashcard_progresses && progress.flashcard_progresses.length > 0 && (
              <Card className='border-[#60a3d9]/30 rounded-2xl shadow-lg bg-white/90 backdrop-blur-sm'>
                <CardHeader>
                  <CardTitle className='flex items-center space-x-2 text-[#003b73] font-semibold'>
                    <BookOpen className='h-5 w-5' />
                    <span>Flashcard Progress</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    {progress.flashcard_progresses.map((fp) => (
                      <div
                        key={fp.flashcard_id}
                        className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                      >
                        <div className='flex-1'>
                          <p className='font-medium text-[#003b73]'>
                            {fp.flashcard_detail.vocab.word}
                          </p>
                          <p className='text-sm text-[#0074b7]'>
                            {fp.flashcard_detail.vocab.meaning}
                          </p>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Badge
                            className={`text-xs ${
                              fp.status === 2
                                ? 'bg-green-100 text-green-800'
                                : fp.status === 1
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {fp.status === 2 ? 'Mastered' : fp.status === 1 ? 'Learning' : 'New'}
                          </Badge>
                          {fp.is_highlighted && (
                            <Badge className='bg-yellow-100 text-yellow-800 text-xs'>
                              Highlighted
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Next Steps */}
            <Card className='border-[#60a3d9]/30 rounded-2xl shadow-lg bg-white/90 backdrop-blur-sm bg-gradient-to-br from-[#bfd7ed]/30 to-[#60a3d9]/10'>
              <CardHeader>
                <CardTitle className='text-[#003b73] font-semibold'>Next Steps</CardTitle>
                <CardDescription>
                  {progressPercentage < 100
                    ? `Continue studying to complete this module. You're ${(100 - progressPercentage).toFixed(1)}% away from completion!`
                    : 'Congratulations! You have completed this module. Consider reviewing or sharing it with others.'}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}

        <DialogFooter className='gap-3'>
          <Button
            variant='outline'
            onClick={onClose}
            className='border-[#60a3d9]/40 text-[#0074b7] hover:bg-[#60a3d9]/10 hover:border-[#0074b7] rounded-xl px-6 py-3 font-medium transition-all duration-200'
          >
            Close
          </Button>
          {progressPercentage < 100 && (
            <Button
              onClick={() => {
                onStartStudy?.();
                onClose();
              }}
              className='bg-gradient-to-r from-[#0074b7] to-[#60a3d9] hover:from-[#003b73] hover:to-[#0074b7] text-white rounded-xl px-6 py-3 font-medium shadow-lg hover:shadow-xl transition-all duration-200'
            >
              <Play className='h-5 w-5 mr-2' />
              Continue Studying
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
