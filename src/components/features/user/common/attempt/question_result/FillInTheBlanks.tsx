import { SegmentPlayButton } from '@/components/features/user/common/attempt/SegmentPlayButton';
import { AttemptQuestionResultProps } from '@/components/features/user/common/attempt/question_result/DragAndDrop';
import { Badge } from '@/components/ui/badge';
import { SafeHtmlRenderer } from '@/lib/utils/safeHtml';
import { RefObject } from 'react';

const AttemptFillInTheBlanksResult = ({
  question,
  userAnswers,
  audioRef,
  isListening,
}: AttemptQuestionResultProps) => {
  const hasAnswer = userAnswers.length > 0 && userAnswers[0]?.filled_text_answer;
  const userAnswer = hasAnswer ? (userAnswers[0]?.filled_text_answer ?? null) : null;
  const isAnswerCorrect = userAnswer === question.correct_answer;

  return (
    <div
      className={`rounded-lg border p-4 space-y-4 ${
        isAnswerCorrect
          ? 'border-green-400 bg-green-50/30'
          : hasAnswer
            ? 'border-red-400 bg-red-50/30'
            : 'border-gray-300 bg-white/70'
      }`}
    >
      {/* Points */}
      <div className='flex items-center justify-between text-xs text-tekhelet-500'>
        <span className='font-medium text-tekhelet-400'>Fill in the blanks</span>
        <div className='flex items-center gap-2'>
          {isAnswerCorrect ? (
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

      {isListening && audioRef && (
        <div>
          <SegmentPlayButton
            audioRef={audioRef as RefObject<HTMLAudioElement>}
            end={question.end_time}
            start={question.start_time}
            segmentKey={question.question_id}
          />
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

export default AttemptFillInTheBlanksResult;
