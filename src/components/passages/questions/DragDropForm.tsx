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
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TiptapEditor } from '@/components/ui/tiptap-editor';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';

const dragItemSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  itemOrder: z.number().min(1),
});

const questionAnswerSchema = z.object({
  zone_index: z.number().min(1),
  dragItemContent: z.string().min(1, 'Drag item content is required'),
});

const questionSchema = z.object({
  question_order: z.number().min(1),
  point: z.number().min(1),
  explanation: z.string().min(1, 'Explanation is required'),
  instruction_for_choice: z.string().min(1, 'Description is required'),
  questionAnswers: z.array(questionAnswerSchema).min(1, 'At least one zone answer required'),
});

const drag_itemsSchema = z.object({
  drag_items: z.array(dragItemSchema).min(1, 'At least one drag item required'),
});

type QuestionFormData = z.infer<typeof questionSchema>;
type DragItemsFormData = z.infer<typeof drag_itemsSchema>;

interface DragDropFormProps {
  questions: any[];
  drag_items: string[];
  onQuestionsChange: (questions: any[]) => void;
  onDragItemsChange: (drag_items: string[]) => void;
}

export function DragDropForm({
  questions,
  drag_items,
  onQuestionsChange,
  onDragItemsChange,
}: DragDropFormProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('drag_items');

  const questionForm = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      question_order: questions.length + 1,
      point: 1,
      explanation: '',
      instruction_for_choice: '',
      questionAnswers: [{ zone_index: 1, dragItemContent: '' }],
    },
  });

  const drag_itemsForm = useForm<DragItemsFormData>({
    resolver: zodResolver(drag_itemsSchema),
    defaultValues: {
      drag_items:
        drag_items.length > 0
          ? drag_items.map((item, index) => ({ content: item, itemOrder: index + 1 }))
          : [{ content: '', itemOrder: 1 }],
    },
  });

  const {
    fields: questionAnswerFields,
    append: appendAnswer,
    remove: removeAnswer,
  } = useFieldArray({
    control: questionForm.control,
    name: 'questionAnswers',
  });

  const {
    fields: dragItemFields,
    append: appendDragItem,
    remove: removeDragItem,
  } = useFieldArray({
    control: drag_itemsForm.control,
    name: 'drag_items',
  });

  const handleDragItemsSubmit = (data: DragItemsFormData) => {
    const newDragItems = data.drag_items.map((item) => item.content);
    onDragItemsChange(newDragItems);
  };

  const handleQuestionSubmit = (data: QuestionFormData) => {
    // Create separate questions for each zone answer
    const newQuestions = data.questionAnswers.map((answer, index) => ({
      question_order: data.question_order + index,
      point: data.point,
      question_type: 3, // DRAG_AND_DROP
      question_categories: [],
      explanation: data.explanation,
      number_of_correct_answers: 0, // No traditional choices for drag drop
      zone_index: answer.zone_index,
      dragItemContent: answer.dragItemContent, // We'll map this to drag_item_id later
      instruction_for_choice: index === 0 ? data.instruction_for_choice : '', // Only first question has instruction
    }));

    if (editingIndex !== null) {
      // Update existing questions
      const updatedQuestions = [...questions];
      const startIndex = editingIndex;
      const endIndex = startIndex + (questionForm.getValues('questionAnswers').length || 1);
      updatedQuestions.splice(startIndex, endIndex - startIndex, ...newQuestions);
      onQuestionsChange(updatedQuestions);
      setEditingIndex(null);
    } else {
      onQuestionsChange([...questions, ...newQuestions]);
    }

    questionForm.reset({
      question_order: questions.length + newQuestions.length + 1,
      point: 1,
      explanation: '',
      instruction_for_choice: '',
      questionAnswers: [{ zone_index: 1, dragItemContent: '' }],
    });
  };

  const handleEdit = (index: number) => {
    const question = questions[index];
    const groupQuestions = questions.filter(
      (q) =>
        q.instruction_for_choice === question.instruction_for_choice ||
        (q.instruction_for_choice === '' && question.instruction_for_choice !== '')
    );

    const questionAnswers = groupQuestions.map((q) => ({
      zone_index: q.zone_index,
      dragItemContent: q.dragItemContent,
    }));

    questionForm.reset({
      question_order: question.question_order,
      point: question.point,
      explanation: question.explanation,
      instruction_for_choice: question.instruction_for_choice,
      questionAnswers,
    });
    setEditingIndex(index);
  };

  const handleDelete = (index: number) => {
    const question = questions[index];
    const updatedQuestions = questions.filter(
      (q) =>
        !(
          q.instruction_for_choice === question.instruction_for_choice ||
          (q.instruction_for_choice === '' && question.instruction_for_choice !== '')
        )
    );
    onQuestionsChange(updatedQuestions);
  };

  const addQuestionAnswer = () => {
    appendAnswer({
      zone_index: questionAnswerFields.length + 1,
      dragItemContent: '',
    });
  };

  const addDragItem = () => {
    appendDragItem({
      content: '',
      itemOrder: dragItemFields.length + 1,
    });
  };

  return (
    <div className='space-y-6'>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='drag_items'>Drag Items</TabsTrigger>
          <TabsTrigger value='questions'>Questions</TabsTrigger>
        </TabsList>

        <TabsContent value='drag_items' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Manage Drag Items</CardTitle>
              <p className='text-sm text-muted-foreground'>
                Create the items that students can drag into the zones. These items will be
                available for all questions in this group.
              </p>
            </CardHeader>
            <CardContent>
              <Form {...drag_itemsForm}>
                <form
                  onSubmit={drag_itemsForm.handleSubmit(handleDragItemsSubmit)}
                  className='space-y-6'
                >
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <h3 className='text-lg font-medium'>Drag Items</h3>
                      <Button type='button' onClick={addDragItem} variant='outline' size='sm'>
                        <Plus className='h-4 w-4 mr-2' />
                        Add Item
                      </Button>
                    </div>

                    <div className='space-y-3'>
                      {dragItemFields.map((field, index) => (
                        <div
                          key={field.id}
                          className='flex items-center gap-4 p-4 border rounded-lg'
                        >
                          <GripVertical className='h-4 w-4 text-muted-foreground' />

                          <div className='grid grid-cols-2 gap-4 flex-1'>
                            <FormField
                              control={drag_itemsForm.control}
                              name={`drag_items.${index}.content`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Content</FormLabel>
                                  <FormControl>
                                    <Input placeholder='Enter drag item content' {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={drag_itemsForm.control}
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
                  </div>

                  <Button type='submit'>Save Drag Items</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='questions' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>
                {editingIndex !== null
                  ? 'Edit Drag & Drop Question'
                  : 'Add New Drag & Drop Question'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...questionForm}>
                <form
                  onSubmit={questionForm.handleSubmit(handleQuestionSubmit)}
                  className='space-y-6'
                >
                  <div className='grid grid-cols-2 gap-4'>
                    <FormField
                      control={questionForm.control}
                      name='question_order'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Question Order</FormLabel>
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
                      control={questionForm.control}
                      name='point'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Points per Zone</FormLabel>
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
                    control={questionForm.control}
                    name='instruction_for_choice'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <TiptapEditor
                            content={field.value}
                            onChange={field.onChange}
                            placeholder='Enter the description with drop zones. Use [ZONE:1], [ZONE:2], [ZONE:3] to indicate drop zones.'
                          />
                        </FormControl>
                        <FormMessage />
                        <p className='text-sm text-muted-foreground mt-1'>
                          Use [ZONE:1], [ZONE:2], [ZONE:3], etc. to create drop zones in your
                          description.
                        </p>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={questionForm.control}
                    name='explanation'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Explanation</FormLabel>
                        <FormControl>
                          <Textarea placeholder='Enter explanation for the answers' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Zone Answers */}
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <h3 className='text-lg font-medium'>Zone Answers</h3>
                      <Button type='button' onClick={addQuestionAnswer} variant='outline' size='sm'>
                        <Plus className='h-4 w-4 mr-2' />
                        Add Zone
                      </Button>
                    </div>

                    <div className='space-y-3'>
                      {questionAnswerFields.map((field, index) => (
                        <div
                          key={field.id}
                          className='flex items-center gap-4 p-4 border rounded-lg'
                        >
                          <div className='grid grid-cols-2 gap-4 flex-1'>
                            <FormField
                              control={questionForm.control}
                              name={`questionAnswers.${index}.zone_index`}
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
                              control={questionForm.control}
                              name={`questionAnswers.${index}.dragItemContent`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Correct Drag Item</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder='Enter the correct drag item content'
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {questionAnswerFields.length > 1 && (
                            <Button
                              type='button'
                              variant='ghost'
                              size='sm'
                              onClick={() => removeAnswer(index)}
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className='flex justify-end gap-2'>
                    {editingIndex !== null && (
                      <Button
                        type='button'
                        variant='outline'
                        onClick={() => {
                          setEditingIndex(null);
                          questionForm.reset();
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                    <Button type='submit'>
                      {editingIndex !== null ? 'Update Question' : 'Add Question'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Questions List */}
          {questions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Drag & Drop Questions ({questions.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {questions
                    .filter((q) => q.instruction_for_choice) // Only show questions with instructions
                    .map((question, index) => {
                      const relatedQuestions = questions.filter(
                        (q) =>
                          q.instruction_for_choice === question.instruction_for_choice ||
                          (q.instruction_for_choice === '' &&
                            question.instruction_for_choice !== '')
                      );

                      return (
                        <div key={index} className='p-4 border rounded-lg'>
                          <div className='flex items-start justify-between'>
                            <div className='flex-1'>
                              <h4 className='font-medium'>Question {question.question_order}</h4>
                              <div
                                className='text-sm text-muted-foreground mt-1'
                                dangerouslySetInnerHTML={{
                                  __html: question.instruction_for_choice,
                                }}
                              />
                              <div className='mt-2 space-y-1'>
                                <p className='text-sm font-medium'>Zone Answers:</p>
                                {relatedQuestions
                                  .sort((a, b) => a.zone_index - b.zone_index)
                                  .map((q, qIndex) => (
                                    <div key={qIndex} className='text-sm'>
                                      Zone {q.zone_index}: {q.dragItemContent}
                                    </div>
                                  ))}
                              </div>
                            </div>
                            <div className='flex gap-2'>
                              <Button variant='ghost' size='sm' onClick={() => handleEdit(index)}>
                                Edit
                              </Button>
                              <Button variant='ghost' size='sm' onClick={() => handleDelete(index)}>
                                <Trash2 className='h-4 w-4' />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Current Drag Items Display */}
      {drag_items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Available Drag Items ({drag_items.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex flex-wrap gap-2'>
              {drag_items.map((item, index) => (
                <div
                  key={index}
                  className='px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm'
                >
                  {item}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
