'use client';

import DragDropQuestion from '@/components/features/user/reading/questions/DragDropQuestion';
import FillInBlankQuestion from '@/components/features/user/reading/questions/FillInBlankQuestion';
import MatchingQuestion from '@/components/features/user/reading/questions/MatchingQuestion';
import MultipleChoiceQuestion from '@/components/features/user/reading/questions/MultipleChoiceQuestion';
import { QuestionGroup } from '@/types/reading/reading-exam-attempt.types';
import { QuestionTypeEnumIndex } from '@/types/reading/reading.types';
import React from 'react';
import { HandleAnswerChangeParams } from '../TakeListeningExam';

interface ListeningQuestionRendererProps {
  questionGroups: QuestionGroup[];
  answers: Record<
    string,
    {
      answer_id: string | string[];
      questionType: QuestionTypeEnumIndex;
      questionOrder: number;
      content: string;
    }
  >;
  onAnswerChange: (params: HandleAnswerChangeParams) => void;
}

const ListeningQuestionRenderer: React.FC<ListeningQuestionRendererProps> = ({
  questionGroups,
  answers,
  onAnswerChange,
}) => {
  const renderQuestionGroup = (questionGroup: QuestionGroup) => {
    if (!questionGroup.questions || questionGroup.questions.length === 0) return null;

    const questionType: QuestionTypeEnumIndex = questionGroup.questions[0].question_type;

    switch (questionType) {
      case QuestionTypeEnumIndex.MULTIPLE_CHOICE: // Multiple Choice (including TRUE/FALSE/NOT GIVEN)
        return (
          <MultipleChoiceQuestion
            key={questionGroup.question_group_id}
            //@ts-ignore
            questionGroup={questionGroup}
            onAnswerChange={onAnswerChange}
            answers={answers}
          />
        );

      case QuestionTypeEnumIndex.FILL_IN_THE_BLANKS: // Fill in the Blanks
        return (
          <FillInBlankQuestion
            key={questionGroup.question_group_id}
            //@ts-ignore
            questionGroup={questionGroup}
            onAnswerChange={onAnswerChange}
            answers={answers}
          />
        );

      case QuestionTypeEnumIndex.MATCHING: // Matching
        return (
          <MatchingQuestion
            key={questionGroup.question_group_id}
            //@ts-ignore
            questionGroup={questionGroup}
            onAnswerChange={onAnswerChange}
            answers={answers}
          />
        );

      case QuestionTypeEnumIndex.DRAG_AND_DROP: // Drag and Drop
        return (
          <DragDropQuestion
            key={questionGroup.question_group_id}
            //@ts-ignore
            questionGroup={questionGroup}
            onAnswerChange={onAnswerChange}
            answers={answers}
          />
        );

      default:
        return (
          <div key={questionGroup.question_group_id} className='p-4 border rounded-lg bg-red-50'>
            <p className='text-red-600'>Unsupported question type: {questionType}</p>
          </div>
        );
    }
  };

  if (!questionGroups || questionGroups.length === 0) {
    return (
      <div className='text-center text-medium-slate-blue-500 p-8'>
        <div className='space-y-3'>
          <h3 className='text-lg font-semibold text-tekhelet-600'>No Questions Available</h3>
          <p className='text-sm text-medium-slate-blue-500'>
            Questions will be loaded when available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {questionGroups.sort((a, b) => a.section_order - b.section_order).map(renderQuestionGroup)}
    </div>
  );
};

export default ListeningQuestionRenderer;
