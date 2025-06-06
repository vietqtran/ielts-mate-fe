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
  instructionForChoice: z.string().min(1, 'Description is required'),
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
      instructionForChoice: '',
      blankIndex: 1,
      correctAnswer: '',
    },
  });

  const handleSubmit = (data: QuestionFormData) => {
    const newQuestion = {
      ...data,
      questionType: 1, // FILL_IN_THE_BLANKS
      questionCategories: [],
      numberOfCorrectAnswers: 0, // Not applicable for fill in blanks
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
      instructionForChoice: '',
      blankIndex: group.questions.length + 2,
      correctAnswer: '',
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

                <FormField
                  control={form.control}
                  name='instructionForChoice'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sentence with Blank</FormLabel>
                      <FormControl>
                        <TiptapEditor
                          content={field.value}
                          onChange={field.onChange}
                          placeholder='Enter the sentence with a blank. Use [BLANK] or _____ to indicate where students should fill in the answer.'
                        />
                      </FormControl>
                      <FormMessage />
                      <p className='text-xs text-muted-foreground'>
                        Example: "The main cause of global warming is the increase in _____ gases in
                        the atmosphere."
                      </p>
                    </FormItem>
                  )}
                />

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
                        (Blank {question.blankIndex}, {question.point} point
                        {question.point !== 1 ? 's' : ''})
                      </span>
                    </div>
                    <div
                      className='prose prose-sm max-w-none mb-3'
                      dangerouslySetInnerHTML={{ __html: question.instructionForChoice }}
                    />
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
