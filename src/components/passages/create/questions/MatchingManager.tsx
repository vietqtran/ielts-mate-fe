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
import { TiptapEditor } from '@/components/ui/tiptap-editor';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

const questionSchema = z.object({
  questionOrder: z.number().min(1),
  point: z.number().min(1),
  explanation: z.string().min(1, 'Explanation is required'),
  instructionForMatching: z.string().min(1, 'Matching instruction is required'),
  correctAnswerForMatching: z.string().min(1, 'Correct answer mapping is required'),
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

interface MatchingManagerProps {
  group: QuestionGroup;
  groupIndex: number;
  onUpdateGroup: (group: QuestionGroup) => void;
}

export function MatchingManager({ group, groupIndex, onUpdateGroup }: MatchingManagerProps) {
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);

  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      questionOrder: group.questions.length + 1,
      point: 1,
      explanation: '',
      instructionForMatching: '',
      correctAnswerForMatching: '',
    },
  });

  const handleSubmit = (data: QuestionFormData) => {
    const newQuestion = {
      ...data,
      questionType: 2, // MATCHING
      questionCategories: [],
      numberOfCorrectAnswers: 0, // Not applicable for matching
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
    form.reset({
      questionOrder: group.questions.length + 2,
      point: 1,
      explanation: '',
      instructionForMatching: '',
      correctAnswerForMatching: '',
    });
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
        <h3 className='font-semibold'>Matching Questions ({group.questions.length})</h3>
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
              {editingQuestionIndex !== null ? 'Edit Question' : 'Add New Matching Question'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
                <div className='grid grid-cols-2 gap-4'>
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
                </div>

                <FormField
                  control={form.control}
                  name='instructionForMatching'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Matching Task Description</FormLabel>
                      <FormControl>
                        <TiptapEditor
                          content={field.value}
                          onChange={field.onChange}
                          placeholder='Describe what students need to match. Include the items to be matched and the categories/options.'
                        />
                      </FormControl>
                      <FormMessage />
                      <p className='text-xs text-muted-foreground'>
                        Example: "Match each statement (1-5) to the correct paragraph (A-E). You may
                        use any letter more than once."
                      </p>
                    </FormItem>
                  )}
                />

                <div className='grid grid-cols-1 gap-4'>
                  <div className='space-y-4'>
                    <h4 className='font-medium'>Common IELTS Matching Types:</h4>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div className='p-3 border rounded-lg'>
                        <h5 className='font-semibold text-sm text-blue-700'>Paragraph Matching</h5>
                        <p className='text-xs text-muted-foreground mt-1'>
                          Match statements to paragraphs A, B, C, etc.
                        </p>
                        <p className='text-xs text-blue-600 mt-1'>
                          Format: "1-A, 2-C, 3-B, 4-E, 5-A"
                        </p>
                      </div>
                      <div className='p-3 border rounded-lg'>
                        <h5 className='font-semibold text-sm text-green-700'>Heading Matching</h5>
                        <p className='text-xs text-muted-foreground mt-1'>
                          Match headings to sections of text
                        </p>
                        <p className='text-xs text-green-600 mt-1'>
                          Format: "1-vi, 2-ii, 3-iv, 4-i, 5-iii"
                        </p>
                      </div>
                      <div className='p-3 border rounded-lg'>
                        <h5 className='font-semibold text-sm text-purple-700'>Feature Matching</h5>
                        <p className='text-xs text-muted-foreground mt-1'>
                          Match features to people/places/times
                        </p>
                        <p className='text-xs text-purple-600 mt-1'>
                          Format: "1-Smith, 2-Jones, 3-Brown"
                        </p>
                      </div>
                      <div className='p-3 border rounded-lg'>
                        <h5 className='font-semibold text-sm text-orange-700'>
                          Information Matching
                        </h5>
                        <p className='text-xs text-muted-foreground mt-1'>
                          Match types of information to sections
                        </p>
                        <p className='text-xs text-orange-600 mt-1'>
                          Format: "1-causes, 2-effects, 3-solutions"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name='correctAnswerForMatching'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correct Answer Mapping</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Enter the correct answers in format: 1-A, 2-C, 3-B, 4-E, 5-A'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className='text-xs text-muted-foreground'>
                        Use comma-separated format. Examples: "1-A, 2-C, 3-B" or "1-vi, 2-ii, 3-iv"
                        or "1-Smith, 2-Jones, 3-Brown"
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
                          placeholder='Explain the correct answers and key clues students should look for'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='bg-blue-50 p-4 rounded-lg'>
                  <h4 className='font-medium text-blue-900 mb-2'>IELTS Matching Tips</h4>
                  <ul className='text-sm text-blue-700 space-y-1'>
                    <li>• Questions don't always follow passage order</li>
                    <li>• Options (A, B, C, etc.) can usually be used more than once</li>
                    <li>• There are often more options than questions</li>
                    <li>• Focus on paraphrasing and synonyms</li>
                    <li>• Test understanding of main ideas and specific details</li>
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
                    </div>
                    <div
                      className='prose prose-sm max-w-none mb-3'
                      dangerouslySetInnerHTML={{ __html: question.instructionForMatching }}
                    />
                    <div className='text-sm space-y-2'>
                      <div>
                        <p className='text-green-600 font-medium'>
                          <strong>Correct Answers:</strong>
                        </p>
                        <p className='font-mono text-sm bg-green-50 p-2 rounded mt-1'>
                          {question.correctAnswerForMatching}
                        </p>
                      </div>
                      {question.explanation && (
                        <p className='text-muted-foreground'>
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
          <p className='text-sm'>Add your first matching question.</p>
        </div>
      )}
    </div>
  );
}
