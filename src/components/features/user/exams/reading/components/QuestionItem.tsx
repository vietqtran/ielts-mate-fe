'use client';

import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CheckCircle, ChevronDown, ChevronUp, XCircle } from 'lucide-react';

interface Question {
  question_id: string;
  question_order: number;
  instruction_for_choice?: string;
  correct_answer?: string;
  point?: number;
  question_type: number;
  explanation?: string;
  choices?: {
    choice_id: string;
    label: string;
    content: string;
    is_correct: boolean;
  }[];
}

interface QuestionItemProps {
  question: Question;
  userAnswers: string[];
  isOpen: boolean;
  onToggle: () => void;
}

export const QuestionItem = ({ question, userAnswers, isOpen, onToggle }: QuestionItemProps) => {
  // Determine if answer is correct
  let isCorrect = false;
  if (question.question_type === 0 && question.choices) {
    // Multiple choice - check by choice ID
    const correctChoiceId = question.choices.find((choice) => choice.is_correct)?.choice_id;
    isCorrect = userAnswers.includes(correctChoiceId || '');
  } else {
    // Text-based answers
    isCorrect =
      userAnswers.length > 0 &&
      userAnswers.join('').toLowerCase() === (question.correct_answer || '').toLowerCase();
  }

  const formatAnswer = (answers: string[] | undefined): string => {
    if (!Array.isArray(answers) || answers.length === 0) return 'No answer provided';
    return answers.join(', ');
  };

  return (
    <Collapsible>
      <CollapsibleTrigger onClick={onToggle} className='w-full'>
        <div
          className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
            isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
          }`}
        >
          <div className='flex items-center gap-3'>
            {isCorrect ? (
              <CheckCircle className='w-5 h-5 text-green-600' />
            ) : (
              <XCircle className='w-5 h-5 text-red-600' />
            )}
            <span className='font-medium text-tekhelet-400'>
              Question {question.question_order}
            </span>
            <Badge
              variant={'outline'}
              className={`text-xs ${
                isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}
            >
              {isCorrect ? 'Correct' : 'Incorrect'}
            </Badge>
          </div>
          {isOpen ? (
            <ChevronUp className='w-4 h-4 text-tekhelet-400' />
          ) : (
            <ChevronDown className='w-4 h-4 text-tekhelet-400' />
          )}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className='mt-2'>
        <div className='bg-white/70 rounded-lg p-4 space-y-3'>
          {/* Question Instructions */}
          {question.instruction_for_choice && (
            <div>
              <p className='text-sm font-medium text-tekhelet-400 mb-1'>Question:</p>
              <div
                className='text-tekhelet-500 text-sm prose prose-sm max-w-none'
                dangerouslySetInnerHTML={{
                  __html: question.instruction_for_choice,
                }}
              />
            </div>
          )}

          {/* Multiple Choice Options */}
          {question.choices && question.choices.length > 0 && (
            <div>
              <p className='text-sm font-medium text-tekhelet-400 mb-2'>Options:</p>
              <div className='space-y-1'>
                {question.choices.map((choice) => {
                  const isUserChoice = userAnswers.includes(choice.choice_id);
                  const isCorrectChoice = choice.is_correct;
                  return (
                    <div
                      key={choice.choice_id}
                      className={`p-2 rounded text-sm flex items-center gap-2 ${
                        isCorrectChoice
                          ? 'bg-green-100 border border-green-300'
                          : isUserChoice
                            ? 'bg-red-50 border border-red-300'
                            : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <span className='font-medium'>{choice.label}.</span>
                      <span>{choice.content}</span>
                      {isCorrectChoice && (
                        <CheckCircle className='w-4 h-4 text-green-600 ml-auto' />
                      )}
                      {isUserChoice && !isCorrectChoice && (
                        <XCircle className='w-4 h-4 text-persimmon-600 ml-auto' />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <p className='text-sm font-medium text-tekhelet-400 mb-1'>Your Answer:</p>
            <p className='text-tekhelet-500'>
              {question.choices && question.choices.length > 0
                ? userAnswers
                    .map((answerId) => {
                      const choice = question.choices?.find((c) => c.choice_id === answerId);
                      return choice ? `${choice.label}. ${choice.content}` : answerId;
                    })
                    .join(', ') || 'No answer provided'
                : formatAnswer(userAnswers)}
            </p>
          </div>
          <div>
            <p className='text-sm font-medium text-tekhelet-400 mb-1'>Correct Answer:</p>
            <p className='text-green-600'>
              {question.choices && question.choices.length > 0
                ? question.choices
                    .filter((c) => c.is_correct)
                    .map((c) => `${c.label}. ${c.content}`)
                    .join(', ') || 'N/A'
                : question.correct_answer || 'N/A'}
            </p>
          </div>
          {question.explanation && (
            <div>
              <p className='text-sm font-medium text-tekhelet-400 mb-1'>Explanation:</p>
              <p className='text-tekhelet-500 text-sm'>{question.explanation}</p>
            </div>
          )}
          <div className='flex justify-between text-xs text-tekhelet-400'>
            <span>Points: {question.point || 1}</span>
            <span>
              Question Type:{' '}
              {question.question_type === 0
                ? 'Multiple Choice'
                : question.question_type === 1
                  ? 'Fill in the Blank'
                  : 'Other'}
            </span>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
