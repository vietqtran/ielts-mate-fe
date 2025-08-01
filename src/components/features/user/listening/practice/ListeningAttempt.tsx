'use client';

import ConfirmSubmitModal from '@/components/features/user/reading/finish/ConfirmSubmitModal';
import { QuestionRenderer } from '@/components/features/user/reading/questions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import useListeningAttempt from '@/hooks/apis/listening/useListeningAttempt';
import useListeningAudio from '@/hooks/apis/listening/useListeningAudio';
import { formatTime, useIncrementalTimer } from '@/hooks/utils/useTimer';
import { Answer } from '@/types/attempt.types';
import { StartListeningAttemptResponse } from '@/types/listening/listening-attempt.types';
import { QuestionTypeEnumIndex } from '@/types/reading/reading.types';
import { AlertTriangle, Clock, Headphones, Pause, Play, Volume2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export interface HandleAnswerChangeParams {
  questionId: string;
  answer_id: string | string[];
  questionType: QuestionTypeEnumIndex;
  questionOrder: number;
  content: string;
}

interface ListeningPracticeAttemptProps {
  attemptData: StartListeningAttemptResponse;
  initialAnswers: Record<
    string,
    {
      answer_id: string | string[];
      questionType: QuestionTypeEnumIndex;
      questionOrder: number;
      content: string;
    }
  >;
  initialDuration: number;
}

const ListeningPracticeAttempt: React.FC<ListeningPracticeAttemptProps> = ({
  attemptData: propAttemptData,
  initialAnswers,
  initialDuration,
}) => {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;

  const { startNewAttempt, submitAttempt, isLoading, error, saveAttemptProgress } =
    useListeningAttempt();
  const { getAudio, audioUrl, isLoading: audioLoading, cleanup } = useListeningAudio();

  const [answers, setAnswers] =
    useState<
      Record<
        string,
        {
          answer_id: string | string[];
          questionType: QuestionTypeEnumIndex;
          questionOrder: number;
          content: string;
        }
      >
    >(initialAnswers);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<boolean>(false);
  const [showResult, setShowResult] = useState<boolean>(false);

  // Audio controls
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);

  const time = useIncrementalTimer(initialDuration, startTime);

  useEffect(() => {
    const initializeAudio = async () => {
      try {
        setStartTime(true);

        // Load audio if available
        if (propAttemptData.audio_file_id) {
          await getAudio(propAttemptData.audio_file_id);
        }
      } catch (error) {
        console.error('Failed to load audio:', error);
        toast.error('Failed to load audio');
      }
    };

    if (propAttemptData) {
      initializeAudio();
    }

    // Cleanup on unmount
    return () => {
      cleanup();
    };
  }, [propAttemptData]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);
    const handleError = () => {
      console.error('Audio playback error');
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [audioUrl]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((error) => {
        console.error('Error playing audio:', error);
        toast.error('Failed to play audio');
        setIsPlaying(false);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = (parseFloat(e.target.value) / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    const newVolume = parseFloat(e.target.value) / 100;
    setVolume(newVolume);
    if (audio) {
      audio.volume = newVolume;
    }
  };

  const getTotalQuestions = () => {
    if (!propAttemptData) return 0;
    return propAttemptData.question_groups.reduce((total: number, group: any) => {
      return total + group.questions.length;
    }, 0);
  };

  const getAnsweredQuestions = () => {
    return Object.values(answers).filter((answer) => {
      if (Array.isArray(answer.answer_id)) {
        return answer.answer_id.length > 0;
      }
      return answer.answer_id.toString().trim() !== '';
    }).length;
  };

  const getNotAnsweredQuestions = () => {
    if (!propAttemptData) return [];

    const notAnswered: Array<{ questionId: string }> = [];
    propAttemptData.question_groups.forEach((group: any) => {
      group.questions.forEach((question: any) => {
        const answer = answers[question.question_id];
        if (!answer) {
          notAnswered.push({ questionId: question.question_id });
          return;
        }

        if (Array.isArray(answer.answer_id)) {
          if (answer.answer_id.length === 0) {
            notAnswered.push({ questionId: question.question_id });
          }
        } else {
          if (answer.answer_id.toString().trim() === '') {
            notAnswered.push({ questionId: question.question_id });
          }
        }
      });
    });
    return notAnswered;
  };

  const handleSubmit = async (params: { type: 'submit' | 'save' }) => {
    if (!propAttemptData) return;

    try {
      const transformedAnswers: Answer[] = [];

      Object.entries(answers).forEach(([questionId, answer]) => {
        let choices: string[] | null = null;
        let data_filled: string | null = null;
        let data_matched: string | null = null;
        let drag_item_id: string | null = null;

        if (Array.isArray(answer.answer_id)) {
          choices = answer.answer_id;
        } else {
          const answerString = answer.answer_id.toString().trim();
          if (answerString) {
            // Determine type based on question type
            switch (answer.questionType) {
              case QuestionTypeEnumIndex.FILL_IN_THE_BLANKS:
                data_filled = answerString;
                break;
              case QuestionTypeEnumIndex.MATCHING:
                data_matched = answerString;
                break;
              case QuestionTypeEnumIndex.DRAG_AND_DROP:
                drag_item_id = answerString;
                break;
              default:
                choices = [answerString];
            }
          }
        }

        transformedAnswers.push({
          question_id: questionId,
          choices,
          data_filled,
          data_matched,
          drag_item_id,
        });
      });

      // Create payload with answers array
      const payload = {
        answers: transformedAnswers,
        duration: time,
      };

      if (params.type === 'save') {
        await saveAttemptProgress({
          attempt_id: propAttemptData.attempt_id,
          payload,
        });
        return;
      }

      await submitAttempt({
        attempt_id: propAttemptData.attempt_id,
        payload: payload as any, // Type assertion for now since API expects specific format
      });
      setIsModalOpen(false);
      router.push(
        `/history/practices/details?mode=listening&attemptId=${propAttemptData.attempt_id}`
      );
    } catch (error) {
      console.error('Error submitting listening attempt:', error);
      setIsModalOpen(false);
    }
  };

  const handleAnswerChange = (params: HandleAnswerChangeParams) => {
    setAnswers((prev) => ({
      ...prev,
      [params.questionId]: {
        answer_id: params.answer_id,
        questionType: params.questionType,
        questionOrder: params.questionOrder,
        content: params.content,
      },
    }));
  };

  if (!propAttemptData) {
    return (
      <div className='h-screen w-full flex items-center justify-center bg-medium-slate-blue-900'>
        <Card className='bg-white/80 backdrop-blur-lg border border-tekhelet-200 rounded-2xl shadow-xl p-6'>
          <CardContent className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-tekhelet-600 mx-auto mb-4'></div>
            <p className='text-tekhelet-600'>Loading listening practice...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalQuestions = getTotalQuestions();
  const answeredQuestions = getAnsweredQuestions();
  const notAnsweredQuestions = getNotAnsweredQuestions();
  const progressPercentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  return (
    <>
      <ConfirmSubmitModal
        isOpen={isModalOpen}
        setIsOpen={(open) => {
          if (!isLoading.submitAttempt) {
            setIsModalOpen(open);
          }
        }}
        onConfirm={() => handleSubmit({ type: 'submit' })}
        onCancel={() => {
          if (!isLoading.submitAttempt) {
            setIsModalOpen(false);
          }
        }}
        title='Submit Listening Practice'
        description={`Are you sure you want to submit your listening practice? ${
          notAnsweredQuestions.length > 0
            ? `You have ${notAnsweredQuestions.length} unanswered questions.`
            : 'All questions answered!'
        }`}
        confirmText={isLoading.submitAttempt ? 'Submitting...' : 'Submit'}
        cancelText={isLoading.submitAttempt ? 'Please wait...' : 'Cancel'}
      />

      <div className='h-screen w-full grid grid-rows-[auto_1fr] bg-medium-slate-blue-900'>
        {/* Header with timer and task info */}
        <div className='bg-white/80 backdrop-blur-lg border-b border-tekhelet-200 shadow-sm'>
          <div className='grid grid-cols-1 md:grid-cols-3 items-center p-4 gap-4'>
            <div className='col-span-1'>
              <h1 className='text-xl font-bold text-tekhelet-600'>{propAttemptData.title}</h1>
              <p className='text-sm text-medium-slate-blue-400 mt-1'>
                Part {propAttemptData.part_number + 1} - IELTS Listening Practice
              </p>
            </div>

            <div className='col-span-1 flex items-center gap-4 justify-center'>
              {/* Progress indicator */}
              <div className='flex items-center gap-2'>
                <Headphones className='w-4 h-4 text-medium-slate-blue-400' />
                <span className='text-sm font-medium text-tekhelet-600'>
                  {answeredQuestions}/{totalQuestions} questions
                </span>
              </div>

              {/* Timer */}
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-tekhelet-400 backdrop-blur-md`}
              >
                <Clock className={`w-5 h-5`} />
                <span className={`text-lg font-bold`}>{formatTime(time)}</span>
              </div>
            </div>

            <div className='col-span-1 flex justify-end gap-2'>
              <Button
                onClick={() => handleSubmit({ type: 'save' })}
                className='bg-selective-yellow-300 hover:bg-selective-yellow-400 text-white'
                size='lg'
                disabled={isLoading.saveAttemptProgress}
              >
                {isLoading.saveAttemptProgress ? 'Saving...' : 'Save'}
              </Button>

              <Button
                onClick={() => setIsModalOpen(true)}
                className='bg-tekhelet-600 hover:bg-tekhelet-700 text-white'
                size='lg'
                disabled={isLoading.submitAttempt}
              >
                {isLoading.submitAttempt ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          <div className='px-4 pb-4'>
            <Progress value={progressPercentage} className='h-2' />
          </div>
        </div>

        {/* Main content */}
        <div className='flex-1 overflow-hidden p-6'>
          <div className='grid grid-cols-12 gap-6 h-full'>
            {/* Audio Player Column */}
            <Card className='bg-white/80 backdrop-blur-lg border rounded-2xl shadow-xl overflow-hidden flex flex-col col-span-4 h-full'>
              <CardHeader className='flex-shrink-0 backdrop-blur-md'>
                <CardTitle className='text-center text-lg text-tekhelet-400 flex items-center justify-center gap-2'>
                  <Volume2 className='w-5 h-5' />
                  Audio Player
                </CardTitle>
              </CardHeader>
              <CardContent className='flex-1 p-6 space-y-4'>
                {/* Instructions */}
                <div className='space-y-4'>
                  <h3 className='font-medium text-tekhelet-600'>Instructions:</h3>
                  <p className='text-sm text-medium-slate-blue-500 leading-relaxed'>
                    {propAttemptData.instruction}
                  </p>
                </div>

                {/* Audio Controls */}
                {audioUrl ? (
                  <div className='space-y-4'>
                    <audio ref={audioRef} src={audioUrl} preload='metadata' />

                    {/* Play/Pause Button */}
                    <div className='flex justify-center'>
                      <Button
                        onClick={togglePlayPause}
                        size='lg'
                        className='bg-tekhelet-600 hover:bg-tekhelet-700 text-white rounded-full w-16 h-16'
                        disabled={audioLoading.getAudio}
                      >
                        {isPlaying ? (
                          <Pause className='w-6 h-6' />
                        ) : (
                          <Play className='w-6 h-6 ml-1' />
                        )}
                      </Button>
                    </div>

                    {/* Progress Bar */}
                    <div className='space-y-2'>
                      <input
                        type='range'
                        min='0'
                        max='100'
                        value={duration > 0 ? (currentTime / duration) * 100 : 0}
                        onChange={handleSeek}
                        className='w-full h-2 bg-tekhelet-200 rounded-lg appearance-none cursor-pointer slider'
                      />
                      <div className='flex justify-between text-xs text-medium-slate-blue-500'>
                        <span>{formatTime(Math.floor(currentTime))}</span>
                        <span>{formatTime(Math.floor(duration))}</span>
                      </div>
                    </div>

                    {/* Volume Control */}
                    <div className='space-y-2'>
                      <label className='text-xs font-medium text-tekhelet-600'>Volume</label>
                      <input
                        type='range'
                        min='0'
                        max='100'
                        value={volume * 100}
                        onChange={handleVolumeChange}
                        className='w-full h-2 bg-tekhelet-200 rounded-lg appearance-none cursor-pointer slider'
                      />
                    </div>
                  </div>
                ) : (
                  <div className='text-center py-8'>
                    {audioLoading.getAudio ? (
                      <div className='space-y-2'>
                        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-tekhelet-600 mx-auto'></div>
                        <p className='text-sm text-medium-slate-blue-500'>Loading audio...</p>
                      </div>
                    ) : (
                      <div className='space-y-2'>
                        <AlertTriangle className='w-8 h-8 text-tangerine-500 mx-auto' />
                        <p className='text-sm text-medium-slate-blue-500'>Audio not available</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Questions Column */}
            <Card className='bg-white/80 backdrop-blur-lg border rounded-2xl shadow-xl overflow-hidden flex flex-col col-span-6 h-full'>
              <CardHeader className='flex-shrink-0 backdrop-blur-md'>
                <CardTitle className='text-center text-lg text-medium-slate-blue-400'>
                  Questions
                </CardTitle>
              </CardHeader>
              <CardContent className='flex-1 overflow-y-auto p-6 min-h-0'>
                <QuestionRenderer
                  questionGroups={propAttemptData.question_groups}
                  onAnswerChange={handleAnswerChange}
                  answers={answers}
                />
              </CardContent>
            </Card>

            {/* Status Column */}
            <Card className='col-span-2 flex flex-col border-selective-yellow-300 bg-selective-yellow-50/60 backdrop-blur-lg rounded-2xl shadow-xl h-fit'>
              <CardHeader className='flex-shrink-0 backdrop-blur-md rounded-t-2xl'>
                <CardTitle className='text-center text-xl text-selective-yellow-400'>
                  Progress
                </CardTitle>
              </CardHeader>
              <CardContent className='flex-1 space-y-4 overflow-y-auto p-4 min-h-0'>
                {/* Progress Summary */}
                <div className='space-y-2'>
                  <h4 className='font-medium text-sm text-tekhelet-600'>Progress</h4>
                  <div className='space-y-1 text-xs'>
                    <div className='flex justify-between'>
                      <span className='text-medium-slate-blue-500'>Answered:</span>
                      <span className='font-medium text-tekhelet-600'>{answeredQuestions}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-medium-slate-blue-500'>Remaining:</span>
                      <span className='font-medium text-tekhelet-600'>
                        {totalQuestions - answeredQuestions}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-medium-slate-blue-500'>Total:</span>
                      <span className='font-medium text-tekhelet-600'>{totalQuestions}</span>
                    </div>
                  </div>
                </div>
                {/* Tips */}
                <div className='space-y-2'>
                  <h4 className='font-medium text-sm text-tekhelet-600'>Tips</h4>
                  <div className='text-xs text-medium-slate-blue-500 space-y-1'>
                    <p>• Listen carefully to the audio</p>
                    <p>• You can replay the audio anytime</p>
                    <p>• Review your answers before submitting</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Custom slider styles */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--color-tekhelet-600);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--color-tekhelet-600);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </>
  );
};

export default ListeningPracticeAttempt;
