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
import { Plus, Save, Trash2 } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TiptapEditor } from '@/components/ui/tiptap-editor';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';

const choiceSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, 'Label is required'),
  content: z.string().min(1, 'Content is required'),
  choice_order: z.number().min(0),
  is_correct: z.boolean(),
});

const questionSchema = z.object({
  id: z.string().optional(),
  question_order: z.number().min(1),
  point: z.number().min(1),
  explanation: z.string().min(1, 'Explanation is required'),
  instruction_for_choice: z.string().min(1, 'Question text is required'),
  number_of_correct_answers: z.number().min(1),
  choices: z.array(choiceSchema).min(2, 'At least 2 choices required'),
});

export type QuestionFormData = z.infer<typeof questionSchema>;

interface MultipleChoiceFormProps {
  initialData?: Partial<QuestionFormData>;
  onSubmit: (data: QuestionFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  isEditing?: boolean;
}

export function MultipleChoiceForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  isEditing = false,
}: Readonly<MultipleChoiceFormProps>) {
  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: initialData || {
      question_order: 1,
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
  const choices = form.watch('choices');

  useEffect(() => {
    // When the number of correct answers is changed to 1,
    // ensure only one choice is selected as correct.
    if (number_of_correct_answers === 1) {
      const correctChoices = choices.filter((c) => c.is_correct);
      if (correctChoices.length > 1) {
        let firstCorrectFound = false;
        const updatedChoices = choices.map((choice) => {
          if (choice.is_correct) {
            if (!firstCorrectFound) {
              firstCorrectFound = true;
              return choice; // Keep the first one
            }
            return { ...choice, is_correct: false }; // Uncheck subsequent ones
          }
          return choice;
        });
        form.setValue('choices', updatedChoices);
      }
    }
  }, [number_of_correct_answers, choices, form]);

  const handleSubmit = (data: QuestionFormData) => {
    const correctCount = data.choices.filter((choice) => choice.is_correct).length;

    if (correctCount === 0) {
      form.setError('choices', { message: 'At least one choice must be correct' });
      return;
    }

    if (correctCount !== data.number_of_correct_answers) {
      form.setError('number_of_correct_answers', {
        message: `Number of correct answers (${data.number_of_correct_answers}) must match selected correct choices (${correctCount})`,
      });
      return;
    }

    onSubmit(data);
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

  const handleCorrectAnswerChange = (choiceIndex: number, isChecked: boolean) => {
    if (number_of_correct_answers === 1) {
      choices.forEach((_, index) => {
        form.setValue(`choices.${index}.is_correct`, index === choiceIndex ? isChecked : false);
      });
    } else {
      form.setValue(`choices.${choiceIndex}.is_correct`, isChecked);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Question' : 'Add New Multiple Choice Question'}</CardTitle>
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
                    <FormLabel>Question Number</FormLabel>
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
                  <FormLabel>Question Text</FormLabel>
                  <FormControl>
                    <TiptapEditor
                      content={field.value}
                      onChange={field.onChange}
                      placeholder="Enter the question text (e.g., 'According to the passage, what is the main cause of climate change?')"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <FormLabel>Answer Choices</FormLabel>
                <Button type='button' onClick={addChoice} variant='outline' size='sm'>
                  <Plus className='h-4 w-4 mr-2' />
                  Add Choice
                </Button>
              </div>

              <div className='space-y-3'>
                {fields.map((field, index) => (
                  <div key={field.id} className='flex items-start gap-4 p-4 border rounded-lg'>
                    <div className='flex items-center mt-2'>
                      {number_of_correct_answers === 1 ? (
                        <input
                          type='radio'
                          name='correct_answer'
                          checked={choices[index]?.is_correct || false}
                          onChange={(e) => handleCorrectAnswerChange(index, e.target.checked)}
                          className='w-4 h-4'
                        />
                      ) : (
                        <Checkbox
                          checked={choices[index]?.is_correct || false}
                          onCheckedChange={(checked) => handleCorrectAnswerChange(index, !!checked)}
                        />
                      )}
                    </div>

                    <div className='grid grid-cols-4 gap-4 flex-1'>
                      <FormField
                        control={form.control}
                        name={`choices.${index}.label`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Label</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className='col-span-3'>
                        <FormField
                          control={form.control}
                          name={`choices.${index}.content`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Choice Text</FormLabel>
                              <FormControl>
                                <Textarea placeholder='Enter choice content' {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {fields.length > 2 && (
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={() => remove(index)}
                        className='mt-8'
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <FormField
              control={form.control}
              name='explanation'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Explanation</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Explain why the correct answer(s) are correct and why others are wrong'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex justify-end gap-2'>
              <Button type='button' variant='outline' onClick={onCancel}>
                Cancel
              </Button>
              <Button type='submit' className='gap-2' disabled={isSubmitting}>
                <Save className='h-4 w-4' />
                {isSubmitting
                  ? isEditing
                    ? 'Updating...'
                    : 'Creating...'
                  : isEditing
                    ? 'Update Question'
                    : 'Add Question'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
