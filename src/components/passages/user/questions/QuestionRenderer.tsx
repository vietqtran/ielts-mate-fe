'use client';

import { HandleAnswerChangeParams } from '@/app/(root)/@user/reading/[id]/practice/page';
import { QuestionGroup as AttemptQuestionGroup } from '@/types/attemp.types';
import { QuestionTypeEnumIndex } from '@/types/reading.types';
import DragDropQuestion from './DragDropQuestion';
import FillInBlankQuestion from './FillInBlankQuestion';
import MatchingQuestion from './MatchingQuestion';
import MultipleChoiceQuestion from './MultipleChoiceQuestion';

interface QuestionRendererProps {
  questionGroups: AttemptQuestionGroup[];
  onAnswerChange: (params: HandleAnswerChangeParams) => void;
  answers: Record<
    string,
    {
      answer_id: string;
      questionType: QuestionTypeEnumIndex;
      questionOrder: number;
      content: string;
    }
  >;
}

const QuestionRenderer = ({ questionGroups, onAnswerChange, answers }: QuestionRendererProps) => {
  const renderQuestionGroup = (questionGroup: AttemptQuestionGroup) => {
    if (questionGroup.questions.length === 0) return null;

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

  return (
    <div className='space-y-6'>
      {questionGroups.sort((a, b) => a.section_order - b.section_order).map(renderQuestionGroup)}
    </div>
  );
};

export default QuestionRenderer;
