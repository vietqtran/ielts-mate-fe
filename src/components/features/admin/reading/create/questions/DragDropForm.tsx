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
import { Move, Plus, Save, Trash2 } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TiptapEditor } from '@/components/ui/tiptap-editor';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';

const dragItemSchema = z.object({
  id: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  itemOrder: z.number().min(1),
});

const questionSchema = z.object({
  id: z.string().optional(),
  question_order: z.number().min(1),
  point: z.number().min(1),
  explanation: z.string().min(1, 'Explanation is required'),
  instruction_for_choice: z.string().min(1, 'Task description is required'),
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
}

export function DragDropForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}: Readonly<DragDropFormProps>) {
  const [activeTab, setActiveTab] = useState('drag_items');

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
      itemOrder: dragItemFields.length + 1,
    });
  };

  const addQuestion = () => {
    appendQuestion({
      question_order: questionFields.length + 1,
      point: 1,
      explanation: '',
      instruction_for_choice: '',
      zone_index: questionFields.length + 1,
      drag_item_id: '',
    });
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
                  <Button onClick={addDragItem} variant='outline' size='sm' className='gap-2'>
                    <Plus className='h-4 w-4' />
                    Add Item
                  </Button>
                </div>

                <div className='space-y-4'>
                  {dragItemFields.map((field, index) => (
                    <div key={field.id} className='flex items-center gap-4 p-4 border rounded-lg'>
                      <Move className='h-5 w-5 text-muted-foreground cursor-move' />

                      <div className='grid grid-cols-4 gap-4 flex-1'>
                        <FormField
                          control={form.control}
                          name={`drag_items.${index}.itemOrder`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Order</FormLabel>
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

                        <div className='col-span-3'>
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
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {dragItemFields.length > 1 && (
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          onClick={() => removeDragItem(index)}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value='questions' className='space-y-6 pt-4'>
                <div className='flex items-center justify-between'>
                  <h4 className='font-medium'>Drop Zones / Questions</h4>
                  <Button onClick={addQuestion} variant='outline' size='sm' className='gap-2'>
                    <Plus className='h-4 w-4' />
                    Add Question
                  </Button>
                </div>

                <div className='space-y-6'>
                  {questionFields.map((field, index) => (
                    <Card key={field.id}>
                      <CardHeader>
                        <div className='flex items-center justify-between'>
                          <CardTitle className='text-base'>Question {index + 1}</CardTitle>
                          {questionFields.length > 1 && (
                            <Button
                              type='button'
                              variant='ghost'
                              size='sm'
                              onClick={() => removeQuestion(index)}
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          )}
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

                        <FormField
                          control={form.control}
                          name={`questions.${index}.instruction_for_choice`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Task Description / Drop Zone Context</FormLabel>
                              <FormControl>
                                <TiptapEditor
                                  content={field.value}
                                  onChange={field.onChange}
                                  placeholder='Describe the drop zone or task context...'
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`questions.${index}.drag_item_id`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Correct Drag Item</FormLabel>
                              <FormControl>
                                <select
                                  className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background'
                                  {...field}
                                >
                                  <option value=''>Select the correct drag item</option>
                                  {drag_items.map((item) => (
                                    <option key={item.id} value={item.id}>
                                      {item.content || `Item ${item.itemOrder}`}
                                    </option>
                                  ))}
                                </select>
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
                                <TiptapEditor
                                  content={field.value}
                                  onChange={field.onChange}
                                  placeholder='Explain why this drag item is correct for this drop zone'
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <div className='flex justify-end gap-2'>
              <Button type='button' variant='outline' onClick={onCancel}>
                Cancel
              </Button>
              <Button type='submit' className='gap-2' disabled={isSubmitting}>
                <Save className='h-4 w-4' />
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
