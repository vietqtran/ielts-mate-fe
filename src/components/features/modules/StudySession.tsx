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
      <div className='max-w-2xl mx-auto space-y-6'>
        <Card className='bg-gradient-to-r from-green-50 to-blue-50 border-green-200'>
          <CardHeader className='text-center'>
            <div className='flex justify-center mb-4'>
              <Trophy className='h-16 w-16 text-yellow-500' />
            </div>
            <CardTitle className='text-2xl text-green-600'>Session Complete!</CardTitle>
            <CardDescription>
              Great job! You've completed the study session for "{module.module_name}"
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Session Summary */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              <div className='text-center p-4 bg-white rounded-lg border'>
                <Target className='h-6 w-6 text-tekhelet-400 mx-auto mb-2' />
                <p className='text-2xl font-bold text-tekhelet-400'>{sessionStats.totalCards}</p>
                <p className='text-sm text-medium-slate-blue-500'>Cards Studied</p>
              </div>
              <div className='text-center p-4 bg-white rounded-lg border'>
                <Check className='h-6 w-6 text-green-500 mx-auto mb-2' />
                <p className='text-2xl font-bold text-green-600'>{sessionStats.correctAnswers}</p>
                <p className='text-sm text-medium-slate-blue-500'>Correct</p>
              </div>
              <div className='text-center p-4 bg-white rounded-lg border'>
                <Clock className='h-6 w-6 text-blue-500 mx-auto mb-2' />
                <p className='text-2xl font-bold text-blue-600'>
                  {formatTime(sessionStats.sessionTimeSpent)}
                </p>
                <p className='text-sm text-medium-slate-blue-500'>Time Spent</p>
              </div>
              <div className='text-center p-4 bg-white rounded-lg border'>
                <Zap className='h-6 w-6 text-yellow-500 mx-auto mb-2' />
                <p className='text-2xl font-bold text-yellow-600'>{accuracy}%</p>
                <p className='text-sm text-medium-slate-blue-500'>Accuracy</p>
              </div>
            </div>

            {/* Performance Message */}
            <div
              className={`p-4 rounded-lg border ${
                isExcellent
                  ? 'bg-green-50 border-green-200'
                  : isGood
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-red-50 border-red-200'
              }`}
            >
              <p
                className={`font-medium ${
                  isExcellent ? 'text-green-600' : isGood ? 'text-yellow-600' : 'text-red-600'
                }`}
              >
                {isExcellent
                  ? '🎉 Excellent work!'
                  : isGood
                    ? '👍 Good job!'
                    : '📚 Keep practicing!'}
              </p>
              <p className='text-sm text-medium-slate-blue-600 mt-1'>
                {isExcellent
                  ? 'You have great mastery of this vocabulary! Consider helping others by sharing this module.'
                  : isGood
                    ? "You're making good progress. Review the cards you missed and try again."
                    : 'Practice makes perfect. Review the vocabulary and try the session again to improve your score.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className='flex gap-3 justify-center'>
              <Button
                variant='outline'
                onClick={handleRestart}
                className='border-tekhelet-200 text-tekhelet-400'
              >
                <RotateCcw className='h-4 w-4 mr-2' />
                Study Again
              </Button>
              <Button
                onClick={() => {
                  onComplete?.();
                  toast.success('Progress saved successfully!');
                }}
                className='bg-tekhelet-400 hover:bg-tekhelet-500 text-white'
              >
                <Check className='h-4 w-4 mr-2' />
                Complete Session
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='max-w-2xl mx-auto space-y-6'>
      {/* Session Header */}
      <Card className='bg-white/60 backdrop-blur-lg border border-tekhelet-200'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='text-tekhelet-400 flex items-center'>
                <BookOpen className='h-5 w-5 mr-2' />
                {module.module_name}
              </CardTitle>
              <CardDescription>
                Card {sessionStats.currentCard} of {sessionStats.totalCards}
              </CardDescription>
            </div>
            <div className='text-right'>
              <div className='flex items-center space-x-2 mb-1'>
                <Clock className='h-4 w-4 text-medium-slate-blue-500' />
                <span className='text-sm text-medium-slate-blue-500'>
                  {formatTime(sessionStats.sessionTimeSpent)}
                </span>
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={handleExit}
                className='border-medium-slate-blue-200 text-medium-slate-blue-600'
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
              className='h-2'
            />
            <div className='flex justify-between text-sm text-medium-slate-blue-500'>
              <span>✓ {sessionStats.correctAnswers} correct</span>
              <span>✗ {sessionStats.incorrectAnswers} incorrect</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flashcard */}
      <Card className='bg-white/80 backdrop-blur-lg border border-tekhelet-200 min-h-[400px]'>
        <CardContent className='p-8'>
          <div className='text-center space-y-6'>
            {/* Word */}
            <div>
              <h2 className='text-4xl font-bold text-tekhelet-400 mb-2'>
                {currentCard.vocab.word}
              </h2>
              <Badge variant='secondary' className='text-sm'>
                Vocabulary #{currentCardIndex + 1}
              </Badge>
            </div>

            {/* Context */}
            <div className='max-w-md mx-auto'>
              <p className='text-lg text-medium-slate-blue-600 italic'>
                "{currentCard.vocab.context}"
              </p>
            </div>

            {/* Answer Section */}
            <div className='space-y-4'>
              {!showAnswer ? (
                <Button
                  onClick={() => setShowAnswer(true)}
                  className='bg-tekhelet-400 hover:bg-tekhelet-500 text-white'
                  size='lg'
                >
                  Show Meaning
                </Button>
              ) : (
                <div className='space-y-6'>
                  <div className='p-6 bg-tekhelet-50 border border-tekhelet-200 rounded-lg'>
                    <p className='text-xl text-tekhelet-600 font-medium'>
                      {currentCard.vocab.meaning}
                    </p>
                  </div>

                  <div className='flex justify-center space-x-4'>
                    <Button
                      onClick={() => handleAnswer(false)}
                      disabled={isLoading.updateModuleProgress}
                      variant='destructive'
                      size='lg'
                      className='min-w-[120px]'
                    >
                      <X className='h-5 w-5 mr-2' />
                      Don't Know
                    </Button>
                    <Button
                      onClick={() => handleAnswer(true)}
                      disabled={isLoading.updateModuleProgress}
                      className='bg-green-500 hover:bg-green-600 text-white min-w-[120px]'
                      size='lg'
                    >
                      <Check className='h-5 w-5 mr-2' />I Know This
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
          className='border-tekhelet-200 text-tekhelet-400'
        >
          <ArrowLeft className='h-4 w-4 mr-2' />
          Previous
        </Button>
        <Button
          variant='outline'
          onClick={nextCard}
          disabled={isLastCard || !showAnswer}
          className='border-tekhelet-200 text-tekhelet-400'
        >
          Next
          <ArrowRight className='h-4 w-4 ml-2' />
        </Button>
      </div>
    </div>
  );
}
