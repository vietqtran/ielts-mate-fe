'use client';

import AttemptProgressBox from '@/components/passages/user/AttemptProgressBox';
import PassageBox from '@/components/passages/user/PassageBox';
import ConfirmSubmitModal from '@/components/passages/user/finish/ConfirmSubmitModal';
import FinishScreen from '@/components/passages/user/finish/FinishScreen';
import { QuestionRenderer } from '@/components/passages/user/questions';
import { Button } from '@/components/ui/button';
import useAttempt from '@/hooks/useAttempt';
import { formatTime, useIncrementalTimer } from '@/hooks/useTimer';
import { AttemptData, DataResponse } from '@/types/attemp.types';
import { QuestionTypeEnumIndex } from '@/types/reading.types';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export interface HandleAnswerChangeParams {
  questionId: string;
  answer_id: string;
  questionType: QuestionTypeEnumIndex;
  questionOrder: number;
  content: string;
}

const ReadingPractice = () => {
  const { id }: { id: string } = useParams();
  const [passages, setPassages] = useState<AttemptData | null>(null);
  const [answers, setAnswers] = useState<
    Record<
      string,
      {
        answer_id: string;
        questionType: QuestionTypeEnumIndex;
        questionOrder: number;
        content: string;
      }
    >
  >({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<boolean>(false);
  const [submittedData, setSubmittedData] = useState<DataResponse>();
  const time = useIncrementalTimer(0, startTime); // Initialize timer with 0 seconds
  const { startNewAttempt, submitAttempt, saveAttemptProgress } = useAttempt();
  const router = useRouter();

  const notAnsweredQuestions = Object?.entries(answers)?.filter(
    ([, { answer_id: answer }]) => answer.trim() === ''
  );

  // Initialize all question keys in the answers state with null values
  const initializeAnswerState = (attemptData: AttemptData | null) => {
    if (!attemptData) return;

    const initialAnswers: Record<
      string,
      {
        answer_id: string;
        questionType: QuestionTypeEnumIndex;
        questionOrder: number;
        content: string;
      }
    > = {};

    attemptData.question_groups.forEach((group) => {
      group.questions.forEach((question) => {
        initialAnswers[question.question_id] = {
          answer_id: '', // Initialize with empty string instead of null for consistency
          questionType: question.question_type,
          questionOrder: question.question_order,
          content: '', // Initialize content as empty string
        };
      });
    });

    setAnswers(initialAnswers);
  };

  const handleSave = async () => {
    try {
      if (passages) {
        const payload = {
          answers: Object.entries(answers).map(
            ([questionId, { answer_id: answer, questionType }]) => ({
              question_id: questionId,
              choices:
                questionType === QuestionTypeEnumIndex.MULTIPLE_CHOICE && answer ? [answer] : null,
              data_filled:
                questionType === QuestionTypeEnumIndex.FILL_IN_THE_BLANKS && answer ? answer : null,
              drag_item_id:
                questionType === QuestionTypeEnumIndex.DRAG_AND_DROP && answer ? answer : null,
              data_matched:
                questionType === QuestionTypeEnumIndex.MATCHING && answer ? answer : null,
            })
          ),
          duration: time,
        };

        await saveAttemptProgress({
          attempt_id: passages.attempt_id,
          payload,
        }).then((res) => {
          if (res) {
            //@ts-ignore
          } else {
            console.error('Failed to save attempt');
          }
        });
      }
    } catch (error) {
      console.error('Error saving attempt:', error);
    }
  };

  const startAttempt = async () => {
    try {
      const res = await startNewAttempt({
        passageId: id,
      });
      if (res) {
        setPassages(res.data || null);
        // Initialize all question keys in the answers state
        initializeAnswerState(res.data);
        setStartTime(true); // Start the timer when the attempt is successfully created
      } else {
        setPassages(null);
      }
    } catch (error) {
      console.error('Error starting new attempt:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      if (passages) {
        const payload = {
          answers: Object.entries(answers).map(
            ([questionId, { answer_id: answer, questionType }]) => ({
              question_id: questionId,
              choices:
                questionType === QuestionTypeEnumIndex.MULTIPLE_CHOICE && answer ? [answer] : null,
              data_filled:
                questionType === QuestionTypeEnumIndex.FILL_IN_THE_BLANKS && answer ? answer : null,
              drag_item_id:
                questionType === QuestionTypeEnumIndex.DRAG_AND_DROP && answer ? answer : null,
              data_matched:
                questionType === QuestionTypeEnumIndex.MATCHING && answer ? answer : null,
            })
          ),
          duration: time,
        };

        await submitAttempt({
          attempt_id: passages.attempt_id,
          payload,
        }).then((res) => {
          if (res) {
            //@ts-ignore
            setSubmittedData(res.data);
            setStartTime(false);
            setIsSubmitted(true);
          } else {
            console.error('Failed to submit attempt');
          }
        });
      }
    } catch (error) {
      console.error('Error submitting attempt:', error);
    }
  };

  useEffect(() => {
    startAttempt();
  }, [id]);

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

  if (isSubmitted) {
    return (
      <FinishScreen
        duration={submittedData?.duration}
        key={passages?.attempt_id}
        resultSets={submittedData?.result_sets || []}
        score={submittedData?.result_sets?.filter((r) => r.is_correct).length || 0}
        total={submittedData?.result_sets?.length || 0}
        onHome={() => {
          router.push('/reading');
        }}
        onReview={() => {}}
      />
    );
  }

  return (
    <>
      <ConfirmSubmitModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        onConfirm={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        title='Confirm Submission'
        description={`Are you sure you want to submit your answers? ${
          notAnsweredQuestions.length > 0
            ? `You have ${notAnsweredQuestions.length} unanswered questions. If you submit now, these questions will not be graded.`
            : 'All questions answered!'
        }`}
      />
      <div className='h-screen flex flex-col bg-gray-50'>
        {/* Header with timer and submit button */}
        <div className='flex justify-between items-center p-4 bg-white border-b shadow-sm'>
          <h1 className='text-xl font-bold'>{passages?.title || 'Loading...'}</h1>
          <div className='flex items-center gap-4'>
            <div className={`px-3 py-1 rounded-lg text-sm font-medium bg-blue-100 text-blue-800`}>
              Time: {formatTime(time)}
            </div>
            <Button onClick={() => setIsModalOpen(true)}>Submit Test</Button>
            <Button
              onClick={() => handleSave()}
              className='bg-green-600 text-white hover:bg-green-700'
              variant={'ghost'}
            >
              Save
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className='flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden'>
          {/* Passage Column */}
          <div className='bg-white rounded-lg shadow-sm overflow-hidden flex flex-col col-span-5'>
            <div className='p-4 border-b bg-gray-50'>
              <h2 className='text-lg font-semibold text-center'>Reading Passage</h2>
            </div>
            <div className='flex-1 overflow-y-auto p-4'>
              <PassageBox content={passages?.content || 'Loading passage...'} />
            </div>
          </div>

          {/* Questions Column */}
          <div className='bg-white rounded-lg shadow-sm overflow-hidden flex flex-col col-span-5'>
            <div className='p-4 border-b bg-gray-50'>
              <h2 className='text-lg font-semibold text-center'>Questions</h2>
            </div>
            <div className='flex-1 overflow-y-auto p-4'>
              {passages?.question_groups ? (
                <QuestionRenderer
                  questionGroups={passages.question_groups}
                  onAnswerChange={handleAnswerChange}
                  answers={answers}
                />
              ) : (
                <div className='flex items-center justify-center h-full'>
                  <p className='text-gray-500'>Loading questions...</p>
                </div>
              )}
            </div>
          </div>
          <div className='bg-white rounded-lg shadow-sm overflow-hidden max-h-3/12 flex flex-col col-span-2'>
            <AttemptProgressBox />
          </div>
        </div>
      </div>
    </>
  );
};

export default ReadingPractice;
