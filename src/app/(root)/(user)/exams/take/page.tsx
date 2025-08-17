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
  const [error, setError] = useState<string | null>(null);

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
    // Guard: missing params
    if (!examUrl || !examType) {
      setError(
        !examUrl && !examType
          ? 'Missing exam URL and type.'
          : !examUrl
            ? 'Missing exam URL.'
            : 'Missing exam type.'
      );
      setIsLoading(false);
      return;
    }

    // Guard: invalid exam type value
    if (!['reading', 'listening'].includes(examType)) {
      setError("Invalid exam type. Please specify either 'reading' or 'listening'.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      if (examType === 'reading') {
        const res = await createExamAttempt({ urlSlug: examUrl });
        if (res) {
          setReadingExamData(res);
          const answers = initializeReadingAnswerState(res);
          setReadingInitialAnswers(answers);
        } else {
          setError('Could not start reading exam. The provided URL may be incorrect.');
        }
      } else if (examType === 'listening') {
        const response = await startNewListeningExamAttempt({ url_slug: examUrl });
        if (response && response.data) {
          setListeningExamData(response.data);
          const answers = initializeListeningAnswerState(response.data);
          setListeningInitialAnswers(answers);
        } else {
          setError('Could not start listening exam. The provided URL may be incorrect.');
        }
      }
    } catch (err) {
      console.error('Error starting exam attempt:', err);
      setError(
        `Failed to start exam: ${err instanceof Error ? err.message : 'Unexpected error occurred.'}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Always attempt start (function itself handles validation & sets error/loading)
    startExamAttempt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Generic / validation / fetch errors
  if (error) {
    return (
      <div className='h-screen flex items-center justify-center bg-medium-slate-blue-900'>
        <div className='text-center p-6 bg-white/80 backdrop-blur-lg border border-persimmon-300 rounded-2xl shadow-xl max-w-md'>
          <p className='text-persimmon-600 text-lg font-medium mb-4'>{error}</p>
          <div className='flex flex-col gap-3'>
            <Button
              onClick={() => {
                setIsLoading(true);
                startExamAttempt();
              }}
              className='bg-tekhelet-600 hover:bg-tekhelet-700'
            >
              Retry
            </Button>
            <Button
              variant='outline'
              onClick={() => window.history.back()}
              className='border-tekhelet-600 text-tekhelet-600 hover:bg-tekhelet-50'
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // If no data but also no explicit error (unlikely) show fallback
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

  // Should never reach here (examType invalid handled earlier)
  return null;
};

export default TakeExamPage;
