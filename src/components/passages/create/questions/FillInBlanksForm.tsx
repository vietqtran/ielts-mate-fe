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

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useForm } from 'react-hook-form';

const questionSchema = z.object({
  id: z.string().optional(),
  question_order: z.number().min(1),
  point: z.number().min(1),
  explanation: z.string().min(1, 'Explanation is required'),
  blank_index: z.number().min(1),
  correct_answer: z.string().min(1, 'Correct answer is required'),
});

export type FillInBlanksFormData = z.infer<typeof questionSchema>;

interface FillInBlanksFormProps {
  initialData?: Partial<FillInBlanksFormData>;
  onSubmit: (data: FillInBlanksFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function FillInBlanksForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}: Readonly<FillInBlanksFormProps>) {
  const form = useForm<FillInBlanksFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: initialData || {
      question_order: 1,
      point: 1,
      explanation: '',
      blank_index: 1,
      correct_answer: '',
    },
  });

  const isEditing = !!initialData?.id;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Question' : 'Add New Fill in the Blanks Question'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
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
                name='blank_index'
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
            </div>

            <div className='bg-blue-50 p-4 rounded-lg'>
              <h4 className='font-medium text-blue-900 mb-2'>Fill in the Blanks Instructions</h4>
              <p className='text-sm text-blue-700'>
                The instruction for fill-in-blank questions is now managed at the group level above.
                Each question represents one blank in the overall instruction text.
              </p>
            </div>

            <FormField
              control={form.control}
              name='correct_answer'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correct Answer</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter the correct answer (usually 1-3 words)' {...field} />
                  </FormControl>
                  <FormMessage />
                  <p className='text-xs text-muted-foreground'>
                    Use the exact words from the passage.
                  </p>
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
                    <Textarea
                      placeholder="Explain where in the passage the answer can be found and why it's correct"
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
