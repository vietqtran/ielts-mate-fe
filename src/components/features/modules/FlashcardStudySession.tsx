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
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useModules } from '@/hooks/apis/modules/useModules';
import { ModuleProgressRequest, ModuleResponse, ModuleSessionTimeRequest } from '@/lib/api/modules';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Clock,
  Eye,
  EyeOff,
  RotateCcw,
  Star,
  Target,
  Trophy,
  Volume2,
  VolumeX,
  X,
  Zap,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface FlashcardStudySessionProps {
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

export default function FlashcardStudySession({
  module,
  onComplete,
  onExit,
}: FlashcardStudySessionProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
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
  const [isMuted, setIsMuted] = useState(false);
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
        persistSessionTime();
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
      setIsFlipped(false);
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
      setIsFlipped(false);
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
    setIsFlipped(false);
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

  const handleCardFlip = () => {
    setIsFlipped(!isFlipped);
    if (!showAnswer) {
      setShowAnswer(true);
    }
  };

  if (sessionCompleted) {
    const accuracy = calculateAccuracy();
    const isExcellent = accuracy >= 80;
    const isGood = accuracy >= 60;

    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-tekhelet-50 to-medium-slate-blue-50 p-4'>
        <Card className='w-full max-w-4xl border-0 shadow-2xl bg-white/90 backdrop-blur-xl'>
          <CardContent className='p-8'>
            <div className='text-center space-y-8'>
              {/* Trophy Icon */}
              <div className='flex justify-center'>
                <div className='p-6 bg-gradient-to-br from-selective-yellow-200 to-selective-yellow-300 rounded-full'>
                  <Trophy className='h-16 w-16 text-selective-yellow-600' />
                </div>
              </div>

              {/* Title */}
              <div>
                <h1 className='text-4xl font-bold text-tekhelet-400 mb-2'>Session Complete!</h1>
                <p className='text-xl text-medium-slate-blue-500'>
                  Great job! You've completed "{module.module_name}"
                </p>
              </div>

              {/* Stats Grid */}
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                <div className='text-center p-6 bg-gradient-to-br from-tekhelet-100 to-tekhelet-200 rounded-2xl'>
                  <Target className='h-8 w-8 text-tekhelet-400 mx-auto mb-2' />
                  <p className='text-2xl font-bold text-tekhelet-600'>{sessionStats.totalCards}</p>
                  <p className='text-sm text-tekhelet-500 font-medium'>Cards Studied</p>
                </div>
                <div className='text-center p-6 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl'>
                  <Check className='h-8 w-8 text-green-600 mx-auto mb-2' />
                  <p className='text-2xl font-bold text-green-700'>{sessionStats.correctAnswers}</p>
                  <p className='text-sm text-green-600 font-medium'>Correct</p>
                </div>
                <div className='text-center p-6 bg-gradient-to-br from-medium-slate-blue-100 to-medium-slate-blue-200 rounded-2xl'>
                  <Clock className='h-8 w-8 text-medium-slate-blue-600 mx-auto mb-2' />
                  <p className='text-2xl font-bold text-medium-slate-blue-700'>
                    {formatTime(sessionStats.sessionTimeSpent)}
                  </p>
                  <p className='text-sm text-medium-slate-blue-600 font-medium'>Time Spent</p>
                </div>
                <div className='text-center p-6 bg-gradient-to-br from-selective-yellow-100 to-selective-yellow-200 rounded-2xl'>
                  <Zap className='h-8 w-8 text-selective-yellow-600 mx-auto mb-2' />
                  <p className='text-2xl font-bold text-selective-yellow-700'>{accuracy}%</p>
                  <p className='text-sm text-selective-yellow-600 font-medium'>Accuracy</p>
                </div>
              </div>

              {/* Performance Message */}
              <div
                className={`p-6 rounded-2xl ${
                  isExcellent
                    ? 'bg-gradient-to-r from-green-50 to-green-100 border border-green-200'
                    : isGood
                      ? 'bg-gradient-to-r from-selective-yellow-50 to-selective-yellow-100 border border-selective-yellow-200'
                      : 'bg-gradient-to-r from-persimmon-50 to-persimmon-100 border border-persimmon-200'
                }`}
              >
                <p
                  className={`font-bold text-lg ${
                    isExcellent
                      ? 'text-green-700'
                      : isGood
                        ? 'text-selective-yellow-700'
                        : 'text-persimmon-700'
                  }`}
                >
                  {isExcellent
                    ? '🎉 Excellent work!'
                    : isGood
                      ? '👍 Good job!'
                      : '📚 Keep practicing!'}
                </p>
                <p className='text-sm text-medium-slate-blue-600 mt-2'>
                  {isExcellent
                    ? 'You have great mastery of this vocabulary!'
                    : isGood
                      ? "You're making good progress. Review the cards you missed and try again."
                      : 'Practice makes perfect. Review the vocabulary and try the session again to improve your score.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                <Button
                  variant='outline'
                  onClick={handleRestart}
                  className='border-tekhelet-300 text-tekhelet-400 hover:bg-tekhelet-50 rounded-xl px-8 py-3 font-medium'
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
                  className='bg-tekhelet-400 hover:bg-tekhelet-500 text-white rounded-xl px-8 py-3 font-medium'
                  size='lg'
                >
                  <Check className='h-5 w-5 mr-2' />
                  Complete Session
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex flex-col'>
      <AlertDialog open={showResetPrompt} onOpenChange={setShowResetPrompt}>
        <AlertDialogContent className='bg-white/95 backdrop-blur-xl border border-tekhelet-200 rounded-2xl'>
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

      {/* Header */}
      <div className='bg-white/90 backdrop-blur-xl border-b border-tekhelet-200 p-4'>
        <div className='max-w-6xl mx-auto flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            <Button
              variant='ghost'
              onClick={handleExit}
              className='text-tekhelet-400 hover:bg-tekhelet-50'
            >
              <ArrowLeft className='h-5 w-5 mr-2' />
              Exit
            </Button>
            <div>
              <h1 className='text-xl font-bold text-tekhelet-400 flex items-center'>
                <BookOpen className='h-5 w-5 mr-2' />
                {module.module_name}
              </h1>
              <p className='text-sm text-medium-slate-blue-500'>
                Card {sessionStats.currentCard} of {sessionStats.totalCards}
              </p>
            </div>
          </div>

          <div className='flex items-center space-x-4'>
            <div className='flex items-center space-x-2 text-sm text-medium-slate-blue-500'>
              <Clock className='h-4 w-4' />
              <span>{formatTime(sessionStats.sessionTimeSpent)}</span>
            </div>
            <Button
              variant='ghost'
              onClick={() => setIsMuted(!isMuted)}
              className='text-medium-slate-blue-500 hover:bg-medium-slate-blue-50'
            >
              {isMuted ? <VolumeX className='h-4 w-4' /> : <Volume2 className='h-4 w-4' />}
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className='max-w-6xl mx-auto mt-4'>
          <Progress
            value={(sessionStats.currentCard / sessionStats.totalCards) * 100}
            className='h-2 rounded-full'
            indicatorClassName='bg-selective-yellow-400 rounded-full'
          />
          <div className='flex justify-between text-xs text-medium-slate-blue-500 mt-1'>
            <span className='text-green-600 font-medium'>
              {sessionStats.correctAnswers} correct
            </span>
            <span className='text-persimmon-600 font-medium'>
              {sessionStats.incorrectAnswers} incorrect
            </span>
          </div>
        </div>
      </div>

      {/* Main Flashcard Area */}
      <div className='flex-1 flex items-center justify-center p-4'>
        <div className='w-full max-w-4xl'>
          {/* Flashcard */}
          <div className='relative mb-8'>
            <Card
              className='w-full max-w-2xl mx-auto min-h-[400px] hover:shadow-2xl border-2 border-tekhelet-200 bg-white/95 backdrop-blur-xl transition-all duration-300'
              onClick={handleCardFlip}
            >
              <CardContent className='p-12 flex flex-col items-center justify-center h-full text-center'>
                {!isFlipped ? (
                  // Front of card - Vocabulary
                  <div className='space-y-6'>
                    <Badge className='text-sm px-3 py-1 bg-tekhelet-100 text-tekhelet-600'>
                      Vocabulary #{currentCardIndex + 1}
                    </Badge>
                    <h2 className='text-5xl font-bold text-tekhelet-400 leading-tight'>
                      {currentCard.vocab.word}
                    </h2>
                    <div className='max-w-lg'>
                      <p className='text-lg text-medium-slate-blue-500 italic leading-relaxed'>
                        "{currentCard.vocab.context}"
                      </p>
                    </div>
                    <div className='flex items-center space-x-2 text-medium-slate-blue-400'>
                      <Eye className='h-4 w-4' />
                      <span className='text-sm'>Click to reveal meaning</span>
                    </div>
                  </div>
                ) : (
                  // Back of card - Meaning
                  <div className='space-y-6'>
                    <Badge className='text-sm px-3 py-1 bg-selective-yellow-100 text-selective-yellow-600'>
                      Meaning
                    </Badge>
                    <h3 className='text-3xl font-bold text-tekhelet-400 leading-tight'>
                      {currentCard.vocab.meaning}
                    </h3>
                    <div className='max-w-lg'>
                      <p className='text-lg text-medium-slate-blue-500 italic leading-relaxed'>
                        "{currentCard.vocab.context}"
                      </p>
                    </div>
                    <div className='flex items-center space-x-2 text-medium-slate-blue-400'>
                      <EyeOff className='h-4 w-4' />
                      <span className='text-sm'>Click to show vocabulary</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          {showAnswer && (
            <div className='flex flex-col sm:flex-row gap-4 justify-center mb-8'>
              <Button
                onClick={() => handleAnswer(false)}
                disabled={isLoading.updateModuleProgress}
                variant='destructive'
                size='lg'
                className='min-w-[200px] rounded-xl px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl'
              >
                <X className='h-6 w-6 mr-3' />
                Don't Know
              </Button>
              <Button
                onClick={() => handleAnswer(true)}
                disabled={isLoading.updateModuleProgress}
                className='bg-green-500 hover:bg-green-600 text-white min-w-[200px] rounded-xl px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl'
                size='lg'
              >
                <Check className='h-6 w-6 mr-3' />I Know This
              </Button>
            </div>
          )}

          {/* Highlight Toggle */}
          {showAnswer && (
            <div className='flex justify-center mb-8'>
              <Button
                type='button'
                variant='outline'
                onClick={toggleHighlight}
                className={`rounded-xl px-6 py-3 text-base font-medium transition-all duration-200 ${
                  isCurrentHighlighted
                    ? 'bg-selective-yellow-200 text-selective-yellow-700 border-selective-yellow-300'
                    : 'border-tekhelet-300 text-tekhelet-400 hover:bg-tekhelet-50'
                }`}
              >
                <Star
                  className={`h-5 w-5 mr-2 ${
                    isCurrentHighlighted
                      ? 'fill-selective-yellow-600 text-selective-yellow-600'
                      : 'text-tekhelet-400'
                  }`}
                />
                {isCurrentHighlighted ? 'Highlighted' : 'Highlight for Review'}
              </Button>
            </div>
          )}

          {/* Navigation */}
          <div className='flex justify-between items-center'>
            <Button
              variant='outline'
              onClick={previousCard}
              disabled={currentCardIndex === 0}
              className='border-tekhelet-300 text-tekhelet-400 hover:bg-tekhelet-50 rounded-xl px-6 py-3 disabled:opacity-50'
            >
              <ArrowLeft className='h-5 w-5 mr-2' />
              Previous
            </Button>

            <div className='text-center'>
              <p className='text-sm text-medium-slate-blue-500'>
                {currentCardIndex + 1} of {module.flash_card_ids.length}
              </p>
            </div>

            <Button
              variant='outline'
              onClick={nextCard}
              disabled={isLastCard || !showAnswer}
              className='border-tekhelet-300 text-tekhelet-400 hover:bg-tekhelet-50 rounded-xl px-6 py-3 disabled:opacity-50'
            >
              Next
              <ArrowRight className='h-5 w-5 ml-2' />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
