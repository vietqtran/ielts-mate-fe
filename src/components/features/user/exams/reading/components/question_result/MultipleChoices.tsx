import { SegmentPlayButton } from '@/components/features/user/common/attempt/SegmentPlayButton';
import { QuestionResultProps } from '@/components/features/user/exams/reading/components/question_result/DragAndDrop';
import { Badge } from '@/components/ui/badge';
import { ListeningExplanationDisplay } from '@/components/ui/listening-explanation-display';
import { SafeHtmlRenderer } from '@/lib/utils/safeHtml';
import { RefObject } from 'react';

const MultipleChoicesResult = ({
  question,
  userAnswers,
  isListening,
  audioRef,
}: QuestionResultProps) => {
  const choices = question.choices ?? [];
  const userChoiceLabels = choices
    .filter((c) => userAnswers.includes(c.choice_id))
    .map((c) => c.label);

  const hasAnswer = userChoiceLabels.length > 0;
  // Determine if the user's selection exactly matches the correct answers
  const validChoiceIds = new Set(choices.map((c) => c.choice_id));

  // Normalize user answers: remove invalid ids and duplicates
  const normalizedUserAnswers = Array.from(
    new Set(userAnswers.filter((id) => validChoiceIds.has(id)))
  );

  const correctChoiceIds = choices.filter((c) => c.is_correct).map((c) => c.choice_id);

  const isQuestionCorrect =
    hasAnswer &&
    normalizedUserAnswers.length === correctChoiceIds.length &&
    correctChoiceIds.every((id) => normalizedUserAnswers.includes(id));

  return (
    <div
      className={`rounded-lg border p-4 space-y-4 ${
        isQuestionCorrect
          ? 'border-green-400 bg-green-50/30'
          : hasAnswer
            ? 'border-red-400 bg-red-50/30'
            : 'border-gray-300 bg-white/70'
      }`}
    >
      {/* Points */}
      <div className='flex items-center justify-between text-xs text-tekhelet-500'>
        <div className='flex items-baseline gap-2'>
          <span className='font-semibold text-xl'>{question.question_order}</span>
          <span className='font-medium text-tekhelet-400'>Multiple Choice</span>
        </div>
        <div className='flex items-center gap-2'>
          {isQuestionCorrect ? (
            <Badge variant={'outline'} className='bg-green-600 text-white'>
              Correct
            </Badge>
          ) : hasAnswer ? (
            <Badge variant={'outline'} className='bg-red-500 text-white'>
              Incorrect
            </Badge>
          ) : (
            <Badge variant={'outline'} className='bg-gray-500 text-white'>
              Not Answered
            </Badge>
          )}
          <span>Points: {question.point ?? 0}</span>
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
          {hasAnswer ? userChoiceLabels.join(', ') : 'No answer provided'}
        </div>
      </div>

      {/* Choices */}
      {choices.length > 0 && (
        <div>
          <p className='text-sm font-medium text-tekhelet-400 mb-2'>Options</p>
          <div className='space-y-1'>
            {choices?.map((choice) => {
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

      {isListening && audioRef && (
        <div>
          <SegmentPlayButton
            audioRef={audioRef as RefObject<HTMLAudioElement>}
            end={question.end_time}
            start={question.start_time}
            segmentKey={question.question_id}
            key={question.question_id}
          />
        </div>
      )}

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

export default MultipleChoicesResult;
