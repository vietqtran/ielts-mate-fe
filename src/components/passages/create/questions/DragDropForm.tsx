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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, Move, Plus, Save, Trash2 } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
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
import { useState } from 'react';
import { toast } from 'sonner';

// Create a type for interface modes
type QuestionMode = 'viewing' | 'creating' | 'editing';

const dragItemSchema = z.object({
  item_id: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
});

const questionSchema = z.object({
  id: z.string().optional(),
  question_order: z.number().min(1),
  point: z.number().min(1),
  explanation: z.string().min(1, 'Explanation is required'),
  instruction_for_choice: z.string().optional(),
  zone_index: z.number().min(1),
  drag_item_id: z.string().min(1, 'Drag item is required'),
});

export const dragDropFormSchema = z.object({
  drag_items: z.array(dragItemSchema).min(1, 'At least one drag item required'),
  questions: z.array(questionSchema).min(1, 'At least one question required'),
});

export type DragDropFormData = z.infer<typeof dragDropFormSchema>;

interface DragDropFormProps {
  initialData: DragDropFormData;
  onSubmit: (data: DragDropFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  groupId?: string; // Add groupId for direct API operations
}

export function DragDropForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  groupId,
}: Readonly<DragDropFormProps>) {
  const [activeTab, setActiveTab] = useState('drag_items');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [isDeletingItem, setIsDeletingItem] = useState(false);

  // Question management states
  const [questionMode, setQuestionMode] = useState<QuestionMode>('viewing');
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [creatingQuestion, setCreatingQuestion] = useState(false);

  // Get API functions
  const { createDragItem, updateDragItem, deleteDragItem, isLoading } = useQuestion();

  const form = useForm<DragDropFormData>({
    resolver: zodResolver(dragDropFormSchema),
    defaultValues: initialData,
  });

  const {
    fields: dragItemFields,
    append: appendDragItem,
    remove: removeDragItem,
  } = useFieldArray({
    control: form.control,
    name: 'drag_items',
  });

  const {
    fields: questionFields,
    append: appendQuestion,
    remove: removeQuestion,
  } = useFieldArray({
    control: form.control,
    name: 'questions',
  });

  const drag_items = form.watch('drag_items');

  const addDragItem = () => {
    appendDragItem({
      content: '',
    });
  };

  // Handle saving a drag item directly to the API
  const handleSaveDragItem = async (index: number) => {
    if (!groupId) {
      toast.error('Group ID is required to save drag item');
      return;
    }

    const item = form.getValues(`drag_items.${index}`);

    if (!item.content.trim()) {
      toast.error('Content is required');
      return;
    }

    try {
      setIsSavingItem(true);

      if (item.item_id) {
        // Update existing item
        const result = await updateDragItem(groupId, item.item_id, { content: item.content });
        if (result?.data) {
          toast.success('Drag item updated successfully');
          // Update the form with the returned ID
          form.setValue(`drag_items.${index}.item_id`, result.data.item_id);
        }
      } else {
        // Create new item
        const result = await createDragItem(groupId, { content: item.content });
        if (result?.data && Array.isArray(result.data) && result.data.length > 0) {
          toast.success('Drag item created successfully');
          // Update the form with the returned ID
          form.setValue(`drag_items.${index}.item_id`, result.data[0].item_id);
        }
      }
    } catch (error) {
      console.error('Failed to save drag item:', error);
      toast.error('Failed to save drag item');
    } finally {
      setIsSavingItem(false);
      setEditingItem(null);
    }
  };

  // Handle deleting a drag item
  const handleDeleteDragItem = async (index: number) => {
    if (!groupId) {
      toast.error('Group ID is required to delete drag item');
      return;
    }

    const item = form.getValues(`drag_items.${index}`);

    if (!item.item_id) {
      // If it doesn't have an ID, just remove it from the form
      removeDragItem(index);
      return;
    }

    try {
      setIsDeletingItem(true);
      await deleteDragItem(groupId, item.item_id);
      toast.success('Drag item deleted successfully');
      removeDragItem(index);
    } catch (error) {
      console.error('Failed to delete drag item:', error);
      toast.error('Failed to delete drag item');
    } finally {
      setIsDeletingItem(false);
    }
  };

  const addQuestion = () => {
    // Set the mode to creating
    setQuestionMode('creating');
    setCreatingQuestion(true);
    setEditingQuestionIndex(null);

    // Add a new question to the form data
    appendQuestion({
      question_order: questionFields.length + 1,
      point: 1,
      explanation: '',
      zone_index: questionFields.length + 1,
      drag_item_id: '',
    });
  };

  const startEditingQuestion = (index: number) => {
    setQuestionMode('editing');
    setEditingQuestionIndex(index);
    setCreatingQuestion(false);
  };

  const cancelQuestionAction = () => {
    // If we were creating a question, remove it
    if (creatingQuestion) {
      const lastIndex = questionFields.length - 1;
      if (lastIndex >= 0) {
        removeQuestion(lastIndex);
      }
    }

    // Reset the state
    setQuestionMode('viewing');
    setEditingQuestionIndex(null);
    setCreatingQuestion(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Drag & Drop Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className='grid w-full grid-cols-2'>
                <TabsTrigger value='drag_items'>Drag Items ({dragItemFields.length})</TabsTrigger>
                <TabsTrigger value='questions'>Questions ({questionFields.length})</TabsTrigger>
              </TabsList>

              <TabsContent value='drag_items' className='space-y-6 pt-4'>
                <div className='flex items-center justify-between'>
                  <h4 className='font-medium'>Drag Items</h4>
                  <div className='flex gap-2'>
                    <Button onClick={addDragItem} variant='outline' size='sm' className='gap-2'>
                      <Plus className='h-4 w-4' />
                      Add Item
                    </Button>
                  </div>
                </div>

                <div className='space-y-4'>
                  {dragItemFields.map((field, index) => (
                    <div key={field.id} className='flex items-center gap-4 p-4 border rounded-lg'>
                      <Move className='h-5 w-5 text-muted-foreground cursor-move' />

                      <div className='flex-1'>
                        <FormField
                          control={form.control}
                          name={`drag_items.${index}.content`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Drag Item Content</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder='Enter the text/option that students will drag'
                                  {...field}
                                  onFocus={() => setEditingItem(`drag_items.${index}.content`)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className='flex gap-2'>
                        {/* Save button for individual item */}
                        {groupId && (
                          <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={() => handleSaveDragItem(index)}
                            disabled={isSavingItem}
                          >
                            {isSavingItem && editingItem === `drag_items.${index}.content`
                              ? 'Saving...'
                              : 'Save'}
                          </Button>
                        )}

                        {/* Delete button */}
                        {dragItemFields.length > 1 && (
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            onClick={() =>
                              groupId ? handleDeleteDragItem(index) : removeDragItem(index)
                            }
                            disabled={isDeletingItem}
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value='questions' className='space-y-6 pt-4'>
                <div className='flex items-center justify-between'>
                  <h4 className='font-medium'>Drop Zones / Questions</h4>
                  {questionMode === 'viewing' && (
                    <Button onClick={addQuestion} variant='outline' size='sm' className='gap-2'>
                      <Plus className='h-4 w-4' />
                      Add Question
                    </Button>
                  )}
                </div>

                <div className='space-y-6'>
                  {/* Show question edit form only for the specific question being edited or created */}
                  {questionFields.map((field, index) => {
                    // Skip rendering unless in the right mode
                    if (
                      (questionMode === 'creating' &&
                        creatingQuestion &&
                        index === questionFields.length - 1) ||
                      (questionMode === 'editing' && editingQuestionIndex === index)
                    ) {
                      // Show the edit form
                      return (
                        <Card key={field.id}>
                          <CardHeader>
                            <div className='flex items-center justify-between'>
                              <CardTitle className='text-base'>
                                {questionMode === 'creating'
                                  ? 'New Question'
                                  : `Edit Question ${index + 1}`}
                              </CardTitle>
                              <Button
                                type='button'
                                variant='ghost'
                                size='sm'
                                onClick={cancelQuestionAction}
                              >
                                Cancel
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className='space-y-4'>
                            <div className='grid grid-cols-3 gap-4'>
                              <FormField
                                control={form.control}
                                name={`questions.${index}.question_order`}
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
                                name={`questions.${index}.zone_index`}
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
                                name={`questions.${index}.point`}
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

                            {/* Removed instruction_for_choice field as it's not needed for drag drop questions */}

                            <FormField
                              control={form.control}
                              name={`questions.${index}.drag_item_id`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Correct Drag Item</FormLabel>
                                  <FormControl>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                      <SelectTrigger className='w-full'>
                                        <SelectValue placeholder='Select the correct drag item' />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {drag_items.map((item, i) => (
                                          <SelectItem key={item.item_id} value={item.item_id ?? ''}>
                                            {item.content || `Item ${i + 1}`}
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
                              name={`questions.${index}.explanation`}
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

                            <div className='flex justify-end pt-2'>
                              <Button
                                type='button'
                                onClick={() => {
                                  // Save individual question
                                  // We don't actually submit here, just go back to viewing mode
                                  setQuestionMode('viewing');
                                  setEditingQuestionIndex(null);
                                  setCreatingQuestion(false);
                                }}
                              >
                                {questionMode === 'creating' ? 'Add Question' : 'Update Question'}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    } else if (
                      questionMode === 'viewing' ||
                      (questionMode === 'creating' && index !== questionFields.length - 1) ||
                      (questionMode === 'editing' && editingQuestionIndex !== index)
                    ) {
                      // Show preview card for this question
                      const question = form.getValues(`questions.${index}`);
                      const dragItem = drag_items.find(
                        (item) => item.item_id === question.drag_item_id
                      );

                      return (
                        <Card key={field.id}>
                          <CardHeader>
                            <div className='flex items-center justify-between'>
                              <CardTitle className='text-base'>Question {index + 1}</CardTitle>
                              <div className='flex gap-2'>
                                <Button
                                  type='button'
                                  variant='outline'
                                  size='sm'
                                  onClick={() => startEditingQuestion(index)}
                                  disabled={questionMode !== 'viewing'}
                                >
                                  <Edit className='h-4 w-4 mr-1' />
                                  Edit
                                </Button>
                                {questionFields.length > 1 && (
                                  <Button
                                    type='button'
                                    variant='ghost'
                                    size='sm'
                                    onClick={() => removeQuestion(index)}
                                    disabled={questionMode !== 'viewing'}
                                  >
                                    <Trash2 className='h-4 w-4' />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className='grid grid-cols-2 gap-4 text-sm'>
                              <div>
                                <span className='font-semibold'>Question Number:</span>{' '}
                                {question.question_order}
                              </div>
                              <div>
                                <span className='font-semibold'>Zone Number:</span>{' '}
                                {question.zone_index}
                              </div>
                              <div>
                                <span className='font-semibold'>Points:</span> {question.point}
                              </div>
                              <div>
                                <span className='font-semibold'>Drag Item:</span>{' '}
                                {dragItem ? dragItem.content : 'None selected'}
                              </div>
                              <div className='col-span-2'>
                                <span className='font-semibold'>Explanation:</span>{' '}
                                <span className='text-muted-foreground'>
                                  {question.explanation || 'No explanation provided'}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    }

                    return null;
                  })}

                  {questionFields.length === 0 && questionMode === 'viewing' && (
                    <div className='text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg'>
                      <p>No questions added yet. Click "Add Question" to create one.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className='flex justify-end gap-2'>
              <Button type='button' variant='outline' onClick={onCancel}>
                Cancel
              </Button>
              <Button
                type='submit'
                className='gap-2'
                disabled={isSubmitting || questionMode !== 'viewing'}
              >
                <Save className='h-4 w-4' />
                {isSubmitting ? 'Saving...' : 'Save All Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
