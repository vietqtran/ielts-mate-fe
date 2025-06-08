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
import { Textarea } from '@/components/ui/textarea';
import { TiptapEditor } from '@/components/ui/tiptap-editor';
import { useQuestion } from '@/hooks/useQuestion';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';

const dragItemSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  itemOrder: z.number().min(1),
});

const questionSchema = z.object({
  question_order: z.number().min(1),
  point: z.number().min(1),
  explanation: z.string().min(1, 'Explanation is required'),
  instruction_for_choice: z.string().min(1, 'Task description is required'),
  zone_index: z.number().min(1),
  drag_item_id: z.string().min(1, 'Drag item is required'),
});

const dragDropFormSchema = z.object({
  drag_items: z.array(dragItemSchema).min(1, 'At least one drag item required'),
  questions: z.array(questionSchema).min(1, 'At least one question required'),
});

type DragDropFormData = z.infer<typeof dragDropFormSchema>;

interface QuestionGroup {
  id?: string;
  section_order: number;
  section_label: string;
  instruction: string;
  question_type: string;
  questions: any[];
  drag_items?: string[];
}

interface DragDropManagerProps {
  group: QuestionGroup;
  groupIndex: number;
  onUpdateGroup: (group: QuestionGroup) => void;
}

export function DragDropManager({ group, onUpdateGroup }: DragDropManagerProps) {
  const [activeTab, setActiveTab] = useState('drag_items');

  const form = useForm<DragDropFormData>({
    resolver: zodResolver(dragDropFormSchema),
    defaultValues: {
      drag_items: group.drag_items?.map((item, index) => ({
        content: item,
        itemOrder: index + 1,
      })) || [
        { content: '', itemOrder: 1 },
        { content: '', itemOrder: 2 },
        { content: '', itemOrder: 3 },
      ],
      questions:
        group.questions.length > 0
          ? group.questions
          : [
              {
                question_order: 1,
                point: 1,
                explanation: '',
                instruction_for_choice: '',
                zone_index: 1,
                drag_item_id: '',
              },
            ],
    },
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

  const { createQuestions, createDragItem, isLoading } = useQuestion();

  const handleSubmit = async (data: DragDropFormData) => {
    if (!group.id) {
      console.error('Group ID is required to create questions and drag items');
      return;
    }

    try {
      // First, create drag items if they don't exist
      const dragItemPromises = data.drag_items.map(async (item) => {
        try {
          const response = await createDragItem(group.id!, {
            content: item.content,
            // question_id is optional based on the backend API
          });
          return response.data;
        } catch (error) {
          console.error('Failed to create drag item:', error);
          return null;
        }
      });

      const createdDragItems = await Promise.all(dragItemPromises);
      const validDragItems = createdDragItems.filter((item) => item !== null);

      // Map drag item content to their IDs for questions
      const dragItemMap = new Map();
      validDragItems.forEach((item) => {
        if (item) {
          dragItemMap.set(item.content, item.item_id);
        }
      });

      // Then create questions with correct drag item IDs
      const questionRequests = data.questions.map((question) => ({
        question_order: question.question_order,
        point: question.point,
        question_type: 3, // DRAG_AND_DROP
        question_group_id: group.id!,
        question_categories: [],
        explanation: question.explanation,
        number_of_correct_answers: 0,
        instruction_for_choice: question.instruction_for_choice,
        zone_index: question.zone_index,
        drag_item_id: dragItemMap.get(question.drag_item_id) || question.drag_item_id,
      }));

      const questionsResponse = await createQuestions(group.id, questionRequests);

      if (questionsResponse.data) {
        // Convert API responses back to frontend format
        const updatedQuestions = questionsResponse.data.map((apiResponse) => ({
          id: apiResponse.question_id,
          question_order: apiResponse.question_order,
          point: apiResponse.point,
          question_type: apiResponse.question_type,
          questionCategories: [],
          explanation: apiResponse.explanation,
          number_of_correct_answers: apiResponse.number_of_correct_answers,
          instruction_for_choice: apiResponse.instruction_for_choice,
          zone_index: apiResponse.zone_index,
          drag_item_id: apiResponse.drag_item_id,
        }));

        const updatedGroup = {
          ...group,
          drag_items: data.drag_items.map((item) => item.content),
          questions: updatedQuestions,
        };

        onUpdateGroup(updatedGroup);
      }
    } catch (error) {
      console.error('Failed to save drag & drop configuration:', error);
    }
  };

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
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h3 className='font-semibold'>Drag & Drop Questions</h3>
        <Button
          onClick={form.handleSubmit(handleSubmit)}
          className='gap-2'
          disabled={isLoading.createQuestions || isLoading.createDragItem}
        >
          <Save className='h-4 w-4' />
          {isLoading.createQuestions || isLoading.createDragItem ? 'Saving...' : 'Save All Changes'}
        </Button>
      </div>

      <Card>
        <CardContent className='pt-6'>
          <Form {...form}>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className='grid w-full grid-cols-2'>
                <TabsTrigger value='drag_items'>Drag Items ({dragItemFields.length})</TabsTrigger>
                <TabsTrigger value='questions'>Questions ({questionFields.length})</TabsTrigger>
              </TabsList>

              <TabsContent value='drag_items' className='space-y-6'>
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

                <div className='bg-blue-50 p-4 rounded-lg'>
                  <h4 className='font-medium text-blue-900 mb-2'>Drag Items Tips</h4>
                  <ul className='text-sm text-blue-700 space-y-1'>
                    <li>• Create items that students will drag to drop zones</li>
                    <li>• Use clear, concise text for each drag item</li>
                    <li>• Include extra items to make it challenging</li>
                    <li>• Order items logically or randomly as needed</li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value='questions' className='space-y-6'>
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
                                  placeholder="Describe the drop zone or task context (e.g., 'Complete the diagram by dragging the correct terms to Zone 1')"
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
                                  {drag_items.map((item, itemIndex) => (
                                    <option key={itemIndex} value={item.content}>
                                      {item.content || `Item ${itemIndex + 1}`}
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
                                <Textarea
                                  placeholder='Explain why this drag item is correct for this drop zone'
                                  {...field}
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

                <div className='bg-green-50 p-4 rounded-lg'>
                  <h4 className='font-medium text-green-900 mb-2'>Drag & Drop Question Tips</h4>
                  <ul className='text-sm text-green-700 space-y-1'>
                    <li>• Use for visual/spatial learning tasks</li>
                    <li>• Good for diagrams, flowcharts, and process completion</li>
                    <li>• Each zone should have a clear correct answer</li>
                    <li>• Consider using images or visual contexts</li>
                    <li>• Make sure drag items are distinct and unambiguous</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </Form>
        </CardContent>
      </Card>

      {/* Summary */}
      {(group.questions.length > 0 || group.drag_items?.length) && (
        <Card>
          <CardHeader>
            <CardTitle>Current Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <h4 className='font-semibold mb-2'>Drag Items ({group.drag_items?.length || 0})</h4>
                <ul className='space-y-1'>
                  {group.drag_items?.map((item, index) => (
                    <li key={index} className='text-muted-foreground'>
                      {index + 1}. {item}
                    </li>
                  )) || <li className='text-muted-foreground italic'>No items created yet</li>}
                </ul>
              </div>
              <div>
                <h4 className='font-semibold mb-2'>Questions ({group.questions.length})</h4>
                <ul className='space-y-1'>
                  {group.questions.map((question, index) => (
                    <li key={index} className='text-muted-foreground'>
                      Q{question.question_order} → Zone {question.zone_index}:{' '}
                      {question.drag_item_id}
                    </li>
                  ))}
                  {group.questions.length === 0 && (
                    <li className='text-muted-foreground italic'>No questions created yet</li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
