'use client';

import ListeningPracticeAttempt from '@/components/features/user/listening/practice/ListeningAttempt';
import useListeningAttempt from '@/hooks/apis/listening/useListeningAttempt';
import {
  LoadListeningAttemptResponse,
  StartListeningAttemptResponse,
} from '@/types/listening/listening-attempt.types';
import { QuestionTypeEnumIndex } from '@/types/reading/reading.types';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export interface HandleAnswerChangeParams {
  questionId: string;
  answer_id: string | string[];
  questionType: QuestionTypeEnumIndex;
  questionOrder: number;
  content: string;
}

const ListeningPractice = () => {
  const { id }: { id: string } = useParams();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get('attempt');

  const [attemptData, setAttemptData] = useState<StartListeningAttemptResponse | null>(null);
  const [initialAnswers, setInitialAnswers] = useState<
    Record<
      string,
      {
        answer_id: string | string[];
        questionType: QuestionTypeEnumIndex;
        questionOrder: number;
        content: string;
      }
    >
  >({});

  const [initialDuration, setInitialDuration] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { startNewAttempt, loadAttemptById } = useListeningAttempt();

  // Initialize answer state for questions
  const initializeAnswerState = (
    attemptData: StartListeningAttemptResponse,
    existingAnswers?: LoadListeningAttemptResponse['answers']
  ) => {
    const initialAnswers: Record<
      string, // question_id
      {
        answer_id: string | string[]; // for multiple choices mode or single choice, no effect on fill-in-the-blank or drag-and-drop or matching
        questionType: QuestionTypeEnumIndex;
        questionOrder: number;
        content: string;
      }
    > = {};

    attemptData.question_groups.forEach((group) => {
      group.questions.forEach((question) => {
        const supportsMultiple = question.number_of_correct_answers > 1;

        // Find existing answer for this question
        const existingAnswer = existingAnswers?.find(
          (ans) => ans.question_id === question.question_id
        );

        let answer_id: string | string[] = supportsMultiple ? [] : '';
        let content = '';

        if (existingAnswer) {
          // Convert existing answer based on question type
          if (
            question.question_type === QuestionTypeEnumIndex.MULTIPLE_CHOICE &&
            existingAnswer.choice_ids
          ) {
            answer_id = supportsMultiple
              ? existingAnswer.choice_ids
              : existingAnswer.choice_ids[0] || '';
          } else if (
            question.question_type === QuestionTypeEnumIndex.FILL_IN_THE_BLANKS &&
            existingAnswer.filled_text_answer
          ) {
            answer_id = existingAnswer.filled_text_answer;
            content = existingAnswer.filled_text_answer; // Use filled text as content
          } else if (
            question.question_type === QuestionTypeEnumIndex.MATCHING &&
            existingAnswer.matched_text_answer
          ) {
            answer_id = existingAnswer.matched_text_answer;
            content = existingAnswer.matched_text_answer; // Use matched text as content
          } else if (
            question.question_type === QuestionTypeEnumIndex.DRAG_AND_DROP &&
            existingAnswer.drag_item_id
          ) {
            answer_id = existingAnswer.drag_item_id;
            content =
              attemptData.question_groups
                .find((group) => {
                  // Find the group containing the drag item and return its content
                  return group.drag_items.some(
                    (item) => item.drag_item_id === existingAnswer.drag_item_id
                  );
                })
                ?.drag_items.find((item) => item.drag_item_id === existingAnswer.drag_item_id)
                ?.content || '';
          }
        }

        initialAnswers[question.question_id] = {
          answer_id,
          questionType: question.question_type,
          questionOrder: question.question_order,
          content,
        };
      });
    });

    return initialAnswers;
  };

  const startAttempt = async () => {
    try {
      setIsLoading(true);
      const res = await startNewAttempt({ taskId: id });
      if (res?.data) {
        setAttemptData(res.data);
        const answers = initializeAnswerState(res.data);
        setInitialAnswers(answers);
        setInitialDuration(0);
      }
    } catch (error) {
      console.error('Error starting new attempt:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAttempt = async (attemptId: string) => {
    try {
      setIsLoading(true);
      const res = await loadAttemptById({ attempt_id: attemptId });
      if (res?.data) {
        // Transform LoadListeningAttemptResponse to StartListeningAttemptResponse format
        const attemptData: StartListeningAttemptResponse = {
          attempt_id: res.data.attempt_id,
          listening_task_id: res.data.task_data.listening_task_id,
          ielts_type: res.data.task_data.ielts_type,
          part_number: res.data.task_data.part_number,
          instruction: res.data.task_data.instruction,
          title: res.data.task_data.title,
          audio_file_id: res.data.task_data.audio_file_id,
          question_groups: res.data.task_data.question_groups.map((group) => ({
            ...group,
            question_group_id: group.group_id,
            questions: group.questions.map((question) => ({
              ...question,
              zone_index: 0, // These are optional properties in StartListeningAttemptQuestion
              blank_index: 0,
            })),
          })),
        };

        setAttemptData(attemptData);
        const answers = initializeAnswerState(attemptData, res.data.answers);
        setInitialAnswers(answers);
        setInitialDuration(res.data.duration);
      }
    } catch (error) {
      console.error('Error loading attempt:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (attemptId) {
      loadAttempt(attemptId);
    } else {
      startAttempt();
    }
  }, [id, attemptId]);

  if (isLoading) {
    return (
      <div className='h-screen flex items-center justify-center bg-white/60 backdrop-blur-lg'>
        <div className='text-center bg-white/70 backdrop-blur-md border border-tekhelet-200 rounded-2xl shadow-xl p-8'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-tekhelet-400 mx-auto'></div>
          <p className='mt-4' style={{ color: 'var(--color-tekhelet-400)' }}>
            {attemptId ? 'Loading your saved attempt...' : 'Starting new attempt...'}
          </p>
        </div>
      </div>
    );
  }

  if (!attemptData) {
    return (
      <div className='h-screen flex items-center justify-center bg-white/60 backdrop-blur-lg'>
        <div className='text-center bg-white/70 backdrop-blur-md border border-tekhelet-200 rounded-2xl shadow-xl p-8'>
          <p style={{ color: 'var(--color-persimmon-400)' }}>
            Failed to load listening task. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ListeningPracticeAttempt
      attemptData={attemptData}
      initialAnswers={initialAnswers}
      initialDuration={initialDuration}
    />
  );
};

export default ListeningPractice;
