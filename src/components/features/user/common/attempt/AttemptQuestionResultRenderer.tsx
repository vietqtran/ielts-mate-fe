'use client';

import AttemptDragAndDropResult from '@/components/features/user/common/attempt/question_result/DragAndDrop';
import AttemptFillInTheBlanksResult from '@/components/features/user/common/attempt/question_result/FillInTheBlanks';
import AttemptMatchingResult from '@/components/features/user/common/attempt/question_result/Matching';
import AttemptMultipleChoicesResult from '@/components/features/user/common/attempt/question_result/MultipleChoices';
import { AttemptAnswer, AttemptResponseQuestion, Choice } from '@/types/attempt.types';
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
        <div className='p-3 rounded-lg border bg-white/70 text-tekhelet-500'>
          Unsupported question type
        </div>
      );
  }
};

// Helper: evaluate if a question is answered correctly based on the same
// logic used in the 4 child components above.
export const isAttemptQuestionCorrect = (
  question: AttemptResponseQuestion,
  userAnswers: AttemptAnswer[]
): boolean => {
  switch (question.question_type) {
    case QuestionTypeEnumIndex.MULTIPLE_CHOICE: {
      const choices: Choice[] = question.choices ?? [];
      const userChoices = userAnswers.map((ans) => ans.choice_ids).flat();
      // Correct when every correct choice is selected and no incorrect choice is selected
      return choices.every((choice) =>
        choice.is_correct
          ? userChoices.includes(choice.choice_id)
          : !userChoices.includes(choice.choice_id)
      );
    }
    case QuestionTypeEnumIndex.FILL_IN_THE_BLANKS: {
      const hasAnswer = userAnswers.length > 0;
      const userAnswer = hasAnswer ? userAnswers[0]?.filled_text_answer?.toString() : null;
      return (userAnswer ?? null) === (question.correct_answer ?? null);
    }
    case QuestionTypeEnumIndex.MATCHING: {
      const hasAnswer = userAnswers.length > 0;
      const userAnswer = hasAnswer ? (userAnswers[0]?.matched_text_answer ?? null) : null;
      return (userAnswer ?? null) === (question.correct_answer_for_matching ?? null);
    }
    case QuestionTypeEnumIndex.DRAG_AND_DROP: {
      const hasAnswer = userAnswers.length > 0;
      const userAnswer = hasAnswer ? (userAnswers[0]?.drag_item_id ?? null) : null;
      return (userAnswer ?? null) === (question.drag_item_id ?? null);
    }
    default:
      return false;
  }
};
