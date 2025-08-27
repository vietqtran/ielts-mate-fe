import { SegmentPlayButton } from '@/components/features/user/common/attempt/SegmentPlayButton';
import { Badge } from '@/components/ui/badge';
import { SafeHtmlRenderer } from '@/lib/utils/safeHtml';
import { AttemptAnswer, AttemptResponseQuestion } from '@/types/attempt.types';
import { RefObject } from 'react';

export interface AttemptQuestionResultProps {
  question: AttemptResponseQuestion;
  userAnswers: AttemptAnswer[];
  audioRef?: RefObject<HTMLAudioElement | null>;
  isListening?: boolean; // indicates if it's a listening question
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
  audioRef,
  isListening,
}: AttemptDragAndDropProps) => {
  const hasAnswer = userAnswers.length > 0 && userAnswers[0]?.drag_item_id;
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
        <div className='flex items-baseline gap-2'>
          <span className='font-semibold text-xl'>{question.question_order}</span>
          <span className='font-medium text-tekhelet-400'>Drag and Drop</span>
        </div>
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
        <div className='text-tekhelet-500 font-semibold'>
          {userAnswer ? userAnswerContent : 'No answer provided'}
        </div>
      </div>

      {/* Correct Answer */}
      <div>
        <p className='text-sm font-medium text-tekhelet-400 mb-1'>Correct Answer</p>
        <div className='text-green-700 font-semibold'>{correctAnswerContent}</div>
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

export default AttemptDragAndDropResult;
