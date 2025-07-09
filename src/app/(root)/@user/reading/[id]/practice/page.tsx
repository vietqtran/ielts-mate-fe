'use client';

import PassageBox from '@/components/passages/user/PassageBox';
import { QuestionRenderer } from '@/components/passages/user/questions';
import { Button } from '@/components/ui/button';
import useAttempt from '@/hooks/useAttempt';
import { AttemptData } from '@/types/attemp.types';
import { QuestionTypeEnumIndex } from '@/types/reading.types';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const ReadingPractice = () => {
  const { id }: { id: string } = useParams();
  const [passages, setPassages] = useState<AttemptData | null>(null);
  const [answers, setAnswers] = useState<
    Record<string, { answer: string; questionType: QuestionTypeEnumIndex }>
  >({});
  const [timeLeft, setTimeLeft] = useState<number>(20 * 60); // 20 minutes in seconds
  const { startNewAttempt, submitAttempt } = useAttempt();
  console.log('Answers:', answers);
  console.log('Passages:', passages);

  // Initialize all question keys in the answers state with null values
  const initializeAnswerState = (attemptData: AttemptData | null) => {
    if (!attemptData) return;

    const initialAnswers: Record<string, { answer: string; questionType: QuestionTypeEnumIndex }> =
      {};

    attemptData.question_groups.forEach((group) => {
      group.questions.forEach((question) => {
        initialAnswers[question.question_id] = {
          answer: '', // Initialize with empty string instead of null for consistency
          questionType: question.question_type,
        };
      });
    });

    setAnswers(initialAnswers);
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
          answers: Object.entries(answers).map(([questionId, { answer, questionType }]) => ({
            question_id: questionId,
            choices:
              questionType === QuestionTypeEnumIndex.MULTIPLE_CHOICE && answer ? [answer] : null,
            data_filled:
              questionType === QuestionTypeEnumIndex.FILL_IN_THE_BLANKS && answer ? answer : null,
            drag_item_id:
              questionType === QuestionTypeEnumIndex.DRAG_AND_DROP && answer ? answer : null,
            data_matched: questionType === QuestionTypeEnumIndex.MATCHING && answer ? answer : null,
          })),
          duration: timeLeft,
        };
        console.log('Submitting attempt with payload:', payload);

        await submitAttempt({
          attempt_id: passages.attempt_id,
          payload,
        });
      }
    } catch (error) {
      console.error('Error submitting attempt:', error);
    }
  };

  useEffect(() => {
    startAttempt();
  }, [id]);

  // Timer effect
  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     setTimeLeft((prev) => {
  //       if (prev <= 1) {
  //         clearInterval(timer);
  //         handleSubmit();
  //         return 0;
  //       }
  //       return prev - 1;
  //     });
  //   }, 1000);

  //   return () => clearInterval(timer);
  // }, []);

  const handleAnswerChange = (
    questionId: string,
    answer: string,
    questionType: QuestionTypeEnumIndex
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        answer,
        questionType,
      },
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className='h-screen flex flex-col bg-gray-50'>
      {/* Header with timer and submit button */}
      <div className='flex justify-between items-center p-4 bg-white border-b shadow-sm'>
        <h1 className='text-xl font-bold'>{passages?.title || 'Loading...'}</h1>
        <div className='flex items-center gap-4'>
          <div
            className={`px-3 py-1 rounded-lg text-sm font-medium ${
              timeLeft <= 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }`}
          >
            Time: {formatTime(timeLeft)}
          </div>
          <Button onClick={handleSubmit} className='bg-green-600 hover:bg-green-700'>
            Submit Test
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className='flex-1 grid grid-cols-2 gap-4 p-4 overflow-hidden'>
        {/* Passage Column */}
        <div className='bg-white rounded-lg shadow-sm overflow-hidden flex flex-col'>
          <div className='p-4 border-b bg-gray-50'>
            <h2 className='text-lg font-semibold text-center'>Reading Passage</h2>
          </div>
          <div className='flex-1 overflow-y-auto p-4'>
            <PassageBox content={passages?.content || 'Loading passage...'} />
          </div>
        </div>

        {/* Questions Column */}
        <div className='bg-white rounded-lg shadow-sm overflow-hidden flex flex-col'>
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
      </div>
    </div>
  );
};

export default ReadingPractice;
