'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QuestionTypeEnumIndex } from '@/types/reading.types';
import { useState } from 'react';
import * as z from 'zod';

// Zod schema for validating matching answers
const matchingAnswerSchema = z
  .string()
  .regex(/^[A-Z](,[A-Z])*$/, {
    message: 'Answer must be uppercase letters separated by commas (e.g., A, B, or A,B,C)',
  })
  .or(z.literal(''));

interface Question {
  question_id: string;
  question_order: number;
  instruction_for_matching: string;
}

interface MatchingQuestionProps {
  questionGroup: {
    question_group_id: string;
    section_order: number;
    section_label: string;
    instruction: string;
    questions: Question[];
  };
  onAnswerChange: (questionId: string, answer: string, questionType: QuestionTypeEnumIndex) => void;
  answers: Record<string, { answer: string; questionType: QuestionTypeEnumIndex }>;
}

const MatchingQuestion = ({ questionGroup, onAnswerChange, answers }: MatchingQuestionProps) => {
  const [selectedAnswers, setSelectedAnswers] =
    useState<Record<string, { answer: string; questionType: QuestionTypeEnumIndex }>>(answers);

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleAnswerChange = (questionId: string, value: string, questionOrder: number) => {
    // Convert to uppercase for consistency
    const upperValue = value.toUpperCase();

    // Validate the input using Zod schema
    const validationResult = matchingAnswerSchema.safeParse(upperValue);

    // Update validation errors
    setValidationErrors((prev) => ({
      ...prev,
      [questionId]: validationResult.success
        ? ''
        : validationResult.error.errors[0]?.message || 'Invalid format',
    }));

    // Format the answer as "questionOrder-userInput" (e.g., "17-A")
    const formattedAnswer = upperValue ? `${questionOrder}-${upperValue}` : '';

    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: {
        answer: formattedAnswer,
        questionType: QuestionTypeEnumIndex.MATCHING,
      },
    }));

    // Only call onAnswerChange if the input is valid or empty
    if (validationResult.success) {
      onAnswerChange(questionId, formattedAnswer, QuestionTypeEnumIndex.MATCHING);
    }
  };

  return (
    <Card className='mb-6'>
      <CardHeader>
        <CardTitle className='text-lg font-semibold'>{questionGroup.section_label}</CardTitle>
        <div
          className='text-sm text-muted-foreground'
          dangerouslySetInnerHTML={{ __html: questionGroup.instruction }}
        />
        <p>
          <strong>Note:</strong> If you want to match multiple answers to a single question,
          separate them with commas (e.g., "A,B").
        </p>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Questions */}
        <div className='space-y-4'>
          {questionGroup.questions
            .sort((a, b) => a.question_order - b.question_order)
            .map((question) => (
              <div key={question.question_id} className='border rounded-lg p-4'>
                <div className='flex items-start gap-4'>
                  <div className='flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium'>
                    {question.question_order}
                  </div>
                  <div className='flex-1'>
                    <div
                      className='mb-3'
                      dangerouslySetInnerHTML={{
                        __html: question.instruction_for_matching,
                      }}
                    />

                    <div className='space-y-2'>
                      <Label
                        htmlFor={`input-${question.question_id}`}
                        className='text-sm font-medium'
                      >
                        Your answer
                      </Label>
                      <Input
                        id={`input-${question.question_id}`}
                        type='text'
                        placeholder='Enter your answer (e.g., A or A,B,C)'
                        value={
                          selectedAnswers[question.question_id]?.answer
                            ? selectedAnswers[question.question_id].answer.split('-')[1] || ''
                            : ''
                        }
                        onChange={(e) =>
                          handleAnswerChange(
                            question.question_id,
                            e.target.value,
                            question.question_order
                          )
                        }
                        className={`w-40 ${
                          validationErrors[question.question_id]
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                            : ''
                        }`}
                        maxLength={32}
                      />
                      {validationErrors[question.question_id] && (
                        <p className='text-sm text-red-600 mt-1'>
                          {validationErrors[question.question_id]}
                        </p>
                      )}
                      <div className='text-xs text-gray-500 mt-1'>
                        Format: Single letter (A) or comma-separated letters (A,B,C)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchingQuestion;
