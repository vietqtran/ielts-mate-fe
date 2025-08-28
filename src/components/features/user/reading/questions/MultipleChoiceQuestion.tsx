'use client';

import { HandleAnswerChangeParams } from '@/components/features/user/reading/practice/ReadingPractice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { QuestionTypeEnumIndex } from '@/types/reading/reading.types';
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
  question_type: number;
  number_of_correct_answers: number;
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
  onAnswerChange: (params: HandleAnswerChangeParams) => void;
  answers: Record<
    string,
    {
      answer_id: string | string[]; // Support both single and multiple answers
      questionType: QuestionTypeEnumIndex;
      questionOrder: number;
      content: string;
    }
  >;
}

const MultipleChoiceQuestion = ({
  questionGroup,
  onAnswerChange,
  answers,
}: MultipleChoiceQuestionProps) => {
  const [selectedAnswers, setSelectedAnswers] =
    useState<Record<string, (typeof answers)[string]>>(answers);

  const handleAnswerChange = (questionId: string, value: string, questionOrder: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: {
        answer_id: value,
        questionType: QuestionTypeEnumIndex.MULTIPLE_CHOICE,
        questionOrder,
        content: value, // Assuming content is the same as answer_id for multiple choice
      },
    }));
    onAnswerChange({
      questionId,
      answer_id: value,
      questionType: QuestionTypeEnumIndex.MULTIPLE_CHOICE,
      questionOrder,
      content: value,
    } as HandleAnswerChangeParams);
  };

  const handleMultipleAnswerChange = (
    questionId: string,
    choiceId: string,
    isChecked: boolean,
    questionOrder: number
  ) => {
    setSelectedAnswers((prev) => {
      const currentAnswers = Array.isArray(prev[questionId]?.answer_id)
        ? (prev[questionId].answer_id as string[])
        : prev[questionId]?.answer_id
          ? [prev[questionId].answer_id as string]
          : [];

      const newAnswers = isChecked
        ? [...currentAnswers, choiceId]
        : currentAnswers.filter((id) => id !== choiceId);

      const updatedAnswer = {
        answer_id: newAnswers,
        questionType: QuestionTypeEnumIndex.MULTIPLE_CHOICE,
        questionOrder,
        content: newAnswers.join(', '), // Join multiple answers for content
      };

      return {
        ...prev,
        [questionId]: updatedAnswer,
      };
    });

    // Get the updated answers for the callback
    const currentAnswers = Array.isArray(selectedAnswers[questionId]?.answer_id)
      ? (selectedAnswers[questionId].answer_id as string[])
      : selectedAnswers[questionId]?.answer_id
        ? [selectedAnswers[questionId].answer_id as string]
        : [];

    const newAnswers = isChecked
      ? [...currentAnswers, choiceId]
      : currentAnswers.filter((id) => id !== choiceId);

    onAnswerChange({
      questionId,
      answer_id: newAnswers,
      questionType: QuestionTypeEnumIndex.MULTIPLE_CHOICE,
      questionOrder,
      content: newAnswers.join(', '),
    } as HandleAnswerChangeParams);
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
                    dangerouslySetInnerHTML={{
                      __html: question.instruction_for_choice,
                    }}
                  />
                  {question.number_of_correct_answers > 1 ? (
                    // Multiple choice (checkboxes)
                    <div className='space-y-2'>
                      {question?.choices
                        ?.sort((a, b) => a.choice_order - b.choice_order)
                        ?.map((choice) => {
                          const currentAnswers = Array.isArray(
                            selectedAnswers[question.question_id]?.answer_id
                          )
                            ? (selectedAnswers[question.question_id].answer_id as string[])
                            : selectedAnswers[question.question_id]?.answer_id
                              ? [selectedAnswers[question.question_id].answer_id as string]
                              : [];
                          const isChecked = currentAnswers.includes(choice.choice_id);

                          return (
                            <div key={choice.choice_id} className='flex items-center space-x-2'>
                              <Checkbox
                                id={`${question.question_id}-${choice.choice_id}`}
                                checked={isChecked}
                                onCheckedChange={(checked) =>
                                  handleMultipleAnswerChange(
                                    question.question_id,
                                    choice.choice_id,
                                    checked as boolean,
                                    question.question_order
                                  )
                                }
                                disabled={
                                  !isChecked &&
                                  currentAnswers.length >= question.number_of_correct_answers
                                }
                              />
                              <Label
                                htmlFor={`${question.question_id}-${choice.choice_id}`}
                                className='text-sm cursor-pointer flex-1'
                              >
                                <span className='font-medium mr-2'>{choice.label}.</span>
                                {choice.content}
                              </Label>
                            </div>
                          );
                        })}
                      <div className='text-xs text-muted-foreground mt-2'>
                        Select {question.number_of_correct_answers} answer
                        {question.number_of_correct_answers > 1 ? 's' : ''}
                        {Array.isArray(selectedAnswers[question.question_id]?.answer_id) && (
                          <span className='ml-2'>
                            ({(selectedAnswers[question.question_id].answer_id as string[]).length}{' '}
                            of {question.number_of_correct_answers} selected)
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    // Single choice (radio buttons)
                    <RadioGroup
                      value={
                        Array.isArray(selectedAnswers[question.question_id]?.answer_id)
                          ? ''
                          : (selectedAnswers[question.question_id]?.answer_id as string) || ''
                      }
                      onValueChange={(value) =>
                        handleAnswerChange(question.question_id, value, question.question_order)
                      }
                      className='space-y-2'
                    >
                      {question?.choices
                        ?.sort((a, b) => a.choice_order - b.choice_order)
                        ?.map((choice) => (
                          <div key={choice.choice_id} className='flex items-center space-x-2'>
                            <RadioGroupItem
                              value={choice.choice_id}
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
                  )}
                </div>
              </div>
            </div>
          ))}
      </CardContent>
    </Card>
  );
};

export default MultipleChoiceQuestion;
