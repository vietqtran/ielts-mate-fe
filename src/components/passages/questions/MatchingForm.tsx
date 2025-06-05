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

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TiptapEditor } from '@/components/ui/tiptap-editor';
import { Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

const questionSchema = z.object({
  questionOrder: z.number().min(1),
  point: z.number().min(1),
  explanation: z.string().min(1, 'Explanation is required'),
  instructionForMatching: z.string().min(1, 'Instruction is required'),
  correctAnswerForMatching: z.string().min(1, 'Correct answer mapping is required'),
});

type QuestionFormData = z.infer<typeof questionSchema>;

interface MatchingFormProps {
  questions: any[];
  onQuestionsChange: (questions: any[]) => void;
}

export function MatchingForm({ questions, onQuestionsChange }: MatchingFormProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      questionOrder: questions.length + 1,
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
      numberOfCorrectAnswers: 0, // No traditional choices for matching
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
      instructionForMatching: '',
      correctAnswerForMatching: '',
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

  return (
    <div className="space-y-6">
      {/* Question Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {editingIndex !== null ? 'Edit Matching Question' : 'Add New Matching Question'}
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
                      <FormLabel>Points</FormLabel>
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
                name="instructionForMatching"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Matching Instruction</FormLabel>
                    <FormControl>
                      <TiptapEditor
                        content={field.value}
                        onChange={field.onChange}
                        placeholder="Enter the matching instruction. Describe the table format and what needs to be matched (e.g., 'Match the following statements to the correct paragraph A-E')"
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-muted-foreground mt-1">
                      Describe the matching task. The passage should be divided into sections (A, B, C, D, E, etc.)
                    </p>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="correctAnswerForMatching"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correct Answer Mapping</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the correct answer mapping (e.g., '1-A, 2-C, 3-B, 4-E, 5-D')"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-muted-foreground mt-1">
                      Format: Question number - Section letter (e.g., "1-A, 2-C, 3-B")
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
                        placeholder="Enter explanation for the matching answers"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Matching Question Format</h4>
                <p className="text-sm text-blue-700 mb-2">
                  In a matching question, the reading passage is typically divided into sections (A, B, C, D, E, etc.).
                  Students need to match statements or questions to the correct section.
                </p>
                <p className="text-sm text-blue-700">
                  Example: "Match each statement (1-5) to the correct paragraph (A-E). You may use any letter more than once."
                </p>
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
            <CardTitle>Matching Questions ({questions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">Question {question.questionOrder}</h4>
                      <div className="mt-2">
                        <p className="text-sm font-medium text-muted-foreground">Instruction:</p>
                        <div
                          className="text-sm mt-1"
                          dangerouslySetInnerHTML={{ __html: question.instructionForMatching }}
                        />
                      </div>
                      <div className="mt-2">
                        <p className="text-sm font-medium text-muted-foreground">Correct Answers:</p>
                        <p className="text-sm mt-1 font-mono bg-gray-50 p-2 rounded">
                          {question.correctAnswerForMatching}
                        </p>
                      </div>
                      {question.explanation && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-muted-foreground">Explanation:</p>
                          <p className="text-sm mt-1">{question.explanation}</p>
                        </div>
                      )}
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
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}