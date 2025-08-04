'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useModules } from '@/hooks/apis/modules/useModules';
import { ModuleProgressRequest, ModuleResponse } from '@/lib/api/modules';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Clock,
  RotateCcw,
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
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { updateModuleProgress, isLoading } = useModules();

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

  // Helper function to stop timer and exit
  const handleExit = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // Final time update before exit
    setSessionStats((prev) => ({
      ...prev,
      sessionTimeSpent: Math.floor((Date.now() - prev.startTime) / 1000),
    }));
    onExit?.();
  };

  const currentCard = module.flash_card_ids[currentCardIndex];
  const isLastCard = currentCardIndex === module.flash_card_ids.length - 1;

  const handleAnswer = async (isCorrect: boolean) => {
    const timeSpent = Math.floor((Date.now() - cardStartTime) / 1000);

    // Update progress on backend
    const progressData: ModuleProgressRequest = {
      flashcard_id: currentCard.flashcard_id,
      is_correct: isCorrect,
      time_spent: timeSpent,
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
      setSessionStats((prev) => ({ ...prev, currentCard: prev.currentCard + 1 }));
      setShowAnswer(false);
      setCardStartTime(Date.now());
    }
  };

  const previousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1);
      setSessionStats((prev) => ({ ...prev, currentCard: prev.currentCard - 1 }));
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
      <div className='max-w-3xl mx-auto space-y-6 p-6 bg-gradient-to-br from-[#bfd7ed]/30 to-[#60a3d9]/10 min-h-screen'>
        <Card className='bg-white/90 backdrop-blur-xl border border-[#60a3d9]/30 rounded-3xl shadow-2xl ring-1 ring-[#60a3d9]/20'>
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
                  onComplete?.();
                  toast.success('Progress saved successfully!');
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
    <div className='max-w-4xl mx-auto space-y-6 p-6 bg-gradient-to-br from-[#bfd7ed]/30 to-[#60a3d9]/10 min-h-screen'>
      {/* Session Header */}
      <Card className='bg-white/90 backdrop-blur-xl border border-[#60a3d9]/30 rounded-3xl shadow-2xl ring-1 ring-[#60a3d9]/20'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='text-[#003b73] flex items-center font-bold text-xl'>
                <BookOpen className='h-6 w-6 mr-3 text-[#0074b7]' />
                {module.module_name}
              </CardTitle>
              <CardDescription className='text-[#0074b7] font-medium text-base mt-1'>
                Card {sessionStats.currentCard} of {sessionStats.totalCards}
              </CardDescription>
            </div>
            <div className='text-right'>
              <div className='flex items-center space-x-2 mb-2'>
                <Clock className='h-5 w-5 text-[#0074b7]' />
                <span className='text-sm text-[#003b73] font-semibold'>
                  {formatTime(sessionStats.sessionTimeSpent)}
                </span>
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={handleExit}
                className='border-[#60a3d9]/40 text-[#0074b7] hover:bg-[#60a3d9]/10 hover:border-[#0074b7] rounded-xl transition-all duration-200'
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
              indicatorClassName='bg-gradient-to-r from-[#0074b7] to-[#60a3d9] rounded-full'
            />
            <div className='flex justify-between text-sm text-[#0074b7] font-medium'>
              <span>✓ {sessionStats.correctAnswers} correct</span>
              <span>✗ {sessionStats.incorrectAnswers} incorrect</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flashcard */}
      <Card className='bg-white/90 backdrop-blur-xl border border-[#60a3d9]/30 rounded-3xl shadow-2xl ring-1 ring-[#60a3d9]/20 min-h-[500px]'>
        <CardContent className='p-10'>
          <div className='text-center space-y-8'>
            {/* Word */}
            <div>
              <h2 className='text-5xl font-bold text-[#003b73] mb-4'>{currentCard.vocab.word}</h2>
              <Badge
                variant='secondary'
                className='text-base px-4 py-2 bg-gradient-to-r from-[#bfd7ed]/50 to-[#60a3d9]/20 text-[#003b73] border-[#60a3d9]/30 rounded-xl font-medium'
              >
                Vocabulary #{currentCardIndex + 1}
              </Badge>
            </div>

            {/* Context */}
            <div className='max-w-2xl mx-auto'>
              <p className='text-xl text-[#0074b7] italic font-medium leading-relaxed'>
                "{currentCard.vocab.context}"
              </p>
            </div>

            {/* Answer Section */}
            <div className='space-y-6'>
              {!showAnswer ? (
                <Button
                  onClick={() => setShowAnswer(true)}
                  className='bg-gradient-to-r from-[#0074b7] to-[#60a3d9] hover:from-[#003b73] hover:to-[#0074b7] text-white rounded-2xl px-12 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-200'
                  size='lg'
                >
                  Show Meaning
                </Button>
              ) : (
                <div className='space-y-8'>
                  <div className='p-8 bg-gradient-to-br from-[#bfd7ed]/40 to-[#60a3d9]/20 border border-[#60a3d9]/30 rounded-2xl backdrop-blur-md shadow-lg'>
                    <p className='text-2xl text-[#003b73] font-semibold leading-relaxed'>
                      {currentCard.vocab.meaning}
                    </p>
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
