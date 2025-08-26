import { AttemptQuestionResultProps } from '@/components/features/user/common/attempt/question_result/DragAndDrop';
import { Badge } from '@/components/ui/badge';
import { SafeHtmlRenderer } from '@/lib/utils/safeHtml';

const AttemptFillInTheBlanksResult = ({ question, userAnswers }: AttemptQuestionResultProps) => {
  const hasAnswer = userAnswers.length > 0;
  const userAnswer = hasAnswer ? userAnswers[0]?.filled_text_answer.toString() : 'null';
  const isAnswerCorrect = userAnswer === question.correct_answer;

  return (
    <div
      className={`${
        isAnswerCorrect ? 'bg-green-100/30' : 'bg-red-100/30'
      } rounded-lg border p-4 space-y-4`}
    >
      {/* Points */}
      <div className='flex items-center justify-between text-xs text-tekhelet-500'>
        <span className='font-medium text-tekhelet-400'>Fill in the blanks</span>
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
        <div className='text-tekhelet-500 font-semibold'>{userAnswer || 'No answer provided'}</div>
      </div>

      {/* Correct Answer */}
      <div>
        <p className='text-sm font-medium text-tekhelet-400 mb-1'>Correct Answer</p>
        <div className='text-green-700 font-semibold'>{question.correct_answer}</div>
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

export default AttemptFillInTheBlanksResult;
