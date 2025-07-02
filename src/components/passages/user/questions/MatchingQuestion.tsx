'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useState } from 'react';

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
  onAnswerChange: (questionId: string, answer: string) => void;
  answers: Record<string, string>;
}

const MatchingQuestion = ({ questionGroup, onAnswerChange, answers }: MatchingQuestionProps) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>(answers);

  const handleAnswerChange = (questionId: string, value: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
    onAnswerChange(questionId, value);
  };

  // Extract teaching styles from instruction
  const teachingStyles = [
    { key: 'A', label: 'Formal authority' },
    { key: 'B', label: 'Demonstrator' },
    { key: 'C', label: 'Delegator' },
    { key: 'D', label: 'Facilitator' },
  ];

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
        {/* Teaching Styles Reference */}
        <div className='bg-blue-50 p-4 rounded-lg'>
          <h4 className='font-medium text-blue-900 mb-2'>Teaching Styles</h4>
          <div className='grid grid-cols-2 gap-2 text-sm'>
            {teachingStyles.map((style) => (
              <div key={style.key}>
                <span className='font-medium'>{style.key}.</span> {style.label}
              </div>
            ))}
          </div>
        </div>

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
                      dangerouslySetInnerHTML={{ __html: question.instruction_for_matching }}
                    />
                    <RadioGroup
                      value={selectedAnswers[question.question_id] || ''}
                      onValueChange={(value) => handleAnswerChange(question.question_id, value)}
                      className='flex flex-wrap gap-4'
                    >
                      {teachingStyles.map((style) => (
                        <div key={style.key} className='flex items-center space-x-2'>
                          <RadioGroupItem
                            value={style.key}
                            id={`${question.question_id}-${style.key}`}
                          />
                          <Label
                            htmlFor={`${question.question_id}-${style.key}`}
                            className='text-sm font-medium cursor-pointer'
                          >
                            {style.key}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
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
