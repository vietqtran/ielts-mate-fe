'use client';

import { ReadingExamAttemptDetailsQuestion } from '@/types/reading/reading-exam-attempt.types';
import { QuestionTypeEnumIndex } from '@/types/reading/reading.types';
import React from 'react';

import DragAndDropResult from './question_result/DragAndDrop';
import FillInTheBlanksResult from './question_result/FillInTheBlanks';
import MatchingResult from './question_result/Matching';
// Result renderers
import MultipleChoicesResult from './question_result/MultipleChoices';

interface QuestionResultRendererProps {
  question: ReadingExamAttemptDetailsQuestion;
  userAnswers: string[];
  dragAndDropItems: {
    drag_item_id: string;
    content: string;
  }[];
  isListening?: boolean;
}

export const QuestionResultRenderer = ({
  question,
  userAnswers,
  dragAndDropItems,
  isListening = false,
}: QuestionResultRendererProps) => {
  // Cast to ComponentType<any> so we can pass props even if the leaf component hasn't defined them yet
  const MCComponent = MultipleChoicesResult as unknown as React.ComponentType<any>;
  const FITBComponent = FillInTheBlanksResult as unknown as React.ComponentType<any>;
  const MatchingComponent = MatchingResult as unknown as React.ComponentType<any>;
  const DnDComponent = DragAndDropResult as unknown as React.ComponentType<any>;

  switch (question.question_type) {
    case QuestionTypeEnumIndex.MULTIPLE_CHOICE:
      return (
        <MCComponent question={question} userAnswers={userAnswers} isListening={isListening} />
      );
    case QuestionTypeEnumIndex.FILL_IN_THE_BLANKS:
      return (
        <FITBComponent question={question} userAnswers={userAnswers} isListening={isListening} />
      );
    case QuestionTypeEnumIndex.MATCHING:
      return (
        <MatchingComponent
          question={question}
          userAnswers={userAnswers}
          isListening={isListening}
        />
      );
    case QuestionTypeEnumIndex.DRAG_AND_DROP:
      return (
        <DnDComponent
          question={question}
          userAnswers={userAnswers}
          dragAndDropItems={dragAndDropItems}
          isListening={isListening}
        />
      );
    default:
      return (
        <div className='p-3 rounded-lg border border-tekhelet-900/20 bg-white/70 text-tekhelet-500'>
          Unsupported question type
        </div>
      );
  }
};

// Helper: evaluate user's answer for a question in attempt details view
// Returns one of: 'correct' | 'incorrect' | 'unanswered'

export const getQuestionResultStatus = (
  question: ReadingExamAttemptDetailsQuestion,
  userAnswers: string[]
): boolean | null => {
  switch (question.question_type) {
    case QuestionTypeEnumIndex.MULTIPLE_CHOICE: {
      const choices = question.choices ?? [];
      const hasAnswer = (userAnswers?.length ?? 0) > 0;
      if (!hasAnswer) return null;
      // Correct when every correct choice is selected and no incorrect choice is selected
      const isCorrect = choices.every((choice) =>
        choice.is_correct
          ? userAnswers.includes(choice.choice_id)
          : !userAnswers.includes(choice.choice_id)
      );
      return isCorrect;
    }
    case QuestionTypeEnumIndex.FILL_IN_THE_BLANKS: {
      const hasAnswer = (userAnswers?.length ?? 0) > 0;
      if (!hasAnswer) return null;
      const userAnswer = userAnswers[0] ?? null;
      const correct = question.correct_answer ?? null;
      return userAnswer === correct;
    }
    case QuestionTypeEnumIndex.MATCHING: {
      const hasAnswer = (userAnswers?.length ?? 0) > 0;
      if (!hasAnswer) return null;
      const userAnswer = userAnswers[0] ?? null;
      const correct = question.correct_answer_for_matching ?? null;
      return userAnswer === correct;
    }
    case QuestionTypeEnumIndex.DRAG_AND_DROP: {
      const hasAnswer = (userAnswers?.length ?? 0) > 0;
      if (!hasAnswer) return null;
      const userAnswer = userAnswers[0] ?? null;
      const correct = question.correct_answer ?? null;
      return userAnswer === correct;
    }
    default:
      return (userAnswers?.length ?? 0) > 0 ? false : null;
  }
};
