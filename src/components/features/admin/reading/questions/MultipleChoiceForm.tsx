'use client';

import * as z from 'zod';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { TiptapEditor } from '@/components/ui/tiptap-editor';
import instance from '@/lib/axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';

interface Choice {
  id?: string;
  label: string;
  content: string;
  choice_order: number;
  is_correct: boolean;
}

const choiceSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, 'Label is required'),
  content: z.string().min(1, 'Content is required'),
  choice_order: z.number().min(1),
  is_correct: z.boolean(),
});

const questionSchema = z.object({
  question_order: z.number().min(1),
  point: z.number().min(1),
  explanation: z.string().min(1, 'Explanation is required'),
  instruction_for_choice: z.string().min(1, 'Instruction is required'),
  number_of_correct_answers: z.number().min(1),
  choices: z.array(choiceSchema).min(2, 'At least 2 choices required'),
});

type QuestionFormData = z.infer<typeof questionSchema>;

interface MultipleChoiceFormProps {
  questions: any[];
  onQuestionsChange: (questions: any[]) => void;
}

export function MultipleChoiceForm({
  questions,
  onQuestionsChange,
}: Readonly<MultipleChoiceFormProps>) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      question_order:
        questions.length > 0 ? Math.max(...questions.map((q: any) => q.question_order)) + 1 : 1,
      point: 1,
      explanation: '',
      instruction_for_choice: '',
      number_of_correct_answers: 1,
      choices: [
        { label: 'A', content: '', choice_order: 1, is_correct: false },
        { label: 'B', content: '', choice_order: 2, is_correct: false },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'choices',
  });

  const number_of_correct_answers = form.watch('number_of_correct_answers');
  const isMultipleChoice = number_of_correct_answers > 1;

  const handleSubmit = async (data: QuestionFormData) => {
    setIsSubmitting(true);
    try {
      const newQuestion = {
        ...data,
        question_type: 0, // MULTIPLE_CHOICE
        question_categories: [],
      };

      if (editingIndex !== null) {
        const question_id = questions[editingIndex].question_id;

        // Step 1: First update - set number_of_correct_answers to total number of choices
        // This ensures database has enough capacity for all choices before we create/update them
        const totalChoicesCount = data.choices.length;
        const originalQuestion = questions[editingIndex];
        await instance.put(`/reading/questions/${question_id}`, {
          question_order: data.question_order,
          point: data.point,
          explanation: data.explanation,
          question_categories: originalQuestion.question_categories || [],
          number_of_correct_answers: totalChoicesCount, // Set to total choices first
          instruction_for_choice: data.instruction_for_choice,
          blank_index: undefined, // Not applicable for multiple choice
          correct_answer: undefined, // Not applicable for multiple choice
          instruction_for_matching: undefined, // Not applicable for multiple choice
          correct_answer_for_matching: undefined, // Not applicable for multiple choice
          zone_index: undefined, // Not applicable for multiple choice
          drag_item_id: undefined, // Not applicable for multiple choice
          question_type: 0,
        });

        // Step 2: Get original choices to compare and separate existing from new choices
        const originalChoices = originalQuestion.choices || [];
        const existingChoices = data.choices.filter((choice) => choice.id);
        const newChoices = data.choices.filter((choice) => !choice.id);

        // Step 3a: Create new choices first (so they exist before we try to update them)
        for (const choice of newChoices) {
          await instance.post(`/reading/questions/${question_id}/choices`, {
            label: choice.label,
            content: choice.content,
            choice_order: choice.choice_order,
            is_correct: choice.is_correct,
          });
        }

        // Step 3b: Process existing choices in the required order
        for (const choice of existingChoices) {
          // Find the original state
          const originalChoice = originalChoices.find((orig: any) => orig.choice_id === choice.id);

          // Step 3b-i: If this choice was correct but now is not, unset it first
          if (originalChoice && originalChoice.is_correct && !choice.is_correct) {
            await instance.put(`/reading/choices/${choice.id}`, {
              label: choice.label,
              content: choice.content,
              choice_order: choice.choice_order,
              is_correct: false,
            });
          }
          // Step 3b-ii: If this choice is now correct (whether it was before or not), set it
          else if (choice.is_correct) {
            await instance.put(`/reading/choices/${choice.id}`, {
              label: choice.label,
              content: choice.content,
              choice_order: choice.choice_order,
              is_correct: true,
            });
          }
          // Step 3b-iii: If this choice is not correct and wasn't correct before, just update content/order
          else {
            await instance.put(`/reading/choices/${choice.id}`, {
              label: choice.label,
              content: choice.content,
              choice_order: choice.choice_order,
              is_correct: false,
            });
          }
        }

        // Step 4: Second update - set number_of_correct_answers to actual correct choices count
        const finalCorrectCount = data.choices.filter((choice) => choice.is_correct).length;
        await instance.put(`/reading/questions/${question_id}`, {
          question_order: data.question_order,
          point: data.point,
          explanation: data.explanation,
          question_categories: originalQuestion.question_categories || [],
          number_of_correct_answers: finalCorrectCount, // Set to actual correct choices count
          instruction_for_choice: data.instruction_for_choice,
          blank_index: undefined, // Not applicable for multiple choice
          correct_answer: undefined, // Not applicable for multiple choice
          instruction_for_matching: undefined, // Not applicable for multiple choice
          correct_answer_for_matching: undefined, // Not applicable for multiple choice
          zone_index: undefined, // Not applicable for multiple choice
          drag_item_id: undefined, // Not applicable for multiple choice
          question_type: 0,
        });

        const updatedQuestions = [...questions];
        updatedQuestions[editingIndex] = {
          ...newQuestion,
          id: question_id,
        };
        onQuestionsChange(updatedQuestions);
        setEditingIndex(null);
      } else {
        onQuestionsChange([...questions, newQuestion]);
      }

      form.reset({
        question_order:
          questions.length > 0 ? Math.max(...questions.map((q: any) => q.question_order)) + 2 : 2,
        point: 1,
        explanation: '',
        instruction_for_choice: '',
        number_of_correct_answers: 1,
        choices: [
          { label: 'A', content: '', choice_order: 1, is_correct: false },
          { label: 'B', content: '', choice_order: 2, is_correct: false },
        ],
      });
    } catch (error) {
      alert((error as Error).message || 'Failed to save question');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (index: number) => {
    const question = questions[index];
    form.reset(question);
    setEditingIndex(index);
  };

  const handleDelete = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    onQuestionsChange(updatedQuestions);
  };

  const addChoice = () => {
    const nextLabel = String.fromCharCode(65 + fields.length); // A, B, C, D...
    append({
      label: nextLabel,
      content: '',
      choice_order: fields.length + 1,
      is_correct: false,
    });
  };

  const handleCorrectAnswerChange = (choiceIndex: number, is_correct: boolean) => {
    const currentChoices = form.getValues('choices');

    if (isMultipleChoice) {
      // Multiple choice: allow multiple correct answers
      form.setValue(`choices.${choiceIndex}.is_correct`, is_correct);
    } else {
      // Single choice: only one correct answer
      currentChoices.forEach((_, index) => {
        form.setValue(`choices.${index}.is_correct`, index === choiceIndex && is_correct);
      });
    }
  };

  return (
    <div className='space-y-6'>
      {/* Question Form */}
      <Card>
        <CardHeader>
          <CardTitle>{editingIndex !== null ? 'Edit Question' : 'Add New Question'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
              <div className='grid grid-cols-3 gap-4'>
                <FormField
                  control={form.control}
                  name='question_order'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question Order</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='point'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Points</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='number_of_correct_answers'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correct Answers</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min='1'
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='instruction_for_choice'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Instruction</FormLabel>
                    <FormControl>
                      <TiptapEditor
                        content={field.value}
                        onChange={field.onChange}
                        placeholder='Enter the question instruction'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='explanation'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Explanation</FormLabel>
                    <FormControl>
                      <TiptapEditor
                        content={field.value}
                        onChange={field.onChange}
                        placeholder='Enter explanation for the answer'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Choices */}
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-lg font-medium'>Answer Choices</h3>
                  <Button type='button' onClick={addChoice} variant='outline' size='sm'>
                    <Plus className='h-4 w-4 mr-2' />
                    Add Choice
                  </Button>
                </div>

                <div className='space-y-3'>
                  {fields.map((field, index) => (
                    <div key={field.id} className='flex items-start gap-4 p-4 border rounded-lg'>
                      <div className='flex items-center gap-2'>
                        {isMultipleChoice ? (
                          <Checkbox
                            checked={form.watch(`choices.${index}.is_correct`)}
                            onCheckedChange={(checked) =>
                              handleCorrectAnswerChange(index, !!checked)
                            }
                          />
                        ) : (
                          <RadioGroup
                            value={
                              form.watch(`choices.${index}.is_correct`) ? index.toString() : ''
                            }
                            onValueChange={(value) =>
                              handleCorrectAnswerChange(Number(value), true)
                            }
                          >
                            <RadioGroupItem value={index.toString()} />
                          </RadioGroup>
                        )}
                      </div>

                      <div className='flex-1 grid grid-cols-4 gap-4'>
                        <FormField
                          control={form.control}
                          name={`choices.${index}.label`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder='Label' {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className='col-span-2'>
                          <FormField
                            control={form.control}
                            name={`choices.${index}.content`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder='Choice content' {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name={`choices.${index}.choice_order`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type='number'
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {fields.length > 2 && (
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          onClick={() => remove(index)}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className='flex justify-end gap-2'>
                {editingIndex !== null && (
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => {
                      setEditingIndex(null);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                )}
                <Button type='submit' disabled={isSubmitting}>
                  {editingIndex !== null ? 'Update Question' : 'Add Question'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Questions List */}
      {questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Questions ({questions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {questions.map((question, index) => (
                <div key={index} className='p-4 border rounded-lg'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <h4 className='font-medium'>Question {question.question_order}</h4>
                      <div
                        className='text-sm text-muted-foreground mt-1'
                        dangerouslySetInnerHTML={{ __html: question.instruction_for_choice }}
                      />
                      <div className='mt-2 space-y-1'>
                        {question.choices?.map((choice: any, choiceIndex: number) => (
                          <div key={choiceIndex} className='flex items-center gap-2 text-sm'>
                            <span className={choice.is_correct ? 'text-green-600 font-medium' : ''}>
                              {choice.label}. {choice.content}
                              {choice.is_correct && ' ✓'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className='flex gap-2'>
                      <Button variant='ghost' size='sm' onClick={() => handleEdit(index)}>
                        Edit
                      </Button>
                      <Button variant='ghost' size='sm' onClick={() => handleDelete(index)}>
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
