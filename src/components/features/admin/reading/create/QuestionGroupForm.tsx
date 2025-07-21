'use client';

import * as z from 'zod';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AddGroupQuestionRequest, QuestionType } from '@/types/reading.types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TiptapEditor } from '@/components/ui/tiptap-editor';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

const questionGroupSchema = z.object({
  section_order: z.number().min(1),
  section_label: z.string().min(1, 'Section label is required'),
  instruction: z.string().min(1, 'Instruction is required'),
  question_type: z.nativeEnum(QuestionType),
});

type QuestionGroupFormData = z.infer<typeof questionGroupSchema>;

interface QuestionGroupFormProps {
  onSubmit: (data: AddGroupQuestionRequest) => void;
  onCancel: () => void;
  isLoading: boolean;
  initialData?: Partial<QuestionGroupFormData>;
}

const QUESTION_TYPE_INFO = {
  [QuestionType.MULTIPLE_CHOICE]: {
    label: 'Multiple Choice',
    description: 'Students choose from multiple options',
    example: 'Questions 1-5: Choose the correct letter A, B, C or D.',
  },
  [QuestionType.FILL_IN_THE_BLANKS]: {
    label: 'Fill in the Blanks',
    description: 'Students complete sentences with words from the passage',
    example:
      'Questions 6-10: Complete the sentences below. Use NO MORE THAN THREE WORDS from the passage.',
  },
  [QuestionType.MATCHING]: {
    label: 'Matching',
    description: 'Students match items to categories or sections',
    example: 'Questions 11-15: Match each statement to the correct paragraph A-E.',
  },
  [QuestionType.DRAG_AND_DROP]: {
    label: 'Drag & Drop',
    description: 'Students drag items to correct positions',
    example: 'Questions 16-20: Drag the correct items to complete the diagram.',
  },
};

export function QuestionGroupForm({
  onSubmit,
  onCancel,
  isLoading,
  initialData,
}: QuestionGroupFormProps) {
  const form = useForm<QuestionGroupFormData>({
    resolver: zodResolver(questionGroupSchema),
    defaultValues: {
      section_order: initialData?.section_order || 1,
      section_label: initialData?.section_label || '',
      instruction: initialData?.instruction || '',
      question_type: initialData?.question_type || QuestionType.MULTIPLE_CHOICE,
    },
  });

  const selectedQuestionType = form.watch('question_type');

  const handleSubmit = (data: QuestionGroupFormData) => {
    // Convert camelCase to snake_case for backend
    const requestData = {
      section_order: data.section_order,
      section_label: data.section_label,
      instruction: data.instruction,
      question_type: data.question_type,
      questions: [],
      drag_items: [],
    };
    onSubmit(requestData);
  };

  return (
    <div>
      <h3 className='font-semibold mb-4'>
        {initialData ? 'Edit Question Group' : 'Create New Question Group'}
      </h3>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='section_order'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Section Order</FormLabel>
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

            <FormField
              control={form.control}
              name='section_label'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Section Label</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g., Questions 1-5' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name='question_type'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Question Type</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  defaultValue={String(field.value)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select question type' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(QUESTION_TYPE_INFO).map(([type, info]) => (
                      <SelectItem key={type} value={String(type)}>
                        <div className='flex flex-col'>
                          <span className='font-medium'>{info.label}</span>
                          <span className='text-xs text-muted-foreground'>{info.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='instruction'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instruction</FormLabel>
                <FormControl>
                  <TiptapEditor
                    content={field.value}
                    onChange={field.onChange}
                    placeholder="Enter the instruction for this question group (e.g., 'Choose the correct letter A, B, C or D')"
                  />
                </FormControl>
                <FormMessage />
                <p className='text-xs text-muted-foreground'>
                  This instruction will appear before the questions in this group.
                </p>
              </FormItem>
            )}
          />

          <div className='bg-yellow-50 p-3 rounded-md'>
            <h4 className='font-medium text-yellow-900 mb-1'>💡 Tips for Instructions</h4>
            <ul className='text-sm text-yellow-700 space-y-1'>
              <li>• Be specific about answer format (letters, numbers, words)</li>
              <li>• Include word limits for written answers (NO MORE THAN THREE WORDS)</li>
              <li>• Mention if options can be used more than once</li>
              <li>• Reference specific parts of the passage if needed</li>
            </ul>
          </div>

          <div className='flex justify-end gap-2'>
            <Button type='button' variant='outline' onClick={onCancel}>
              Cancel
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? 'Creating...' : initialData ? 'Update Group' : 'Create Group'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
