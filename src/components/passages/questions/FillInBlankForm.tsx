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
import { Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TiptapEditor } from '@/components/ui/tiptap-editor';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

const blankAnswerSchema = z.object({
  blankIndex: z.number().min(1),
  correctAnswer: z.string().min(1, 'Correct answer is required'),
});

const questionSchema = z.object({
  questionOrder: z.number().min(1),
  point: z.number().min(1),
  explanation: z.string().min(1, 'Explanation is required'),
  instructionForChoice: z.string().min(1, 'Description is required'),
  blankAnswers: z.array(blankAnswerSchema).min(1, 'At least one blank answer required'),
});

type QuestionFormData = z.infer<typeof questionSchema>;

interface FillInBlankFormProps {
  questions: any[];
  onQuestionsChange: (questions: any[]) => void;
}

export function FillInBlankForm({ questions, onQuestionsChange }: FillInBlankFormProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      questionOrder: questions.length + 1,
      point: 1,
      explanation: '',
      instructionForChoice: '',
      blankAnswers: [{ blankIndex: 1, correctAnswer: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'blankAnswers',
  });

  const handleSubmit = (data: QuestionFormData) => {
    // Create separate questions for each blank answer
    const newQuestions = data.blankAnswers.map((blank, index) => ({
      questionOrder: data.questionOrder + index,
      point: data.point,
      questionType: 1, // FILL_IN_THE_BLANKS
      questionCategories: [],
      explanation: data.explanation,
      numberOfCorrectAnswers: 0, // No choices for fill in blank
      blankIndex: blank.blankIndex,
      correctAnswer: blank.correctAnswer,
      instructionForChoice: index === 0 ? data.instructionForChoice : '', // Only first question has instruction
    }));

    if (editingIndex !== null) {
      // Update existing questions (replace all questions for this group)
      const updatedQuestions = [...questions];
      // Remove old questions for this group
      const startIndex = editingIndex;
      const endIndex = startIndex + (form.getValues('blankAnswers').length || 1);
      updatedQuestions.splice(startIndex, endIndex - startIndex, ...newQuestions);
      onQuestionsChange(updatedQuestions);
      setEditingIndex(null);
    } else {
      onQuestionsChange([...questions, ...newQuestions]);
    }

    form.reset({
      questionOrder: questions.length + newQuestions.length + 1,
      point: 1,
      explanation: '',
      instructionForChoice: '',
      blankAnswers: [{ blankIndex: 1, correctAnswer: '' }],
    });
  };

  const handleEdit = (index: number) => {
    // Find all questions that belong to this fill-in-blank group
    const question = questions[index];
    const groupQuestions = questions.filter(q => 
      q.instructionForChoice === question.instructionForChoice || 
      (q.instructionForChoice === '' && question.instructionForChoice !== '')
    );

    const blankAnswers = groupQuestions.map(q => ({
      blankIndex: q.blankIndex,
      correctAnswer: q.correctAnswer,
    }));

    form.reset({
      questionOrder: question.questionOrder,
      point: question.point,
      explanation: question.explanation,
      instructionForChoice: question.instructionForChoice,
      blankAnswers,
    });
    setEditingIndex(index);
  };

  const handleDelete = (index: number) => {
    // Find and remove all questions that belong to this fill-in-blank group
    const question = questions[index];
    const updatedQuestions = questions.filter(q => 
      !(q.instructionForChoice === question.instructionForChoice || 
        (q.instructionForChoice === '' && question.instructionForChoice !== ''))
    );
    onQuestionsChange(updatedQuestions);
  };

  const addBlankAnswer = () => {
    append({
      blankIndex: fields.length + 1,
      correctAnswer: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Question Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {editingIndex !== null ? 'Edit Fill-in-Blank Question' : 'Add New Fill-in-Blank Question'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="questionOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question Order</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="point"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Points per Blank</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="instructionForChoice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <TiptapEditor
                        content={field.value}
                        onChange={field.onChange}
                        placeholder="Enter the description with blanks. Use numbered boxes like [1], [2], [3] to indicate blank positions."
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-muted-foreground mt-1">
                      Tip: Use [1], [2], [3], etc. to create numbered blank boxes in your description.
                    </p>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="explanation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Explanation</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter explanation for the answers"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Blank Answers */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Blank Answers</h3>
                  <Button type="button" onClick={addBlankAnswer} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Blank
                  </Button>
                </div>

                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="grid grid-cols-2 gap-4 flex-1">
                        <FormField
                          control={form.control}
                          name={`blankAnswers.${index}.blankIndex`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Blank Number</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`blankAnswers.${index}.correctAnswer`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Correct Answer</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter correct answer" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                {editingIndex !== null && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingIndex(null);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                )}
                <Button type="submit">
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
            <CardTitle>Fill-in-Blank Questions ({questions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {questions
                .filter(q => q.instructionForChoice) // Only show questions with instructions (group headers)
                .map((question, index) => {
                  const relatedQuestions = questions.filter(q => 
                    q.instructionForChoice === question.instructionForChoice || 
                    (q.instructionForChoice === '' && question.instructionForChoice !== '')
                  );

                  return (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">Question {question.questionOrder}</h4>
                          <div
                            className="text-sm text-muted-foreground mt-1"
                            dangerouslySetInnerHTML={{ __html: question.instructionForChoice }}
                          />
                          <div className="mt-2 space-y-1">
                            <p className="text-sm font-medium">Answers:</p>
                            {relatedQuestions
                              .sort((a, b) => a.blankIndex - b.blankIndex)
                              .map((q, qIndex) => (
                                <div key={qIndex} className="text-sm">
                                  {q.blankIndex}. {q.correctAnswer}
                                </div>
                              ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(index)}>
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(index)}>
                            <Trash2 className="h-4 w-4" />
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
    </div>
  );
}