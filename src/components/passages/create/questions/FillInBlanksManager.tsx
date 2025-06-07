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

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useQuestion } from '@/hooks/useQuestion';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

const questionSchema = z.object({
  questionOrder: z.number().min(1),
  point: z.number().min(1),
  explanation: z.string().min(1, 'Explanation is required'),
  blankIndex: z.number().min(1),
  correctAnswer: z.string().min(1, 'Correct answer is required'),
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

interface FillInBlanksManagerProps {
  group: QuestionGroup;
  groupIndex: number;
  onUpdateGroup: (group: QuestionGroup) => void;
}

export function FillInBlanksManager({ group, onUpdateGroup }: Readonly<FillInBlanksManagerProps>) {
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);

  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      questionOrder: group.questions.length + 1,
      point: 1,
      explanation: '',
      blankIndex: 1,
      correctAnswer: '',
    },
  });

  const { createQuestions, isLoading } = useQuestion();

  const handleSubmit = async (data: QuestionFormData) => {
    if (!group.id) {
      console.error('Group ID is required to create questions');
      return;
    }

    // Convert to API format using snake_case
    const questionRequest = {
      question_order: data.questionOrder,
      point: data.point,
      question_type: 1, // FILL_IN_THE_BLANKS
      question_group_id: group.id,
      question_categories: [],
      explanation: data.explanation,
      number_of_correct_answers: 0, // Not applicable for fill in blanks
      blank_index: data.blankIndex,
      correct_answer: data.correctAnswer,
    };

    try {
      if (editingQuestionIndex !== null) {
        // For editing, we would need an update API - for now just update local state
        const localQuestion = {
          questionOrder: data.questionOrder,
          point: data.point,
          questionType: 1,
          questionCategories: [],
          explanation: data.explanation,
          numberOfCorrectAnswers: 0,
          blankIndex: data.blankIndex,
          correctAnswer: data.correctAnswer,
          instructionForChoice: '',
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
            id: apiResponse?.questionId,
            questionOrder: apiResponse?.questionOrder || data.questionOrder,
            point: apiResponse?.point || data.point,
            questionType: apiResponse?.questionType || 1,
            questionCategories: [],
            explanation: apiResponse?.explanation || data.explanation,
            numberOfCorrectAnswers: apiResponse?.numberOfCorrectAnswers || 0,
            blankIndex: apiResponse?.blankIndex || data.blankIndex,
            correctAnswer: apiResponse?.correctAnswer || data.correctAnswer,
            instructionForChoice: '',
          };
          onUpdateGroup({
            ...group,
            questions: [...group.questions, newQuestion],
          });
        }
      }

      setIsAddingQuestion(false);
      form.reset({
        questionOrder: group.questions.length + 2,
        point: 1,
        explanation: '',
        blankIndex: group.questions.length + 2,
        correctAnswer: '',
      });
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

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h3 className='font-semibold'>Fill in the Blanks Questions ({group.questions.length})</h3>
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
              {editingQuestionIndex !== null ? 'Edit Question' : 'Add New Fill in Blanks Question'}
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
                    name='blankIndex'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Blank Number</FormLabel>
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

                <div className='bg-blue-50 p-4 rounded-lg'>
                  <h4 className='font-medium text-blue-900 mb-2'>
                    Fill in the Blanks Instructions
                  </h4>
                  <p className='text-sm text-blue-700'>
                    The instruction for fill-in-blank questions is now managed at the group level
                    above. Each question represents one blank in the overall instruction text.
                  </p>
                  <p className='text-xs text-blue-600 mt-2'>
                    Example: Use the group instruction to describe the sentence with blanks, then
                    specify which blank number this question represents.
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name='correctAnswer'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correct Answer</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter the correct answer (usually 1-3 words)'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className='text-xs text-muted-foreground'>
                        Use the exact words from the passage. Multiple acceptable answers can be
                        separated by commas.
                      </p>
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
                          placeholder="Explain where in the passage the answer can be found and why it's correct"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='bg-blue-50 p-4 rounded-lg'>
                  <h4 className='font-medium text-blue-900 mb-2'>IELTS Fill in Blanks Tips</h4>
                  <ul className='text-sm text-blue-700 space-y-1'>
                    <li>• Use words directly from the passage (exact spelling matters)</li>
                    <li>• Usually 1-3 words per blank, follow instruction word limits</li>
                    <li>• Questions typically follow passage order</li>
                    <li>• Test factual information, dates, names, or key terms</li>
                    <li>• Consider synonyms that students might reasonably use</li>
                  </ul>
                </div>

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
                      <span className='font-semibold'>Q{question.questionOrder}</span>
                      <span className='text-sm text-muted-foreground'>
                        (Blank {question.blankIndex}, {question.point} point
                        {question.point !== 1 ? 's' : ''})
                      </span>
                    </div>
                    <div className='mb-3'>
                      <span className='text-sm text-muted-foreground'>
                        Blank {question.blankIndex} for group instruction
                      </span>
                    </div>
                    <div className='text-sm'>
                      <p className='text-green-600 font-medium'>
                        <strong>Answer:</strong> {question.correctAnswer}
                      </p>
                      {question.explanation && (
                        <p className='text-muted-foreground mt-1'>
                          <strong>Explanation:</strong> {question.explanation}
                        </p>
                      )}
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
          <p className='text-sm'>Add your first fill-in-the-blanks question.</p>
        </div>
      )}
    </div>
  );
}
