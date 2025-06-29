'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useQuestion } from '@/hooks/useQuestion';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const questionSchema = z.object({
  question_order: z.number().min(1),
  point: z.number().min(1),
  explanation: z.string().min(1, 'Explanation is required'),
  zone_index: z.number().min(1),
  drag_item_id: z.string().optional(),
});

type QuestionFormData = z.infer<typeof questionSchema>;

interface DragItem {
  item_id: string;
  content: string;
}

interface QuestionFormProps {
  groupId: string;
  onSuccess: (question: {
    id: string;
    question_order: number;
    point: number;
    explanation: string;
    zone_index: number;
    drag_item_id?: string;
    drag_items?: Array<{
      drag_item_id: string;
      content: string;
    }>;
  }) => void;
  onCancel: () => void;
  dragItems: DragItem[];
  existingQuestions: Array<{
    question_order: number;
    zone_index: number;
  }>;
  initialData?: {
    question_order: number;
    point: number;
    explanation: string;
    zone_index: number;
    drag_item_id?: string;
  };
  isEditing?: boolean;
  questionId?: string;
}

export function QuestionForm({
  groupId,
  onSuccess,
  onCancel,
  dragItems,
  existingQuestions,
  initialData,
  isEditing = false,
  questionId,
}: Readonly<QuestionFormProps>) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createQuestions, updateQuestionInfo, isLoading } = useQuestion();

  // Calculate default values for new questions
  const getDefaultValues = () => {
    if (initialData) return initialData;

    const maxQuestionOrder =
      existingQuestions.length > 0
        ? Math.max(...existingQuestions.map((q) => q.question_order))
        : 0;
    const maxZoneIndex =
      existingQuestions.length > 0 ? Math.max(...existingQuestions.map((q) => q.zone_index)) : 0;

    return {
      question_order: maxQuestionOrder + 1,
      point: 1,
      explanation: '',
      zone_index: maxZoneIndex + 1,
      drag_item_id: '',
    };
  };

  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: getDefaultValues(),
  });

  // Reset form when component mounts or when creating new question
  useEffect(() => {
    if (!isEditing) {
      form.reset(getDefaultValues());
    }
  }, [isEditing]);

  const handleSubmit = async (data: QuestionFormData) => {
    if (!groupId) {
      toast.error('Group ID is required');
      return;
    }

    try {
      setIsSubmitting(true);

      if (isEditing && questionId) {
        // Update existing question
        const result = await updateQuestionInfo(groupId, questionId, {
          explanation: data.explanation,
          point: data.point,
          question_categories: [],
          zone_index: data.zone_index,
          drag_item_id: data.drag_item_id || undefined,
        });

        if (result?.data) {
          const updatedQuestion = result.data as any; // Type assertion for API response
          toast.success('Question updated successfully');
          onSuccess({
            id: questionId,
            question_order: data.question_order,
            point: data.point,
            explanation: data.explanation,
            zone_index: data.zone_index,
            drag_item_id: data.drag_item_id,
            drag_items: updatedQuestion.drag_items,
          });
        }
      } else {
        // Create new question
        const questionRequest = {
          question_order: data.question_order,
          point: data.point,
          explanation: data.explanation,
          zone_index: data.zone_index,
          question_type: 3, // DRAG_AND_DROP
          question_group_id: groupId,
          question_categories: [],
          number_of_correct_answers: 0,
          drag_item_id: data.drag_item_id || undefined,
        };

        const result = await createQuestions(groupId, [questionRequest]);
        if (result?.data && Array.isArray(result.data) && result.data.length > 0) {
          const createdQuestion = result.data[0] as any; // Type assertion for API response
          toast.success('Question created successfully');
          onSuccess({
            id: createdQuestion.question_id,
            question_order: data.question_order,
            point: data.point,
            explanation: data.explanation,
            zone_index: data.zone_index,
            drag_item_id: data.drag_item_id,
            drag_items: createdQuestion.drag_items,
          });
        }
      }
    } catch (error) {
      toast.error(isEditing ? 'Failed to update question' : 'Failed to create question');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-base'>
            {isEditing ? 'Edit Question' : 'Create New Question'}
          </CardTitle>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <X className='h-4 w-4' />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
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
                name='zone_index'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zone Number</FormLabel>
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
              name='drag_item_id'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correct Drag Item</FormLabel>
                  <FormControl>
                    <Select value={field.value || ''} onValueChange={field.onChange}>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select the correct drag item' />
                      </SelectTrigger>
                      <SelectContent>
                        {dragItems.map((item) => (
                          <SelectItem key={item.item_id} value={item.item_id}>
                            {item.content}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <Textarea
                      placeholder='Explain why this drag item is correct for this drop zone'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex justify-end gap-2'>
              <Button type='button' variant='outline' onClick={onCancel} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={isSubmitting || isLoading.createQuestions || isLoading.updateQuestionInfo}
                className='gap-2'
              >
                <Save className='h-4 w-4' />
                {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
