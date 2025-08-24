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
}

export const QuestionResultRenderer = ({
  question,
  userAnswers,
  dragAndDropItems,
}: QuestionResultRendererProps) => {
  // Cast to ComponentType<any> so we can pass props even if the leaf component hasn't defined them yet
  const MCComponent = MultipleChoicesResult as unknown as React.ComponentType<any>;
  const FITBComponent = FillInTheBlanksResult as unknown as React.ComponentType<any>;
  const MatchingComponent = MatchingResult as unknown as React.ComponentType<any>;
  const DnDComponent = DragAndDropResult as unknown as React.ComponentType<any>;

  switch (question.question_type) {
    case QuestionTypeEnumIndex.MULTIPLE_CHOICE:
      return <MCComponent question={question} userAnswers={userAnswers} />;
    case QuestionTypeEnumIndex.FILL_IN_THE_BLANKS:
      return <FITBComponent question={question} userAnswers={userAnswers} />;
    case QuestionTypeEnumIndex.MATCHING:
      return <MatchingComponent question={question} userAnswers={userAnswers} />;
    case QuestionTypeEnumIndex.DRAG_AND_DROP:
      return (
        <DnDComponent
          question={question}
          userAnswers={userAnswers}
          dragAndDropItems={dragAndDropItems}
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
