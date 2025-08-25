import { Badge } from '@/components/ui/badge';
import { ListeningExplanationDisplay } from '@/components/ui/listening-explanation-display';
import { SafeHtmlRenderer } from '@/lib/utils/safeHtml';
import { ReadingExamAttemptDetailsQuestion } from '@/types/reading/reading-exam-attempt.types';

export interface QuestionResultProps {
  question: ReadingExamAttemptDetailsQuestion;
  userAnswers: string[];
}

export interface DragAndDropProps extends QuestionResultProps {
  dragAndDropItems: {
    drag_item_id: string;
    content: string;
  }[];
}
const DragAndDropResult = ({
  question,
  userAnswers,
  dragAndDropItems,
  isListening,
}: DragAndDropProps & { isListening?: boolean }) => {
  const hasAnswer = userAnswers.length > 0;
  const userAnswer = hasAnswer ? userAnswers[0] : 'No answer provided';
  const userAnswerContent = dragAndDropItems.find(
    (item) => item.drag_item_id === userAnswer
  )?.content;

  const isAnswerCorrect = userAnswer === question.correct_answer;
  const correctAnswerContent = dragAndDropItems.find(
    (item) => item.drag_item_id === question.correct_answer
  )?.content;

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
        <div className='text-tekhelet-500'>{userAnswerContent}</div>
      </div>

      {/* Correct Answer */}
      <div>
        <p className='text-sm font-medium text-tekhelet-400 mb-1'>Correct Answer</p>
        <div className='text-green-700'>{correctAnswerContent}</div>
      </div>

      {/* Explanation */}
      {question.explanation && (
        <div>
          <p className='text-sm font-medium text-tekhelet-400 mb-1'>Explanation</p>
          {isListening ? (
            <ListeningExplanationDisplay
              explanation={question.explanation}
              className='text-tekhelet-500 text-sm'
            />
          ) : (
            <SafeHtmlRenderer
              htmlContent={question.explanation}
              className='text-tekhelet-500 text-sm prose prose-sm max-w-none'
            />
          )}
        </div>
      )}
    </div>
  );
};

export default DragAndDropResult;
