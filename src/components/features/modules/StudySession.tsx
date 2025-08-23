'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useModules } from '@/hooks/apis/modules/useModules';
import { ModuleProgressRequest, ModuleResponse, ModuleSessionTimeRequest } from '@/lib/api/modules';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Clock,
  RotateCcw,
  Star,
  Target,
  Trophy,
  X,
  Zap,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface StudySessionProps {
  module: ModuleResponse;
  onComplete?: () => void;
  onExit?: () => void;
}

interface SessionStats {
  totalCards: number;
  currentCard: number;
  correctAnswers: number;
  incorrectAnswers: number;
  startTime: number;
  sessionTimeSpent: number;
}

export default function StudySession({ module, onComplete, onExit }: StudySessionProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    totalCards: module.flash_card_ids.length,
    currentCard: 1,
    correctAnswers: 0,
    incorrectAnswers: 0,
    startTime: Date.now(),
    sessionTimeSpent: 0,
  });
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [cardStartTime, setCardStartTime] = useState(Date.now());
  const [highlightedMap, setHighlightedMap] = useState<Record<string, boolean>>(() =>
    module.flash_card_ids.reduce<Record<string, boolean>>((acc, fc) => {
      acc[fc.flashcard_id] = Boolean((fc as any).is_highlighted);
      return acc;
    }, {})
  );
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [showResetPrompt, setShowResetPrompt] = useState<boolean>(false);

  const { updateModuleProgress, updateModuleSessionTime, refreshModuleProgress, isLoading } =
    useModules();

  // Timer effect - starts when component mounts, stops when session completes
  useEffect(() => {
    const startTimer = () => {
      timerRef.current = setInterval(() => {
        setSessionStats((prev) => ({
          ...prev,
          sessionTimeSpent: Math.floor((Date.now() - prev.startTime) / 1000),
        }));
      }, 1000);
    };

    const stopTimer = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    if (!sessionCompleted) {
      startTimer();
    } else {
      stopTimer();
      // Final time update when session completes
      setSessionStats((prev) => ({
        ...prev,
        sessionTimeSpent: Math.floor((Date.now() - prev.startTime) / 1000),
      }));
    }

    return () => stopTimer();
  }, [sessionCompleted]);

  // Save on visibility change (tab close/minimize) and before unload
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !sessionCompleted) {
        persistSessionTime();
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!sessionCompleted && sessionStats.sessionTimeSpent > 0) {
        // Fire-and-forget; navigator.sendBeacon could be used, but keep it simple
        persistSessionTime();
        // Optionally show a prompt (mostly ignored by modern browsers, but harmless)
        e.preventDefault();
        e.returnValue = '';
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [sessionCompleted, sessionStats.sessionTimeSpent]);

  // Persist session time
  const persistSessionTime = async () => {
    const payload: ModuleSessionTimeRequest = {
      time_spent: sessionStats.sessionTimeSpent,
    };
    await updateModuleSessionTime(module.module_id, payload);
  };

  // Prompt reset on mount if progress is 100%
  useEffect(() => {
    if (module.progress === 100) {
      setShowResetPrompt(true);
    }
  }, [module.progress]);

  const onConfirmReset = async () => {
    const res = await refreshModuleProgress(module.module_id);
    if (res) {
      // Reset local UI state to start fresh
      handleRestart();
      setShowResetPrompt(false);
    }
  };

  // Helper function to stop timer and exit
  const handleExit = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // Final time update before exit
    setSessionStats((prev) => ({
      ...prev,
      sessionTimeSpent: Math.floor((Date.now() - prev.startTime) / 1000),
    }));
    await persistSessionTime();
    onExit?.();
  };

  const currentCard = module.flash_card_ids[currentCardIndex];
  const isLastCard = currentCardIndex === module.flash_card_ids.length - 1;
  const isCurrentHighlighted = highlightedMap[currentCard.flashcard_id] ?? false;

  const toggleHighlight = () => {
    setHighlightedMap((prev) => ({
      ...prev,
      [currentCard.flashcard_id]: !isCurrentHighlighted,
    }));
  };

  const handleAnswer = async (isCorrect: boolean) => {
    const timeSpent = Math.floor((Date.now() - cardStartTime) / 1000);

    // Update progress on backend
    const progressData: ModuleProgressRequest = {
      flashcard_id: currentCard.flashcard_id,
      is_correct: isCorrect,
      time_spent: timeSpent,
      is_highlighted: isCurrentHighlighted,
    };

    await updateModuleProgress(module.module_id, progressData);

    // Update session stats
    setSessionStats((prev) => ({
      ...prev,
      correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
      incorrectAnswers: !isCorrect ? prev.incorrectAnswers + 1 : prev.incorrectAnswers,
    }));

    // Move to next card or complete session
    if (isLastCard) {
      setSessionCompleted(true);
    } else {
      nextCard();
    }
  };

  const nextCard = () => {
    if (currentCardIndex < module.flash_card_ids.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
      setSessionStats((prev) => ({
        ...prev,
        currentCard: prev.currentCard + 1,
      }));
      setShowAnswer(false);
      setCardStartTime(Date.now());
    }
  };

  const previousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1);
      setSessionStats((prev) => ({
        ...prev,
        currentCard: prev.currentCard - 1,
      }));
      setShowAnswer(false);
      setCardStartTime(Date.now());
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateAccuracy = () => {
    const total = sessionStats.correctAnswers + sessionStats.incorrectAnswers;
    if (total === 0) return 0;
    return Math.round((sessionStats.correctAnswers / total) * 100);
  };

  const handleRestart = () => {
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setSessionCompleted(false);
    setSessionStats({
      totalCards: module.flash_card_ids.length,
      currentCard: 1,
      correctAnswers: 0,
      incorrectAnswers: 0,
      startTime: Date.now(),
      sessionTimeSpent: 0,
    });
    setCardStartTime(Date.now());
  };

  if (sessionCompleted) {
    const accuracy = calculateAccuracy();
    const isExcellent = accuracy >= 80;
    const isGood = accuracy >= 60;

    return (
      <div className='max-w-3xl mx-auto space-y-6 p-6 min-h-screen'>
        <Card className='border rounded-3xl'>
          <CardHeader className='text-center'>
            <div className='flex justify-center mb-4'>
              <Trophy className='h-16 w-16 text-[#0074b7]' />
            </div>
            <CardTitle className='text-3xl font-bold text-[#003b73]'>Session Complete!</CardTitle>
            <CardDescription className='text-[#0074b7] text-lg font-medium'>
              Great job! You've completed the study session for "{module.module_name}"
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Session Summary */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
              <div className='text-center p-6 bg-gradient-to-br from-[#bfd7ed]/30 to-[#60a3d9]/10 rounded-2xl border border-[#60a3d9]/20 backdrop-blur-sm shadow-lg'>
                <Target className='h-8 w-8 text-[#0074b7] mx-auto mb-3' />
                <p className='text-3xl font-bold text-[#003b73]'>{sessionStats.totalCards}</p>
                <p className='text-sm text-[#0074b7] font-medium'>Cards Studied</p>
              </div>
              <div className='text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200 backdrop-blur-sm shadow-lg'>
                <Check className='h-8 w-8 text-green-600 mx-auto mb-3' />
                <p className='text-3xl font-bold text-green-700'>{sessionStats.correctAnswers}</p>
                <p className='text-sm text-green-600 font-medium'>Correct</p>
              </div>
              <div className='text-center p-6 bg-gradient-to-br from-[#60a3d9]/20 to-[#0074b7]/10 rounded-2xl border border-[#60a3d9]/20 backdrop-blur-sm shadow-lg'>
                <Clock className='h-8 w-8 text-[#0074b7] mx-auto mb-3' />
                <p className='text-3xl font-bold text-[#003b73]'>
                  {formatTime(sessionStats.sessionTimeSpent)}
                </p>
                <p className='text-sm text-[#0074b7] font-medium'>Time Spent</p>
              </div>
              <div className='text-center p-6 bg-gradient-to-br from-[#bfd7ed]/40 to-[#60a3d9]/20 rounded-2xl border border-[#60a3d9]/30 backdrop-blur-sm shadow-lg'>
                <Zap className='h-8 w-8 text-[#0074b7] mx-auto mb-3' />
                <p className='text-3xl font-bold text-[#003b73]'>{accuracy}%</p>
                <p className='text-sm text-[#0074b7] font-medium'>Accuracy</p>
              </div>
            </div>

            {/* Performance Message */}
            <div
              className={`p-6 rounded-2xl border backdrop-blur-md shadow-lg ${
                isExcellent
                  ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-300'
                  : isGood
                    ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300'
                    : 'bg-gradient-to-r from-red-50 to-red-100 border-red-300'
              }`}
            >
              <p
                className={`font-bold text-lg ${
                  isExcellent ? 'text-green-700' : isGood ? 'text-yellow-700' : 'text-red-700'
                }`}
              >
                {isExcellent
                  ? '🎉 Excellent work!'
                  : isGood
                    ? '👍 Good job!'
                    : '📚 Keep practicing!'}
              </p>
              <p className='text-sm text-[#0074b7] mt-2 font-medium'>
                {isExcellent
                  ? 'You have great mastery of this vocabulary! Consider helping others by sharing this module.'
                  : isGood
                    ? "You're making good progress. Review the cards you missed and try again."
                    : 'Practice makes perfect. Review the vocabulary and try the session again to improve your score.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className='flex gap-4 justify-center'>
              <Button
                variant='outline'
                onClick={handleRestart}
                className='border-[#60a3d9]/40 text-[#0074b7] hover:bg-[#60a3d9]/10 hover:border-[#0074b7] rounded-xl px-8 py-3 font-medium transition-all duration-200'
                size='lg'
              >
                <RotateCcw className='h-5 w-5 mr-2' />
                Study Again
              </Button>
              <Button
                onClick={() => {
                  persistSessionTime().finally(() => {
                    onComplete?.();
                    toast.success('Progress saved successfully!');
                  });
                }}
                className='bg-gradient-to-r from-[#0074b7] to-[#60a3d9] hover:from-[#003b73] hover:to-[#0074b7] text-white rounded-xl px-8 py-3 font-medium shadow-lg hover:shadow-xl transition-all duration-200'
                size='lg'
              >
                <Check className='h-5 w-5 mr-2' />
                Complete Session
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='max-w-4xl mx-auto space-y-6 p-6 min-h-screen'>
      <AlertDialog open={showResetPrompt} onOpenChange={setShowResetPrompt}>
        <AlertDialogContent className='bg-white/90 backdrop-blur-xl border border-tekhelet-200 rounded-2xl'>
          <AlertDialogHeader>
            <AlertDialogTitle className='text-tekhelet-400'>Reset progress?</AlertDialogTitle>
            <AlertDialogDescription className='text-medium-slate-blue-500'>
              Your progress for "{module.module_name}" is at 100%. Do you want to reset progress to
              start a new study session?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className='border-medium-slate-blue-200 text-medium-slate-blue-600'>
              Keep Progress
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmReset}
              disabled={isLoading.refreshModuleProgress}
              className='bg-tekhelet-400 hover:bg-tekhelet-500 text-white'
            >
              {isLoading.refreshModuleProgress ? 'Resetting...' : 'Reset Progress'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Session Header */}
      <Card className='border'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='text-tekhelet-400 flex items-center font-bold text-xl'>
                <BookOpen className='h-6 w-6 mr-3 text-tekhelet-400' />
                {module.module_name}
              </CardTitle>
              <CardDescription className='text-muted-foreground font-medium text-base mt-1'>
                Card {sessionStats.currentCard} of {sessionStats.totalCards}
              </CardDescription>
            </div>
            <div className='flex items-center gap-3'>
              <div className='flex items-center gap-2'>
                <Clock className='h-5 w-5 text-tekhelet-500' />
                <p className='text-sm text-tekhelet-500 font-semibold'>
                  {formatTime(sessionStats.sessionTimeSpent)}
                </p>
              </div>
              <Button
                size='sm'
                onClick={handleExit}
                className='bg-selective-yellow-200 hover:bg-selective-yellow-300'
              >
                Exit
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <Progress
              value={(sessionStats.currentCard / sessionStats.totalCards) * 100}
              className='h-3 rounded-full'
              indicatorClassName='bg-selective-yellow-400 rounded-full'
            />
            <div className='flex justify-between text-sm text-[#0074b7] font-medium'>
              <p className='text-green-800'>{sessionStats.correctAnswers} correct</p>
              <p className='text-red-800'>{sessionStats.incorrectAnswers} incorrect</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flashcard */}
      <Card className='border min-h-[500px]'>
        <CardContent className='p-10'>
          <div className='text-center space-y-8'>
            {/* Word */}
            <div>
              <h2 className='text-5xl font-bold text-tekhelet-400 mb-4'>
                {currentCard.vocab.word}
              </h2>
              <Badge
                variant='secondary'
                className='text-base px-4 py-2 bg-gradient-to-r from-[#bfd7ed]/50 to-[#60a3d9]/20 text-[#003b73] border-[#60a3d9]/30 rounded-xl font-medium'
              >
                Vocabulary #{currentCardIndex + 1}
              </Badge>
            </div>

            {/* Context */}
            <div className='max-w-2xl mx-auto'>
              <p className='text-xl text-tekhelet-500 italic font-medium leading-relaxed'>
                "{currentCard.vocab.context}"
              </p>
            </div>

            {/* Answer Section */}
            <div className='space-y-6'>
              {!showAnswer ? (
                <Button
                  onClick={() => setShowAnswer(true)}
                  size='lg'
                  variant={'outline'}
                  className='text-selective-yellow-300 hover:text-selective-yellow-300'
                >
                  Show Meaning
                </Button>
              ) : (
                <div className='space-y-8'>
                  <div className='p-8 border rounded-2xl bg-tekhelet-500/10'>
                    <p className='text-2xl text-[#003b73] font-semibold leading-relaxed'>
                      {currentCard.vocab.meaning}
                    </p>
                  </div>

                  {/* Highlight Toggle */}
                  <div className='flex justify-center'>
                    <Button
                      type='button'
                      variant='outline'
                      aria-pressed={isCurrentHighlighted}
                      onClick={toggleHighlight}
                      className={`rounded-xl px-6 py-3 text-base font-medium transition-all duration-200 ${
                        isCurrentHighlighted
                          ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white border-yellow-500 hover:from-yellow-500 hover:to-yellow-600'
                          : 'border-[#60a3d9]/40 text-[#0074b7] hover:bg-[#60a3d9]/10 hover:border-[#0074b7]'
                      }`}
                    >
                      <Star
                        className={`h-5 w-5 mr-2 ${
                          isCurrentHighlighted ? 'fill-white text-white' : 'text-[#0074b7]'
                        }`}
                      />
                      {isCurrentHighlighted ? 'Highlighted' : 'Highlight'}
                    </Button>
                  </div>

                  <div className='flex justify-center space-x-6'>
                    <Button
                      onClick={() => handleAnswer(false)}
                      disabled={isLoading.updateModuleProgress}
                      variant='destructive'
                      size='lg'
                      className='min-w-[150px] rounded-2xl px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200'
                    >
                      <X className='h-6 w-6 mr-3' />
                      Don't Know
                    </Button>
                    <Button
                      onClick={() => handleAnswer(true)}
                      disabled={isLoading.updateModuleProgress}
                      className='bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white min-w-[150px] rounded-2xl px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200'
                      size='lg'
                    >
                      <Check className='h-6 w-6 mr-3' />I Know This
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className='flex justify-between'>
        <Button
          variant='outline'
          onClick={previousCard}
          disabled={currentCardIndex === 0}
          className='border-[#60a3d9]/40 text-[#0074b7] hover:bg-[#60a3d9]/10 hover:border-[#0074b7] rounded-xl px-8 py-3 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
          size='lg'
        >
          <ArrowLeft className='h-5 w-5 mr-2' />
          Previous
        </Button>
        <Button
          variant='outline'
          onClick={nextCard}
          disabled={isLastCard || !showAnswer}
          className='border-[#60a3d9]/40 text-[#0074b7] hover:bg-[#60a3d9]/10 hover:border-[#0074b7] rounded-xl px-8 py-3 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
          size='lg'
        >
          Next
          <ArrowRight className='h-5 w-5 ml-2' />
        </Button>
      </div>
    </div>
  );
}
