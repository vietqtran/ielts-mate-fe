'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

interface Question {
  question_id: string;
  question_order: number;
  blank_index: number;
  correct_answer?: string; // This won't be shown to user, just for structure
}

interface FillInBlankQuestionProps {
  questionGroup: {
    question_group_id: string;
    section_order: number;
    section_label: string;
    instruction: string;
    questions: Question[];
  };
  onAnswerChange: (questionId: string, answer: string) => void;
  answers: Record<string, string>;
}

const FillInBlankQuestion = ({
  questionGroup,
  onAnswerChange,
  answers,
}: FillInBlankQuestionProps) => {
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>(answers);

  const handleAnswerChange = (questionId: string, value: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
    onAnswerChange(questionId, value);
  };

  return (
    <Card className='mb-6'>
      <CardHeader>
        <CardTitle className='text-lg font-semibold'>{questionGroup.section_label}</CardTitle>
        <div
          className='text-sm text-muted-foreground'
          dangerouslySetInnerHTML={{ __html: questionGroup.instruction }}
        />
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='bg-yellow-50 p-4 rounded-lg'>
          <p className='text-sm text-yellow-800'>
            <strong>Instructions:</strong> Fill in the blanks with appropriate words or phrases.
            Write NO MORE THAN TWO WORDS for each answer.
          </p>
        </div>

        <div className='grid gap-4'>
          {questionGroup.questions
            .sort((a, b) => a.question_order - b.question_order)
            .map((question) => (
              <div
                key={question.question_id}
                className='flex items-center gap-4 p-3 border rounded-lg'
              >
                <div className='flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-sm font-medium'>
                  {question.question_order}
                </div>
                <div className='flex items-center gap-2 flex-1'>
                  <Label htmlFor={`blank-${question.question_id}`} className='text-sm font-medium'>
                    Blank {question.blank_index}:
                  </Label>
                  <Input
                    id={`blank-${question.question_id}`}
                    type='text'
                    placeholder='Enter your answer'
                    value={userAnswers[question.question_id] || ''}
                    onChange={(e) => handleAnswerChange(question.question_id, e.target.value)}
                    className='flex-1 max-w-xs'
                  />
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FillInBlankQuestion;
