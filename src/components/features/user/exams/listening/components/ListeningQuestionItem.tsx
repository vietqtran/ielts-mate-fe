'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SafeHtmlRenderer } from '@/lib/utils/safeHtml';
import { DragItem } from '@/types/attempt.types';
import { ListeningChoice, ListeningQuestion } from '@/types/listening/listening-exam.types';
import { Check, ChevronDown, ChevronUp, X } from 'lucide-react';

interface ListeningQuestionItemProps {
  question: ListeningQuestion;
  userAnswers: string[];
  isOpen: boolean;
  onToggle: () => void;
  choices?: ListeningChoice[];
  dragItems?: DragItem[];
}

export const ListeningQuestionItem = ({
  question,
  userAnswers,
  isOpen,
  onToggle,
  choices,
  dragItems,
}: ListeningQuestionItemProps) => {
  // Determine if the answer is correct
  const isCorrect = () => {
    const correctAnswer = question.correct_answer || '';

    if (question.question_type === 0 && choices) {
      // Multiple choice - check by choice ID
      const correctChoiceId = choices.find((choice) => choice.is_correct)?.choice_id;
      return userAnswers.includes(correctChoiceId || '');
    } else {
      // Text-based answers
      return (
        userAnswers.length > 0 && userAnswers.join('').toLowerCase() === correctAnswer.toLowerCase()
      );
    }
  };

  const correct = isCorrect();

  // Get user answer text for display
  const getUserAnswerText = () => {
    if (question.question_type === 0 && choices) {
      const selectedChoices = choices.filter((choice) => userAnswers.includes(choice.choice_id));
      return selectedChoices.map((choice) => choice.content).join(', ');
    } else if (dragItems && userAnswers.length > 0) {
      const selectedDragItems = dragItems.filter((item) => userAnswers.includes(item.drag_item_id));
      return selectedDragItems.map((item) => item.content).join(', ');
    }
    return userAnswers.join(', ');
  };

  // Get correct answer text for display
  const getCorrectAnswerText = () => {
    if (question.question_type === 0 && choices) {
      const correctChoice = choices.find((choice) => choice.is_correct);
      return correctChoice?.content || question.correct_answer;
    } else if (dragItems && question.correct_answer) {
      const correctDragItem = dragItems.find(
        (item) => item.drag_item_id === question.correct_answer
      );
      return correctDragItem?.content || question.correct_answer;
    }
    return question.correct_answer;
  };

  return (
    <Card
      className={`border ${
        correct ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'
      }`}
    >
      <Collapsible open={isOpen} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <CardHeader className='cursor-pointer hover:bg-white/50 transition-colors'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    correct ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}
                >
                  {correct ? <Check className='w-4 h-4' /> : <X className='w-4 h-4' />}
                </div>
                <div>
                  <div className='flex items-center gap-2'>
                    <span className='font-medium text-tekhelet-600'>
                      Question {question.question_order}
                    </span>
                    <Badge variant={correct ? 'default' : 'destructive'} className='text-xs'>
                      {question.point || 1} {question.point === 1 ? 'point' : 'points'}
                    </Badge>
                  </div>
                  <p className='text-sm text-tekhelet-500 mt-1'>
                    Your answer: {getUserAnswerText() || 'No answer'}
                  </p>
                </div>
              </div>
              {isOpen ? <ChevronUp className='w-5 h-5' /> : <ChevronDown className='w-5 h-5' />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className='space-y-4 pt-0'>
            {/* Question Type Info */}
            <div className='border backdrop-blur-lg rounded-lg p-3'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium text-tekhelet-600'>Question Type</span>
                <Badge variant='outline' className='text-xs'>
                  {question.question_type === 0
                    ? 'Multiple Choice'
                    : question.question_type === 1
                      ? 'Fill in the blank'
                      : question.question_type === 2
                        ? 'Matching'
                        : 'Other'}
                </Badge>
              </div>
              {question.instruction_for_choice && (
                <SafeHtmlRenderer
                  htmlContent={question.instruction_for_choice}
                  className='text-sm text-tekhelet-500 mt-2'
                />
              )}
            </div>

            {/* Answer Comparison */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Your Answer */}
              <div className='space-y-2'>
                <h4 className='font-medium text-tekhelet-600'>Your Answer</h4>
                <div
                  className={`p-3 rounded-lg border-2 ${
                    correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <p className='text-sm'>{getUserAnswerText() || 'No answer provided'}</p>
                </div>
              </div>

              {/* Correct Answer */}
              <div className='space-y-2'>
                <h4 className='font-medium text-tekhelet-600'>Correct Answer</h4>
                <div className='p-3 rounded-lg border-2 border-green-200 bg-green-50'>
                  <p className='text-sm'>{getCorrectAnswerText()}</p>
                </div>
              </div>
            </div>

            {/* Multiple Choice Options */}
            {question.question_type === 0 && choices && choices.length > 0 && (
              <div className='space-y-2'>
                <h4 className='font-medium text-tekhelet-600'>Answer Choices</h4>
                <div className='space-y-2'>
                  {choices.map((choice) => {
                    const isSelected = userAnswers.includes(choice.choice_id);
                    const isCorrectChoice = choice.is_correct;

                    return (
                      <div
                        key={choice.choice_id}
                        className={`p-3 rounded-lg border ${
                          isCorrectChoice
                            ? 'border-green-200 bg-green-50'
                            : isSelected
                              ? 'border-red-200 bg-red-50'
                              : 'border-tekhelet-200 bg-white/50'
                        }`}
                      >
                        <div className='flex items-center gap-2'>
                          <span className='text-sm'>{choice.content}</span>
                          {isCorrectChoice && <Check className='w-4 h-4 text-green-600 ml-auto' />}
                          {isSelected && !isCorrectChoice && (
                            <X className='w-4 h-4 text-red-600 ml-auto' />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Explanation */}
            {question.explanation && (
              <div className='space-y-2'>
                <h4 className='font-medium text-tekhelet-600'>Explanation</h4>
                <div className='p-3 rounded-lg border '>
                  <SafeHtmlRenderer
                    htmlContent={question.explanation}
                    className='text-sm text-tekhelet-400'
                  />
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
