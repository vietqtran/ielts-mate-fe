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
import { Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TiptapEditor } from '@/components/ui/tiptap-editor';
import { SafeHtmlRenderer } from '@/lib/utils/safeHtml';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';

const blankAnswerSchema = z.object({
  blank_index: z.number().min(1),
  correct_answer: z.string().min(1, 'Correct answer is required'),
});

const questionSchema = z.object({
  question_order: z.number().min(1),
  point: z.number().min(1),
  explanation: z.string().min(1, 'Explanation is required'),
  blankAnswers: z.array(blankAnswerSchema).min(1, 'At least one blank answer required'),
});

type QuestionFormData = z.infer<typeof questionSchema>;

interface FillInBlankFormProps {
  questions: any[];
  onQuestionsChange: (questions: any[]) => void;
}

export function FillInBlankForm({ questions, onQuestionsChange }: FillInBlankFormProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      question_order:
        questions.length > 0 ? Math.max(...questions.map((q: any) => q.question_order)) + 1 : 1,
      point: 1,
      explanation: '',
      blankAnswers: [{ blank_index: 1, correct_answer: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'blankAnswers',
  });

  const handleSubmit = (data: QuestionFormData) => {
    // Create separate questions for each blank answer
    const newQuestions = data.blankAnswers.map((blank, index) => ({
      question_order: data.question_order + index,
      point: data.point,
      question_type: 1, // FILL_IN_THE_BLANKS
      question_categories: [],
      explanation: data.explanation,
      number_of_correct_answers: 0, // No choices for fill in blank
      blank_index: blank.blank_index,
      correct_answer: blank.correct_answer,
      instruction_for_choice: '', // Empty for fill in blanks since instruction is at group level
    }));

    if (editingIndex !== null) {
      // Update existing questions (replace all questions for this group)
      const updatedQuestions = [...questions];
      // Remove old questions for this group
      const startIndex = editingIndex;
      const endIndex = startIndex + (form.getValues('blankAnswers').length || 1);
      updatedQuestions.splice(startIndex, endIndex - startIndex, ...newQuestions);
      onQuestionsChange(updatedQuestions);
      setEditingIndex(null);
    } else {
      onQuestionsChange([...questions, ...newQuestions]);
    }

    form.reset({
      question_order:
        questions.length > 0
          ? Math.max(...questions.map((q: any) => q.question_order)) + newQuestions.length + 1
          : newQuestions.length + 1,
      point: 1,
      explanation: '',
      blankAnswers: [{ blank_index: 1, correct_answer: '' }],
    });
  };

  const handleEdit = (index: number) => {
    const question = questions[index];
    const groupQuestions = questions.filter(
      (_, idx) => (idx >= index && idx < index + question.blankAnswers?.length) || 1
    );

    const blankAnswers = groupQuestions.map((q) => ({
      blank_index: q.blank_index,
      correct_answer: q.correct_answer,
    }));

    form.reset({
      question_order: question.question_order,
      point: question.point,
      explanation: question.explanation,
      blankAnswers,
    });
    setEditingIndex(index);
  };

  const handleDelete = (index: number) => {
    const updatedQuestions = questions.filter((_, idx) => idx !== index);
    onQuestionsChange(updatedQuestions);
  };

  const addBlankAnswer = () => {
    append({
      blank_index: fields.length + 1,
      correct_answer: '',
    });
  };

  return (
    <div className='space-y-6'>
      {/* Question Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {editingIndex !== null
              ? 'Edit Fill-in-Blank Question'
              : 'Add New Fill-in-Blank Question'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
              <div className='grid grid-cols-2 gap-4'>
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
                      <FormLabel>Points per Blank</FormLabel>
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

              <div className='bg-blue-50 p-4 rounded-lg'>
                <h4 className='font-medium text-blue-900 mb-2'>Fill in the Blanks Instructions</h4>
                <p className='text-sm text-blue-700'>
                  The instruction for fill-in-blank questions is now managed at the group level
                  above. Each question represents one blank in the overall instruction text.
                </p>
              </div>

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
                        placeholder='Enter explanation for the answers'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Blank Answers */}
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-lg font-medium'>Blank Answers</h3>
                  <Button type='button' onClick={addBlankAnswer} variant='outline' size='sm'>
                    <Plus className='h-4 w-4 mr-2' />
                    Add Blank
                  </Button>
                </div>

                <div className='space-y-3'>
                  {fields.map((field, index) => (
                    <div key={field.id} className='flex items-center gap-4 p-4 border rounded-lg'>
                      <div className='grid grid-cols-2 gap-4 flex-1'>
                        <FormField
                          control={form.control}
                          name={`blankAnswers.${index}.blank_index`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Blank Number</FormLabel>
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
                          name={`blankAnswers.${index}.correct_answer`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Correct Answer</FormLabel>
                              <FormControl>
                                <Input placeholder='Enter correct answer' {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {fields.length > 1 && (
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
                <Button type='submit'>
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
            <CardTitle>Fill-in-Blank Questions ({questions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {questions.map((question, index) => (
                <div key={index} className='p-4 border rounded-lg'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <h4 className='font-medium'>Question {question.question_order}</h4>
                      <div className='text-sm text-muted-foreground mt-1'>
                        Blank {question.blank_index} - Answer: {question.correct_answer}
                      </div>
                      <div className='text-sm text-muted-foreground mt-1'>
                        Points: {question.point}
                      </div>
                      {question.explanation && (
                        <div className='text-sm text-muted-foreground mt-1'>
                          <span className='font-medium'>Explanation:</span>
                          <SafeHtmlRenderer htmlContent={question.explanation} className='mt-1' />
                        </div>
                      )}
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
