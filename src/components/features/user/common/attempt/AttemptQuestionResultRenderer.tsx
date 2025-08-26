'use client';

import AttemptDragAndDropResult from '@/components/features/user/common/attempt/question_result/DragAndDrop';
import AttemptFillInTheBlanksResult from '@/components/features/user/common/attempt/question_result/FillInTheBlanks';
import AttemptMatchingResult from '@/components/features/user/common/attempt/question_result/Matching';
import AttemptMultipleChoicesResult from '@/components/features/user/common/attempt/question_result/MultipleChoices';
import { AttemptAnswer, AttemptResponseQuestion } from '@/types/attempt.types';
import { QuestionTypeEnumIndex } from '@/types/reading/reading.types';

interface AttemptQuestionResultRenderer {
  question: AttemptResponseQuestion;
  userAnswers: AttemptAnswer[];
  dragAndDropItems: {
    drag_item_id: string;
    content: string;
  }[];
}

export const AttemptQuestionResultRenderer = ({
  question,
  userAnswers,
  dragAndDropItems,
}: AttemptQuestionResultRenderer) => {
  switch (question.question_type) {
    case QuestionTypeEnumIndex.MULTIPLE_CHOICE:
      return <AttemptMultipleChoicesResult question={question} userAnswers={userAnswers} />;
    case QuestionTypeEnumIndex.FILL_IN_THE_BLANKS:
      return <AttemptFillInTheBlanksResult question={question} userAnswers={userAnswers} />;
    case QuestionTypeEnumIndex.MATCHING:
      return <AttemptMatchingResult question={question} userAnswers={userAnswers} />;
    case QuestionTypeEnumIndex.DRAG_AND_DROP:
      return (
        <AttemptDragAndDropResult
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
