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
import { TiptapEditor } from '@/components/ui/tiptap-editor';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useForm } from 'react-hook-form';

const questionSchema = z.object({
  id: z.string().optional(),
  question_order: z.number().min(1),
  point: z.number().min(1),
  explanation: z.string().min(1, 'Explanation is required'),
  instruction_for_matching: z.string().min(1, 'Matching instruction is required'),
  correct_answer_for_matching: z.string().min(1, 'Correct answer mapping is required'),
});

export type MatchingFormData = z.infer<typeof questionSchema>;

interface MatchingFormProps {
  initialData?: Partial<MatchingFormData>;
  onSubmit: (data: MatchingFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  isEditing?: boolean;
}

export function MatchingForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  isEditing = false,
}: Readonly<MatchingFormProps>) {
  const form = useForm<MatchingFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: initialData || {
      question_order: 1,
      point: 1,
      explanation: '',
      instruction_for_matching: '',
      correct_answer_for_matching: '',
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Question' : 'Add New Matching Question'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid grid-cols-2 gap-4'>
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
            </div>

            <FormField
              control={form.control}
              name='instruction_for_matching'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Matching Task Description</FormLabel>
                  <FormControl>
                    <TiptapEditor
                      content={field.value}
                      onChange={field.onChange}
                      placeholder='Describe what students need to match...'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='correct_answer_for_matching'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correct Answer Mapping</FormLabel>
                  <FormControl>
                    <Textarea placeholder='Enter answers in format: 1-A, 2-C, 3-B...' {...field} />
                  </FormControl>
                  <FormMessage />
                  <p className='text-xs text-muted-foreground'>
                    Use comma-separated format. E.g., "1-A, 2-C, 3-B".
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
                      placeholder='Explain the correct answers and key clues...'
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
