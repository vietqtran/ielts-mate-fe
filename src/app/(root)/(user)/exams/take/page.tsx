'use client';

import TakeExam from '@/components/features/user/exams/take/TakeExam';
import { Button } from '@/components/ui/button';
import useReadingExamAttempt from '@/hooks/apis/reading/useReadingExamAttempt';
import { ReadingExamData } from '@/types/reading/reading-exam-attempt.types';
import { QuestionTypeEnumIndex } from '@/types/reading/reading.types';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const TakeExamPage = () => {
  const searchParams = useSearchParams();
  const examUrl = searchParams.get('examUrl');

  const [examData, setExamData] = useState<ReadingExamData | null>(null);

  const [initialAnswers, setInitialAnswers] = useState<
    Record<
      string,
      Record<
        string,
        {
          answer_id: string | string[];
          questionType: QuestionTypeEnumIndex;
          questionOrder: number;
          content: string;
        }
      >
    >
  >({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { createExamAttempt } = useReadingExamAttempt();

  // Initialize answer state for all parts
  const initializeAnswerState = (examData: ReadingExamData) => {
    const initialAnswers: Record<
      string,
      Record<
        string,
        {
          answer_id: string | string[];
          questionType: QuestionTypeEnumIndex;
          questionOrder: number;
          content: string;
        }
      >
    > = {
      part1: {},
      part2: {},
      part3: {},
    };

    console.log(examData);

    const parts = [
      { key: 'part1', data: examData.reading_exam.reading_passage_id_part1 },
      { key: 'part2', data: examData.reading_exam.reading_passage_id_part2 },
      { key: 'part3', data: examData.reading_exam.reading_passage_id_part3 },
    ];

    parts.forEach((part) => {
      part.data.question_groups.forEach((group) => {
        group.questions.forEach((question) => {
          const supportsMultiple = question.number_of_correct_answers > 1;

          initialAnswers[part.key][question.question_id] = {
            answer_id: supportsMultiple ? [] : '',
            questionType: question.question_type,
            questionOrder: question.question_order,
            content: '',
          };
        });
      });
    });

    return initialAnswers;
  };

  const startExamAttempt = async () => {
    if (!examUrl) return;

    try {
      setIsLoading(true);
      const res = await createExamAttempt({ urlSlug: examUrl });
      if (res) {
        setExamData(res);
        const answers = initializeAnswerState(res);
        setInitialAnswers(answers);
      }
    } catch (error) {
      console.error('Error starting exam attempt:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (examUrl) {
      startExamAttempt();
    }
  }, [examUrl]);

  if (isLoading) {
    return (
      <div className='h-screen flex items-center justify-center bg-medium-slate-blue-900'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-tekhelet-600 mx-auto'></div>
          <p className='mt-4 text-gray-600 font-medium'>Starting your exam...</p>
        </div>
      </div>
    );
  }

  if (!examData) {
    return (
      <div className='h-screen flex items-center justify-center bg-medium-slate-blue-900'>
        <div className='text-center p-6 bg-white rounded-lg shadow-lg border border-persimmon-300'>
          <p className='text-persimmon-600 text-lg font-medium'>
            Failed to load exam. Please try again.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className='mt-4 bg-tekhelet-600 hover:bg-tekhelet-700'
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return <TakeExam examData={examData} initialAnswers={initialAnswers} />;
};

export default TakeExamPage;
