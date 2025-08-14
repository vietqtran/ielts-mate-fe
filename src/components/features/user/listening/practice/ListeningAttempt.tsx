'use client';

import {
  PracticeContentRenderer,
  PracticeHeader,
  PracticeShell,
} from '@/components/features/user/common/take';
import ConfirmSubmitModal from '@/components/features/user/reading/finish/ConfirmSubmitModal';
import { QuestionRenderer } from '@/components/features/user/reading/questions';
import { Button } from '@/components/ui/button';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import useListeningAttempt from '@/hooks/apis/listening/useListeningAttempt';
import useListeningAudio from '@/hooks/apis/listening/useListeningAudio';
import { formatTime, useIncrementalTimer } from '@/hooks/utils/useTimer';
import { Answer } from '@/types/attempt.types';
import { StartListeningAttemptResponse } from '@/types/listening/listening-attempt.types';
import { QuestionTypeEnumIndex } from '@/types/reading/reading.types';
import { AlertTriangle, Pause, Play, Volume2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();

  const { submitAttempt, isLoading, saveAttemptProgress } = useListeningAttempt();
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
      <div className='h-screen w-full flex items-center justify-center'>
        <div className='backdrop-blur-xl border rounded-3xl p-8'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 mx-auto mb-4'></div>
            <p className='font-medium'>Loading listening practice...</p>
          </div>
        </div>
      </div>
    );
  }

  const totalQuestions = getTotalQuestions();
  const answeredQuestions = getAnsweredQuestions();
  const notAnsweredQuestions = getNotAnsweredQuestions();

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

      <PracticeShell
        header={
          <PracticeHeader
            title={propAttemptData.title}
            description={`Part ${propAttemptData.part_number + 1} - IELTS Listening Practice`}
            answered={answeredQuestions}
            total={totalQuestions}
            timeLeftSec={time}
            onSubmit={() => setIsModalOpen(true)}
            submitting={isLoading.submitAttempt}
            showUnansweredWarning={notAnsweredQuestions.length > 0}
            unansweredCount={notAnsweredQuestions.length}
            submitText='Submit'
            glass={false}
            onSave={() => handleSubmit({ type: 'save' })}
            saving={isLoading.saveAttemptProgress}
          />
        }
      >
        <PracticeContentRenderer
          glass
          leftColClassName='col-span-5'
          centerColClassName='col-span-5'
          rightColClassName='col-span-2'
          renderLeftColumn={
            <>
              <CardHeader className='flex-shrink-0 bg-medium-slate-blue-50'>
                <CardTitle className='text-center text-lg text-medium-slate-blue-400 flex items-center justify-center gap-2'>
                  <Volume2 className='w-5 h-5' />
                  Audio Player
                </CardTitle>
              </CardHeader>
              <CardContent className='flex-1 p-6 space-y-4'>
                {/* Instructions */}
                <div className='space-y-4'>
                  <h3 className='font-semibold text-tekhelet-600'>Instructions:</h3>
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
                        className='bg-tekhelet-500 hover:bg-tekhelet-600 text-white rounded-full w-16 h-16 shadow-lg'
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
                        className='w-full h-2 bg-medium-slate-blue-100 rounded-lg appearance-none cursor-pointer slider'
                      />
                      <div className='flex justify-between text-xs text-medium-slate-blue-500 font-medium'>
                        <span>{formatTime(Math.floor(currentTime))}</span>
                        <span>{formatTime(Math.floor(duration))}</span>
                      </div>
                    </div>

                    {/* Volume Control */}
                    <div className='space-y-2'>
                      <label className='text-xs font-semibold text-tekhelet-600'>Volume</label>
                      <input
                        type='range'
                        min='0'
                        max='100'
                        value={volume * 100}
                        onChange={handleVolumeChange}
                        className='w-full h-2 bg-medium-slate-blue-100 rounded-lg appearance-none cursor-pointer slider'
                      />
                    </div>
                  </div>
                ) : (
                  <div className='text-center py-8'>
                    {audioLoading.getAudio ? (
                      <div className='space-y-2'>
                        <div className='animate-spin rounded-full h-8 w-8 border-4 border-medium-slate-blue-200 border-t-tekhelet-500 mx-auto'></div>
                        <p className='text-sm text-medium-slate-blue-500 font-medium'>
                          Loading audio...
                        </p>
                      </div>
                    ) : (
                      <div className='space-y-2'>
                        <AlertTriangle className='w-8 h-8 text-tangerine-600 mx-auto' />
                        <p className='text-sm text-medium-slate-blue-500 font-medium'>
                          Audio not available
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </>
          }
          renderCenterColumn={
            <>
              <CardHeader className='bg-medium-slate-blue-50 flex-shrink-0'>
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
            </>
          }
          renderRightColumn={
            <>
              <CardHeader className='flex-shrink-0 bg-medium-slate-blue-50'>
                <CardTitle className='text-center text-lg text-tekhelet-600'>Progress</CardTitle>
              </CardHeader>
              <CardContent className='flex-1 space-y-4 overflow-y-auto p-4 min-h-0'>
                {/* Progress Summary */}
                <div className='space-y-2'>
                  <h4 className='font-semibold text-sm text-tekhelet-600'>Summary</h4>
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

                <div className='pt-2'>
                  <Button
                    onClick={() => handleSubmit({ type: 'save' })}
                    className='w-full bg-tekhelet-500 hover:bg-tekhelet-600 text-white'
                    size='sm'
                    disabled={isLoading.saveAttemptProgress}
                  >
                    {isLoading.saveAttemptProgress ? 'Saving...' : 'Save Progress'}
                  </Button>
                </div>
              </CardContent>
            </>
          }
        />
      </PracticeShell>

      {/* Custom slider styles */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #5b5bd6; /* tekhelet-500 */
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #5b5bd6; /* tekhelet-500 */
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </>
  );
};

export default ListeningPracticeAttempt;
