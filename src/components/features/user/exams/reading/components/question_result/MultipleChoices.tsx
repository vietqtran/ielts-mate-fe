import { QuestionResultProps } from '@/components/features/user/exams/reading/components/question_result/DragAndDrop';
import { Badge } from '@/components/ui/badge';
import { SafeHtmlRenderer } from '@/lib/utils/safeHtml';

const MultipleChoicesResult = ({ question, userAnswers }: QuestionResultProps) => {
  const choices = question.choices ?? [];
  const userChoiceLabels = choices
    .filter((c) => userAnswers.includes(c.choice_id))
    .map((c) => c.label);

  const hasAnswer = userChoiceLabels.length > 0;

  return (
    <div className='bg-white/70 rounded-lg border p-4 space-y-4'>
      {/* Points */}
      <div className='flex items-center justify-between text-xs text-tekhelet-500'>
        <span className='font-medium text-tekhelet-400'>Multiple Choice</span>
        <span>Points: {question.point ?? 1}</span>
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
          {hasAnswer ? userChoiceLabels.join(', ') : 'No answer provided'}
        </div>
      </div>

      {/* Choices */}
      {choices.length > 0 && (
        <div>
          <p className='text-sm font-medium text-tekhelet-400 mb-2'>Options</p>
          <div className='space-y-1'>
            {choices.map((choice) => {
              const isCorrect = choice.is_correct;
              const isUserChoice = userAnswers.includes(choice.choice_id);
              return (
                <div
                  key={choice.choice_id}
                  className={`p-2 rounded text-sm flex items-center gap-2 border ${
                    isUserChoice && !isCorrect
                      ? 'bg-red-50 border-red-300'
                      : isCorrect
                        ? 'bg-green-50 border-green-300'
                        : 'bg-white border-tekhelet-900/20'
                  }`}
                >
                  <span className='font-semibold text-tekhelet-400'>{choice.label}.</span>
                  <span className='text-tekhelet-500'>{choice.content}</span>
                  {isUserChoice && (
                    <Badge
                      variant='outline'
                      className={`ml-auto ${
                        isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}
                    >
                      Your choice
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

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

export default MultipleChoicesResult;
