'use client';

import TakeListeningExam from '@/components/features/user/exams/listening/take/TakeListeningExam';
import TakeExam from '@/components/features/user/exams/reading/take/TakeExam';
import { Button } from '@/components/ui/button';
import { useListeningExam } from '@/hooks/apis/listening/useListeningExam';
import useReadingExamAttempt from '@/hooks/apis/reading/useReadingExamAttempt';
import { StartListeningExamResponse } from '@/types/listening/listening-exam.types';
import { ReadingExamData } from '@/types/reading/reading-exam-attempt.types';
import { QuestionTypeEnumIndex } from '@/types/reading/reading.types';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const TakeExamPage = () => {
  const searchParams = useSearchParams();
  const examUrl = searchParams.get('examUrl');
  const examType = searchParams.get('examType'); // 'reading' or 'listening'

  const [readingExamData, setReadingExamData] = useState<ReadingExamData | null>(null);
  const [listeningExamData, setListeningExamData] = useState<StartListeningExamResponse | null>(
    null
  );

  const [readingInitialAnswers, setReadingInitialAnswers] = useState<
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

  const [listeningInitialAnswers, setListeningInitialAnswers] = useState<
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
  const { startNewListeningExamAttempt } = useListeningExam();

  // Initialize answer state for reading exam parts
  const initializeReadingAnswerState = (examData: ReadingExamData) => {
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

  // Initialize answer state for listening exam parts
  const initializeListeningAnswerState = (examData: StartListeningExamResponse) => {
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
      part4: {},
    };

    const parts = [
      { key: 'part1', data: examData.listening_exam.listening_task_id_part1 },
      { key: 'part2', data: examData.listening_exam.listening_task_id_part2 },
      { key: 'part3', data: examData.listening_exam.listening_task_id_part3 },
      { key: 'part4', data: examData.listening_exam.listening_task_id_part4 },
    ];

    parts.forEach((part) => {
      part.data.question_groups.forEach((group) => {
        group.questions!.forEach((question) => {
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
    if (!examUrl || !examType) return;

    try {
      setIsLoading(true);

      if (examType === 'reading') {
        const res = await createExamAttempt({ urlSlug: examUrl });
        if (res) {
          setReadingExamData(res);
          const answers = initializeReadingAnswerState(res);
          setReadingInitialAnswers(answers);
        }
      } else if (examType === 'listening') {
        const response = await startNewListeningExamAttempt({
          url_slug: examUrl,
        });
        if (response && response.data) {
          setListeningExamData(response.data);
          const answers = initializeListeningAnswerState(response.data);
          setListeningInitialAnswers(answers);
        }
      }
    } catch (error) {
      console.error('Error starting exam attempt:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (examUrl && examType) {
      startExamAttempt();
    }
  }, [examUrl, examType]);

  if (isLoading) {
    return (
      <div className='h-screen flex items-center justify-center bg-medium-slate-blue-900'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-tekhelet-600 mx-auto'></div>
          <p className='mt-4 text-white font-medium'>Starting your {examType || ''} exam...</p>
        </div>
      </div>
    );
  }

  if (!readingExamData && !listeningExamData) {
    return (
      <div className='h-screen flex items-center justify-center bg-medium-slate-blue-900'>
        <div className='text-center p-6 bg-white/80 backdrop-blur-lg border border-persimmon-300 rounded-2xl shadow-xl max-w-md'>
          <p className='text-persimmon-600 text-lg font-medium mb-4'>
            Failed to load exam. Please try again.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className='bg-tekhelet-600 hover:bg-tekhelet-700'
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Render appropriate exam component based on examType
  if (examType === 'reading' && readingExamData) {
    return <TakeExam examData={readingExamData} initialAnswers={readingInitialAnswers} />;
  }

  if (examType === 'listening' && listeningExamData) {
    return (
      <TakeListeningExam examData={listeningExamData} initialAnswers={listeningInitialAnswers} />
    );
  }

  // Invalid exam type
  return (
    <div className='h-screen flex items-center justify-center bg-medium-slate-blue-900'>
      <div className='text-center p-6 bg-white/80 backdrop-blur-lg border border-persimmon-300 rounded-2xl shadow-xl max-w-md'>
        <p className='text-persimmon-600 text-lg font-medium mb-4'>
          Invalid exam type. Please specify either 'reading' or 'listening'.
        </p>
        <Button
          onClick={() => window.history.back()}
          className='bg-tekhelet-600 hover:bg-tekhelet-700'
        >
          Go Back
        </Button>
      </div>
    </div>
  );
};

export default TakeExamPage;
