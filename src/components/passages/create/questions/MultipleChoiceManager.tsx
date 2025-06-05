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
import { Plus, Save, Trash2 } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TiptapEditor } from '@/components/ui/tiptap-editor';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';

const choiceSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  content: z.string().min(1, 'Content is required'),
  choiceOrder: z.number().min(1),
  isCorrect: z.boolean(),
});

const questionSchema = z.object({
  questionOrder: z.number().min(1),
  point: z.number().min(1),
  explanation: z.string().min(1, 'Explanation is required'),
  instructionForChoice: z.string().min(1, 'Question text is required'),
  numberOfCorrectAnswers: z.number().min(1),
  choices: z.array(choiceSchema).min(2, 'At least 2 choices required'),
});

type QuestionFormData = z.infer<typeof questionSchema>;

interface QuestionGroup {
  id?: string;
  sectionOrder: number;
  sectionLabel: string;
  instruction: string;
  questionType: string;
  questions: any[];
}

interface MultipleChoiceManagerProps {
  group: QuestionGroup;
  groupIndex: number;
  onUpdateGroup: (group: QuestionGroup) => void;
}

export function MultipleChoiceManager({
  group,
  groupIndex,
  onUpdateGroup,
}: MultipleChoiceManagerProps) {
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);

  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      questionOrder: group.questions.length + 1,
      point: 1,
      explanation: '',
      instructionForChoice: '',
      numberOfCorrectAnswers: 1,
      choices: [
        { label: 'A', content: '', choiceOrder: 1, isCorrect: false },
        { label: 'B', content: '', choiceOrder: 2, isCorrect: false },
        { label: 'C', content: '', choiceOrder: 3, isCorrect: false },
        { label: 'D', content: '', choiceOrder: 4, isCorrect: false },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'choices',
  });

  const numberOfCorrectAnswers = form.watch('numberOfCorrectAnswers');
  const choices = form.watch('choices');

  const handleSubmit = (data: QuestionFormData) => {
    const correctCount = data.choices.filter((choice) => choice.isCorrect).length;

    if (correctCount === 0) {
      form.setError('choices', { message: 'At least one choice must be correct' });
      return;
    }

    if (correctCount !== data.numberOfCorrectAnswers) {
      form.setError('numberOfCorrectAnswers', {
        message: `Number of correct answers (${data.numberOfCorrectAnswers}) must match selected correct choices (${correctCount})`,
      });
      return;
    }

    const newQuestion = {
      ...data,
      questionType: 0, // MULTIPLE_CHOICE
      questionCategories: [],
    };

    if (editingQuestionIndex !== null) {
      const updatedQuestions = [...group.questions];
      updatedQuestions[editingQuestionIndex] = newQuestion;
      onUpdateGroup({ ...group, questions: updatedQuestions });
      setEditingQuestionIndex(null);
    } else {
      onUpdateGroup({
        ...group,
        questions: [...group.questions, newQuestion],
      });
    }

    setIsAddingQuestion(false);
    form.reset();
  };

  const handleEdit = (index: number) => {
    const question = group.questions[index];
    form.reset(question);
    setEditingQuestionIndex(index);
    setIsAddingQuestion(true);
  };

  const handleDelete = (index: number) => {
    const updatedQuestions = group.questions.filter((_, i) => i !== index);
    onUpdateGroup({ ...group, questions: updatedQuestions });
  };

  const addChoice = () => {
    const nextLabel = String.fromCharCode(65 + fields.length); // A, B, C, D, E, F...
    append({
      label: nextLabel,
      content: '',
      choiceOrder: fields.length + 1,
      isCorrect: false,
    });
  };

  const handleCorrectAnswerChange = (choiceIndex: number, isChecked: boolean) => {
    if (numberOfCorrectAnswers === 1) {
      // Single answer: uncheck all others
      choices.forEach((_, index) => {
        form.setValue(`choices.${index}.isCorrect`, index === choiceIndex ? isChecked : false);
      });
    } else {
      // Multiple answers: just toggle this one
      form.setValue(`choices.${choiceIndex}.isCorrect`, isChecked);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h3 className='font-semibold'>Multiple Choice Questions ({group.questions.length})</h3>
        <Button onClick={() => setIsAddingQuestion(true)} className='gap-2'>
          <Plus className='h-4 w-4' />
          Add Question
        </Button>
      </div>

      {/* Add/Edit Question Form */}
      {isAddingQuestion && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingQuestionIndex !== null ? 'Edit Question' : 'Add New Multiple Choice Question'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
                <div className='grid grid-cols-3 gap-4'>
                  <FormField
                    control={form.control}
                    name='questionOrder'
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

                  <FormField
                    control={form.control}
                    name='numberOfCorrectAnswers'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correct Answers</FormLabel>
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
                </div>

                <FormField
                  control={form.control}
                  name='instructionForChoice'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question Text</FormLabel>
                      <FormControl>
                        <TiptapEditor
                          content={field.value}
                          onChange={field.onChange}
                          placeholder="Enter the question text (e.g., 'According to the passage, what is the main cause of climate change?')"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Choices */}
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <FormLabel>Answer Choices</FormLabel>
                    <Button type='button' onClick={addChoice} variant='outline' size='sm'>
                      <Plus className='h-4 w-4 mr-2' />
                      Add Choice
                    </Button>
                  </div>

                  <div className='space-y-3'>
                    {fields.map((field, index) => (
                      <div key={field.id} className='flex items-start gap-4 p-4 border rounded-lg'>
                        <div className='flex items-center mt-2'>
                          {numberOfCorrectAnswers === 1 ? (
                            <input
                              type='radio'
                              name='correctAnswer'
                              checked={choices[index]?.isCorrect || false}
                              onChange={(e) => handleCorrectAnswerChange(index, e.target.checked)}
                              className='w-4 h-4'
                            />
                          ) : (
                            <Checkbox
                              checked={choices[index]?.isCorrect || false}
                              onCheckedChange={(checked) =>
                                handleCorrectAnswerChange(index, !!checked)
                              }
                            />
                          )}
                        </div>

                        <div className='grid grid-cols-4 gap-4 flex-1'>
                          <FormField
                            control={form.control}
                            name={`choices.${index}.label`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Label</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className='col-span-3'>
                            <FormField
                              control={form.control}
                              name={`choices.${index}.content`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Choice Text</FormLabel>
                                  <FormControl>
                                    <Textarea placeholder='Enter choice content' {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        {fields.length > 2 && (
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            onClick={() => remove(index)}
                            className='mt-8'
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name='explanation'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Explanation</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Explain why the correct answer(s) are correct and why others are wrong'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='flex justify-end gap-2'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => {
                      setIsAddingQuestion(false);
                      setEditingQuestionIndex(null);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type='submit' className='gap-2'>
                    <Save className='h-4 w-4' />
                    {editingQuestionIndex !== null ? 'Update Question' : 'Add Question'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Questions List */}
      {group.questions.length > 0 && (
        <div className='space-y-4'>
          <h4 className='font-medium'>Questions:</h4>
          {group.questions.map((question, index) => (
            <Card key={index}>
              <CardContent className='pt-4'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-2'>
                      <span className='font-semibold'>Q{question.questionOrder}</span>
                      <span className='text-sm text-muted-foreground'>
                        ({question.point} point{question.point !== 1 ? 's' : ''})
                      </span>
                      {question.numberOfCorrectAnswers > 1 && (
                        <span className='text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded'>
                          {question.numberOfCorrectAnswers} correct answers
                        </span>
                      )}
                    </div>
                    <div
                      className='prose prose-sm max-w-none mb-3'
                      dangerouslySetInnerHTML={{ __html: question.instructionForChoice }}
                    />
                    <div className='space-y-2'>
                      {question.choices?.map((choice: any, choiceIndex: number) => (
                        <div
                          key={choiceIndex}
                          className={`flex items-center gap-2 text-sm ${choice.isCorrect ? 'text-green-600 font-medium' : ''}`}
                        >
                          <span className='font-mono'>{choice.label}.</span>
                          <span>{choice.content}</span>
                          {choice.isCorrect && <span className='text-green-600'>✓</span>}
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {group.questions.length === 0 && !isAddingQuestion && (
        <div className='text-center py-8 text-muted-foreground'>
          <Plus className='h-8 w-8 mx-auto mb-2 opacity-50' />
          <p>No questions created yet.</p>
          <p className='text-sm'>Add your first multiple choice question.</p>
        </div>
      )}
    </div>
  );
}
