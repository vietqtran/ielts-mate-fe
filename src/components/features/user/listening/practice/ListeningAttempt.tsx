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
import { AttemptStompState } from '@/hooks/utils/useLockAttempt';
import { useIncrementalTimer } from '@/hooks/utils/useTimer';
import { Answer } from '@/types/attempt.types';
import { StartListeningAttemptResponse } from '@/types/listening/listening-attempt.types';
import { QuestionTypeEnumIndex } from '@/types/reading/reading.types';
import { RootState } from '@/types/store.types';
import { AlertTriangle, Volume2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
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
  stomp: {
    state: AttemptStompState;
    sessionId: string;
    connect: () => void;
    disconnect: () => Promise<void>;
    register: (attemptId: string, userId?: string) => void;
    unregister: (attemptId: string) => void;
    startHeartbeat: (attemptId: string) => void;
    stopHeartbeat: () => void;
  };
}

const ListeningPracticeAttempt: React.FC<ListeningPracticeAttemptProps> = ({
  attemptData: propAttemptData,
  initialAnswers,
  initialDuration,
  stomp,
}) => {
  const router = useRouter();
  const [audioId, setAudioId] = useState<string | null>(null);
  const user = useSelector((state: RootState) => state.auth.user);

  const { submitAttempt, isLoading, saveAttemptProgress } = useListeningAttempt();

  const { objectUrl, error, isLoading: audioLoading } = useListeningAudio(audioId);

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
  const audioRef = useRef<HTMLAudioElement>(null);
  const time = useIncrementalTimer(initialDuration, startTime);

  useEffect(() => {
    const initializeAudio = async () => {
      try {
        setStartTime(true);
        if (propAttemptData.audio_file_id) {
          setAudioId(propAttemptData.audio_file_id);
        }
      } catch (error) {
        console.error('Failed to load audio:', error);
        toast.error('Failed to load audio');
      }
    };

    if (propAttemptData) {
      initializeAudio();
    }
  }, [propAttemptData]);

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
        const res = await saveAttemptProgress({
          attempt_id: propAttemptData.attempt_id,
          payload,
        });
        if (!res) console.error('Failed to save attempt');
        else toast.success('Progress saved!');
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

  const connectAndRegister = async (attemptId: string) => {
    stomp.connect();
    stomp.register(attemptId, user?.id);
  };

  useEffect(() => {
    const id = propAttemptData?.attempt_id;
    if (!id) return;
    connectAndRegister(id);
    return () => {
      stomp.stopHeartbeat();
      stomp.unregister(id);
      stomp.disconnect();
    };
  }, [propAttemptData?.attempt_id, user?.id]);

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
                  <p
                    className='text-sm text-medium-slate-blue-500 leading-relaxed'
                    dangerouslySetInnerHTML={{
                      __html: propAttemptData.instruction,
                    }}
                  />
                </div>

                {/* Audio Controls */}
                {objectUrl ? (
                  <div className='space-y-4'>
                    <audio
                      ref={audioRef}
                      src={objectUrl}
                      preload='metadata'
                      controls
                      controlsList='nodownload'
                      className='w-full'
                    />
                  </div>
                ) : (
                  <div className='text-center py-8'>
                    {audioLoading ? (
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
    </>
  );
};

export default ListeningPracticeAttempt;
