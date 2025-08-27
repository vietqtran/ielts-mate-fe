import { SegmentPlayButton } from '@/components/features/user/common/attempt/SegmentPlayButton';
import { Badge } from '@/components/ui/badge';
import { ListeningExplanationDisplay } from '@/components/ui/listening-explanation-display';
import { SafeHtmlRenderer } from '@/lib/utils/safeHtml';
import { ReadingExamAttemptDetailsQuestion } from '@/types/reading/reading-exam-attempt.types';
import { RefObject } from 'react';

export interface QuestionResultProps {
  question: ReadingExamAttemptDetailsQuestion;
  userAnswers: string[];
  isListening?: boolean; // indicates if it's a listening question
  audioRef?: RefObject<HTMLAudioElement | null>;
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
  audioRef,
}: DragAndDropProps) => {
  const hasAnswer = userAnswers.length > 0;
  const userAnswer = hasAnswer ? userAnswers[0] : null;
  const userAnswerContent = dragAndDropItems.find(
    (item) => item.drag_item_id === userAnswer
  )?.content;

  const isAnswerCorrect = userAnswer === question.correct_answer;
  const correctAnswerContent = dragAndDropItems.find(
    (item) => item.drag_item_id === question.correct_answer
  )?.content;

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
        <span className='font-medium text-tekhelet-400'>Drag and Drop</span>
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
          {userAnswerContent || 'No answer provided'}
        </div>
      </div>

      {/* Correct Answer */}
      <div>
        <p className='text-sm font-medium text-tekhelet-400 mb-1'>Correct Answer</p>
        <div className='text-green-700'>{correctAnswerContent}</div>
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
