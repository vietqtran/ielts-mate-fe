'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useState } from 'react';

interface Choice {
  choice_id: string;
  label: string;
  content: string;
  choice_order: number;
}

interface Question {
  question_id: string;
  question_order: number;
  instruction_for_choice: string;
  choices: Choice[];
}

interface MultipleChoiceQuestionProps {
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

const MultipleChoiceQuestion = ({
  questionGroup,
  onAnswerChange,
  answers,
}: MultipleChoiceQuestionProps) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>(answers);

  const handleAnswerChange = (questionId: string, value: string) => {
    setSelectedAnswers((prev) => ({
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
      <CardContent className='space-y-6'>
        {questionGroup.questions
          .sort((a, b) => a.question_order - b.question_order)
          .map((question) => (
            <div key={question.question_id} className='border rounded-lg p-4'>
              <div className='flex items-start gap-4'>
                <div className='flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm font-medium'>
                  {question.question_order}
                </div>
                <div className='flex-1 space-y-3'>
                  <div
                    className='font-medium'
                    dangerouslySetInnerHTML={{ __html: question.instruction_for_choice }}
                  />
                  <RadioGroup
                    value={selectedAnswers[question.question_id] || ''}
                    onValueChange={(value) => handleAnswerChange(question.question_id, value)}
                    className='space-y-2'
                  >
                    {question.choices
                      .sort((a, b) => a.choice_order - b.choice_order)
                      .map((choice) => (
                        <div key={choice.choice_id} className='flex items-center space-x-2'>
                          <RadioGroupItem
                            value={choice.label}
                            id={`${question.question_id}-${choice.choice_id}`}
                          />
                          <Label
                            htmlFor={`${question.question_id}-${choice.choice_id}`}
                            className='text-sm cursor-pointer flex-1'
                          >
                            <span className='font-medium mr-2'>{choice.label}.</span>
                            {choice.content}
                          </Label>
                        </div>
                      ))}
                  </RadioGroup>
                </div>
              </div>
            </div>
          ))}
      </CardContent>
    </Card>
  );
};

export default MultipleChoiceQuestion;
