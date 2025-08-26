import { Badge } from '@/components/ui/badge';
import { SafeHtmlRenderer } from '@/lib/utils/safeHtml';
import { AttemptAnswer, AttemptResponseQuestion } from '@/types/attempt.types';

export interface AttemptQuestionResultProps {
  question: AttemptResponseQuestion;
  userAnswers: AttemptAnswer[];
}

export interface AttemptDragAndDropProps extends AttemptQuestionResultProps {
  dragAndDropItems: {
    drag_item_id: string;
    content: string;
  }[];
}
const AttemptDragAndDropResult = ({
  question,
  userAnswers,
  dragAndDropItems,
}: AttemptDragAndDropProps) => {
  const hasAnswer = userAnswers.length > 0;
  const userAnswer = hasAnswer ? (userAnswers[0]?.drag_item_id ?? null) : null;
  const userAnswerContent = dragAndDropItems.map((item) =>
    userAnswer === item.drag_item_id ? item.content : null
  );

  const isAnswerCorrect = userAnswer === question.drag_item_id;
  const correctAnswerContent = dragAndDropItems.map((item) =>
    item.drag_item_id === question.drag_item_id ? item.content : null
  );

  return (
    <div
      className={`${
        isAnswerCorrect ? 'bg-green-100/30' : 'bg-red-100/20'
      } rounded-lg border p-4 space-y-4`}
    >
      {/* Points */}
      <div className='flex items-center justify-between text-xs text-tekhelet-500'>
        <span className='font-medium text-tekhelet-400'>Drag and Drop</span>
        <div className='flex items-center gap-2'>
          {isAnswerCorrect ? (
            <Badge variant={'outline'} className='bg-green-700 text-white'>
              Correct
            </Badge>
          ) : (
            <Badge variant={'outline'} className='bg-red-700 text-white'>
              Incorrect
            </Badge>
          )}
          <span>Points: {question.point ?? 1}</span>
        </div>
      </div>

      {/* Instruction */}
      {question.instruction_for_choice && (
        <div>
          <p className='text-sm font-medium text-tekhelet-400 mb-1'>Question</p>
          <SafeHtmlRenderer
            htmlContent={question.instruction_for_choice}
            className='text-tekhelet-500 text-sm prose prose-sm max-w-none'
          />
        </div>
      )}

      {/* User Answer */}
      <div>
        <p className='text-sm font-medium text-tekhelet-400 mb-1'>Your Answer</p>
        <div className='text-tekhelet-500 font-semibold'>
          {userAnswerContent || 'No answer provided'}
        </div>
      </div>

      {/* Correct Answer */}
      <div>
        <p className='text-sm font-medium text-tekhelet-400 mb-1'>Correct Answer</p>
        <div className='text-green-700 font-semibold'>{correctAnswerContent}</div>
      </div>

      {/* Explanation */}
      {question.explanation && (
        <div>
          <p className='text-sm font-medium text-tekhelet-400 mb-1'>Explanation</p>
          <SafeHtmlRenderer
            htmlContent={question.explanation}
            className='text-tekhelet-500 text-sm prose prose-sm max-w-none'
          />
        </div>
      )}
    </div>
  );
};

export default AttemptDragAndDropResult;
