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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Trash2 } from 'lucide-react';
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
  instructionForChoice: z.string().min(1, 'Instruction is required'),
  numberOfCorrectAnswers: z.number().min(1),
  choices: z.array(choiceSchema).min(2, 'At least 2 choices required'),
});

type QuestionFormData = z.infer<typeof questionSchema>;

interface MultipleChoiceFormProps {
  questions: any[];
  onQuestionsChange: (questions: any[]) => void;
}

export function MultipleChoiceForm({ questions, onQuestionsChange }: MultipleChoiceFormProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      questionOrder: questions.length + 1,
      point: 1,
      explanation: '',
      instructionForChoice: '',
      numberOfCorrectAnswers: 1,
      choices: [
        { label: 'A', content: '', choiceOrder: 1, isCorrect: false },
        { label: 'B', content: '', choiceOrder: 2, isCorrect: false },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'choices',
  });

  const numberOfCorrectAnswers = form.watch('numberOfCorrectAnswers');
  const isMultipleChoice = numberOfCorrectAnswers > 1;

  const handleSubmit = (data: QuestionFormData) => {
    const newQuestion = {
      ...data,
      questionType: 0, // MULTIPLE_CHOICE
      questionCategories: [],
    };

    if (editingIndex !== null) {
      const updatedQuestions = [...questions];
      updatedQuestions[editingIndex] = newQuestion;
      onQuestionsChange(updatedQuestions);
      setEditingIndex(null);
    } else {
      onQuestionsChange([...questions, newQuestion]);
    }

    form.reset({
      questionOrder: questions.length + 2,
      point: 1,
      explanation: '',
      instructionForChoice: '',
      numberOfCorrectAnswers: 1,
      choices: [
        { label: 'A', content: '', choiceOrder: 1, isCorrect: false },
        { label: 'B', content: '', choiceOrder: 2, isCorrect: false },
      ],
    });
  };

  const handleEdit = (index: number) => {
    const question = questions[index];
    form.reset(question);
    setEditingIndex(index);
  };

  const handleDelete = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    onQuestionsChange(updatedQuestions);
  };

  const addChoice = () => {
    const nextLabel = String.fromCharCode(65 + fields.length); // A, B, C, D...
    append({
      label: nextLabel,
      content: '',
      choiceOrder: fields.length + 1,
      isCorrect: false,
    });
  };

  const handleCorrectAnswerChange = (choiceIndex: number, isCorrect: boolean) => {
    const currentChoices = form.getValues('choices');

    if (isMultipleChoice) {
      // Multiple choice: allow multiple correct answers
      form.setValue(`choices.${choiceIndex}.isCorrect`, isCorrect);
    } else {
      // Single choice: only one correct answer
      currentChoices.forEach((_, index) => {
        form.setValue(`choices.${index}.isCorrect`, index === choiceIndex && isCorrect);
      });
    }
  };

  return (
    <div className='space-y-6'>
      {/* Question Form */}
      <Card>
        <CardHeader>
          <CardTitle>{editingIndex !== null ? 'Edit Question' : 'Add New Question'}</CardTitle>
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
                    <FormLabel>Question Instruction</FormLabel>
                    <FormControl>
                      <TiptapEditor
                        content={field.value}
                        onChange={field.onChange}
                        placeholder='Enter the question instruction'
                      />
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
                      <Textarea placeholder='Enter explanation for the answer' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Choices */}
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-lg font-medium'>Answer Choices</h3>
                  <Button type='button' onClick={addChoice} variant='outline' size='sm'>
                    <Plus className='h-4 w-4 mr-2' />
                    Add Choice
                  </Button>
                </div>

                <div className='space-y-3'>
                  {fields.map((field, index) => (
                    <div key={field.id} className='flex items-start gap-4 p-4 border rounded-lg'>
                      <div className='flex items-center gap-2'>
                        {isMultipleChoice ? (
                          <Checkbox
                            checked={form.watch(`choices.${index}.isCorrect`)}
                            onCheckedChange={(checked) =>
                              handleCorrectAnswerChange(index, !!checked)
                            }
                          />
                        ) : (
                          <RadioGroup
                            value={form.watch(`choices.${index}.isCorrect`) ? index.toString() : ''}
                            onValueChange={(value) =>
                              handleCorrectAnswerChange(Number(value), true)
                            }
                          >
                            <RadioGroupItem value={index.toString()} />
                          </RadioGroup>
                        )}
                      </div>

                      <div className='flex-1 grid grid-cols-4 gap-4'>
                        <FormField
                          control={form.control}
                          name={`choices.${index}.label`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder='Label' {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className='col-span-2'>
                          <FormField
                            control={form.control}
                            name={`choices.${index}.content`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder='Choice content' {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name={`choices.${index}.choiceOrder`}
                          render={({ field }) => (
                            <FormItem>
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

                      {fields.length > 2 && (
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          onClick={() => remove(index)}
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
                      form.reset();
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
            <CardTitle>Questions ({questions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {questions.map((question, index) => (
                <div key={index} className='p-4 border rounded-lg'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <h4 className='font-medium'>Question {question.questionOrder}</h4>
                      <div
                        className='text-sm text-muted-foreground mt-1'
                        dangerouslySetInnerHTML={{ __html: question.instructionForChoice }}
                      />
                      <div className='mt-2 space-y-1'>
                        {question.choices?.map((choice: any, choiceIndex: number) => (
                          <div key={choiceIndex} className='flex items-center gap-2 text-sm'>
                            <span className={choice.isCorrect ? 'text-green-600 font-medium' : ''}>
                              {choice.label}. {choice.content}
                              {choice.isCorrect && ' ✓'}
                            </span>
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
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
