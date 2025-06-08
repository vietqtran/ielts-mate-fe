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
import { useQuestion } from '@/hooks/useQuestion';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';

const choiceSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  content: z.string().min(1, 'Content is required'),
  choice_order: z.number().min(1),
  is_correct: z.boolean(),
});

const questionSchema = z.object({
  question_order: z.number().min(1),
  point: z.number().min(1),
  explanation: z.string().min(1, 'Explanation is required'),
  instruction_for_choice: z.string().min(1, 'Question text is required'),
  number_of_correct_answers: z.number().min(1),
  choices: z.array(choiceSchema).min(2, 'At least 2 choices required'),
});

type QuestionFormData = z.infer<typeof questionSchema>;

interface QuestionGroup {
  id?: string;
  section_order: number;
  section_label: string;
  instruction: string;
  question_type: string;
  questions: any[];
}

interface MultipleChoiceManagerProps {
  group: QuestionGroup;
  groupIndex: number;
  onUpdateGroup: (group: QuestionGroup) => void;
}

export function MultipleChoiceManager({
  group,
  onUpdateGroup,
}: Readonly<MultipleChoiceManagerProps>) {
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);

  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      question_order: group.questions.length + 1,
      point: 1,
      explanation: '',
      instruction_for_choice: '',
      number_of_correct_answers: 1,
      choices: [
        { label: 'A', content: '', choice_order: 1, is_correct: false },
        { label: 'B', content: '', choice_order: 2, is_correct: false },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'choices',
  });

  const number_of_correct_answers = form.watch('number_of_correct_answers');
  const choices = form.watch('choices');

  const { createQuestions, isLoading } = useQuestion();

  const handleSubmit = async (data: QuestionFormData) => {
    const correctCount = data.choices.filter((choice) => choice.is_correct).length;

    if (correctCount === 0) {
      form.setError('choices', { message: 'At least one choice must be correct' });
      return;
    }

    if (correctCount !== data.number_of_correct_answers) {
      form.setError('number_of_correct_answers', {
        message: `Number of correct answers (${data.number_of_correct_answers}) must match selected correct choices (${correctCount})`,
      });
      return;
    }

    if (!group.id) {
      console.error('Group ID is required to create questions');
      return;
    }

    // Convert to API format using snake_case
    const questionRequest = {
      question_order: data.question_order,
      point: data.point,
      question_type: 0, // MULTIPLE_CHOICE
      question_group_id: group.id,
      question_categories: [],
      explanation: data.explanation,
      number_of_correct_answers: data.number_of_correct_answers,
      instruction_for_choice: data.instruction_for_choice,
      choices: data.choices.map((choice) => ({
        label: choice.label,
        content: choice.content,
        choice_order: choice.choice_order,
        is_correct: choice.is_correct,
      })),
    };

    try {
      if (editingQuestionIndex !== null) {
        // For editing, we would need an update API - for now just update local state
        const localQuestion = {
          question_order: data.question_order,
          point: data.point,
          question_type: 0,
          questionCategories: [],
          explanation: data.explanation,
          number_of_correct_answers: data.number_of_correct_answers,
          instruction_for_choice: data.instruction_for_choice,
          choices: data.choices,
        };
        const updatedQuestions = [...group.questions];
        updatedQuestions[editingQuestionIndex] = localQuestion;
        onUpdateGroup({ ...group, questions: updatedQuestions });
        setEditingQuestionIndex(null);
      } else {
        // Create new question via API
        const response = await createQuestions(group.id, [questionRequest]);
        if (response.data) {
          // Convert API response back to frontend format
          const apiResponse = response.data[0];
          const newQuestion = {
            id: apiResponse?.question_id,
            question_order: apiResponse?.question_order || data.question_order,
            point: apiResponse?.point || data.point,
            question_type: apiResponse?.question_type || 0,
            questionCategories: [],
            explanation: apiResponse?.explanation || data.explanation,
            number_of_correct_answers:
              apiResponse?.number_of_correct_answers || data.number_of_correct_answers,
            instruction_for_choice:
              apiResponse?.instruction_for_choice || data.instruction_for_choice,
            choices:
              apiResponse?.choices?.map((choice) => ({
                id: choice.choice_id,
                label: choice.label,
                content: choice.content,
                choice_order: choice.choice_order,
                is_correct: choice.is_correct,
              })) || data.choices,
          };
          onUpdateGroup({
            ...group,
            questions: [...group.questions, newQuestion],
          });
        }
      }

      setIsAddingQuestion(false);
      form.reset();
    } catch (error) {
      console.error('Failed to create question:', error);
    }
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
      choice_order: fields.length + 1,
      is_correct: false,
    });
  };

  const handleCorrectAnswerChange = (choiceIndex: number, isChecked: boolean) => {
    if (number_of_correct_answers === 1) {
      // Single answer: uncheck all others
      choices.forEach((_, index) => {
        form.setValue(`choices.${index}.is_correct`, index === choiceIndex ? isChecked : false);
      });
    } else {
      // Multiple answers: just toggle this one
      form.setValue(`choices.${choiceIndex}.is_correct`, isChecked);
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
                    name='number_of_correct_answers'
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
                  name='instruction_for_choice'
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
                          {number_of_correct_answers === 1 ? (
                            <input
                              type='radio'
                              name='correct_answer'
                              checked={choices[index]?.is_correct || false}
                              onChange={(e) => handleCorrectAnswerChange(index, e.target.checked)}
                              className='w-4 h-4'
                            />
                          ) : (
                            <Checkbox
                              checked={choices[index]?.is_correct || false}
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
                  <Button type='submit' className='gap-2' disabled={isLoading.createQuestions}>
                    <Save className='h-4 w-4' />
                    {isLoading.createQuestions
                      ? 'Creating...'
                      : editingQuestionIndex !== null
                        ? 'Update Question'
                        : 'Add Question'}
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
                      <span className='font-semibold'>Q{question.question_order}</span>
                      <span className='text-sm text-muted-foreground'>
                        ({question.point} point{question.point !== 1 ? 's' : ''})
                      </span>
                      {question.number_of_correct_answers > 1 && (
                        <span className='text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded'>
                          {question.number_of_correct_answers} correct answers
                        </span>
                      )}
                    </div>
                    <div
                      className='prose prose-sm max-w-none mb-3'
                      dangerouslySetInnerHTML={{ __html: question.instruction_for_choice }}
                    />
                    <div className='space-y-2'>
                      {question.choices?.map((choice: any, choiceIndex: number) => (
                        <div
                          key={choiceIndex}
                          className={`flex items-center gap-2 text-sm ${choice.is_correct ? 'text-green-600 font-medium' : ''}`}
                        >
                          <span className='font-mono'>{choice.label}.</span>
                          <span>{choice.content}</span>
                          {choice.is_correct && <span className='text-green-600'>✓</span>}
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
