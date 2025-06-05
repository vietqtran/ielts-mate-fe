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
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

const questionGroupSchema = z.object({
  sectionOrder: z.number().min(1),
  sectionLabel: z.string().min(1, 'Section label is required'),
  instruction: z.string().min(1, 'Instruction is required'),
  questionType: z.nativeEnum(QuestionType),
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
      sectionOrder: initialData?.sectionOrder || 1,
      sectionLabel: initialData?.sectionLabel || '',
      instruction: initialData?.instruction || '',
      questionType: initialData?.questionType || QuestionType.MULTIPLE_CHOICE,
    },
  });

  const selectedQuestionType = form.watch('questionType');

  const handleSubmit = (data: QuestionGroupFormData) => {
    // Convert camelCase to snake_case for backend
    const requestData = {
      section_order: data.sectionOrder,
      section_label: data.sectionLabel,
      instruction: data.instruction,
      question_type: data.questionType,
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
              name='sectionOrder'
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
              name='sectionLabel'
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
            name='questionType'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Question Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select question type' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(QUESTION_TYPE_INFO).map(([type, info]) => (
                      <SelectItem key={type} value={type}>
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

          {selectedQuestionType && (
            <div className='p-3 bg-blue-50 rounded-md'>
              <h4 className='font-medium text-blue-900 mb-1'>
                {QUESTION_TYPE_INFO[selectedQuestionType].label}
              </h4>
              <p className='text-sm text-blue-700 mb-2'>
                {QUESTION_TYPE_INFO[selectedQuestionType].description}
              </p>
              <p className='text-xs text-blue-600 italic'>
                Example: {QUESTION_TYPE_INFO[selectedQuestionType].example}
              </p>
            </div>
          )}

          <FormField
            control={form.control}
            name='instruction'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instruction</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter the instruction for this question group (e.g., 'Choose the correct letter A, B, C or D')"
                    className='min-h-[80px]'
                    {...field}
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
