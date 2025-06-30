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
import { useQuestion } from '@/hooks/useQuestion';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const dragItemSchema = z.object({
  content: z.string().min(1, 'Content is required'),
});

type DragItemFormData = z.infer<typeof dragItemSchema>;

interface DragItemFormProps {
  groupId: string;
  onSuccess: (dragItem: { item_id: string; content: string }) => void;
  onCancel: () => void;
  initialData?: { content: string };
  isEditing?: boolean;
  itemId?: string;
}

export function DragItemForm({
  groupId,
  onSuccess,
  onCancel,
  initialData,
  isEditing = false,
  itemId,
}: Readonly<DragItemFormProps>) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createDragItem, updateDragItem, isLoading } = useQuestion();

  const form = useForm<DragItemFormData>({
    resolver: zodResolver(dragItemSchema),
    defaultValues: initialData || { content: '' },
  });

  const handleSubmit = async (data: DragItemFormData) => {
    if (!groupId) {
      toast.error('Group ID is required');
      return;
    }

    try {
      setIsSubmitting(true);

      if (isEditing && itemId) {
        // Update existing item
        const result = await updateDragItem(groupId, itemId, { content: data.content });
        if (result?.data) {
          toast.success('Drag item updated successfully');
          onSuccess({
            item_id: itemId,
            content: data.content,
          });
        }
      } else {
        // Create new item
        const result = await createDragItem(groupId, { content: data.content });
        if (result?.data && Array.isArray(result.data) && result.data.length > 0) {
          toast.success('Drag item created successfully');
          onSuccess({
            item_id: result.data[0].item_id,
            content: data.content,
          });
        }
      }
    } catch (error) {
      toast.error(isEditing ? 'Failed to update drag item' : 'Failed to create drag item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-base'>
            {isEditing ? 'Edit Drag Item' : 'Create New Drag Item'}
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
            <FormField
              control={form.control}
              name='content'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Drag Item Content</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter the text/option that students will drag' {...field} />
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
                disabled={isSubmitting || isLoading.createDragItem || isLoading.updateDragItem}
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
