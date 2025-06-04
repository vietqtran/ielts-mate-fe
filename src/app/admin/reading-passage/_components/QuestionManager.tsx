'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Edit, Plus, Save, Trash2, X } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

import ChoiceManager from '@/app/admin/reading-passage/_components/ChoiceManager';
import DragItemManager from '@/app/admin/reading-passage/_components/DragItemManager';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { questionAPI } from '@/lib/api/reading';
import { Question } from '@/types/reading-passage.types';
import { toast } from 'sonner';

interface QuestionManagerProps {
  passageId: string;
  onQuestionsChange?: (questions: Question[]) => void;
}

const QUESTION_TYPES = [
  { value: 1, label: 'Multiple Choice' },
  { value: 2, label: 'Fill in the Blank' },
  { value: 3, label: 'Drag and Drop' },
  { value: 4, label: 'Matching' },
];

const QUESTION_CATEGORIES = [
  'Reading for gist',
  'Reading for detail',
  'Reading for inference',
  'Reading for opinion',
  'Reading for structure',
];

export default function QuestionManager({ passageId, onQuestionsChange }: QuestionManagerProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    question_order: 1,
    point: 1,
    question_type: 1,
    question_category: [],
    explanation: '',
    number_of_correct_answer: 1,
  });
  const [showNewQuestion, setShowNewQuestion] = useState(false);
  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await questionAPI.getQuestionsByPassage(passageId);
      if (response.status === 'success') {
        setQuestions(response.data || []);
        onQuestionsChange?.(response.data || []);
      }
    } catch (error) {
      toast.error('Failed to fetch questions');
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  }, [passageId, onQuestionsChange]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleCreateQuestion = async () => {
    if (!newQuestion.question_order || !newQuestion.explanation) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      setLoading(true);
      const questionData = {
        passage_id: passageId,
        question_order: newQuestion.question_order,
        point: newQuestion.point || 1,
        question_type: newQuestion.question_type || 1,
        question_category: newQuestion.question_category || [],
        explanation: newQuestion.explanation || '',
        number_of_correct_answer: newQuestion.number_of_correct_answer || 1,
        instruction: newQuestion.instruction,
        instruction_for_choice: newQuestion.instruction_for_choice,
        blank_index: newQuestion.blank_index,
        correct_answer: newQuestion.correct_answer,
        instruction_for_matching: newQuestion.instruction_for_matching,
        correct_answer_for_matching: newQuestion.correct_answer_for_matching,
        zone_index: newQuestion.zone_index,
        drag_item: newQuestion.drag_item,
      };

      const response = await questionAPI.createQuestion(questionData);
      if (response.status === 'success') {
        toast.success('Question created successfully');
        setShowNewQuestion(false);
        setNewQuestion({
          question_order: Math.max(...questions.map((q) => q.question_order || 0)) + 1,
          point: 1,
          question_type: 1,
          question_category: [],
          explanation: '',
          number_of_correct_answer: 1,
        });
        fetchQuestions();
      }
    } catch (error) {
      toast.error('Failed to create question');
      console.error('Error creating question:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuestion = async (questionId: string, updateData: Partial<Question>) => {
    try {
      setLoading(true);
      const response = await questionAPI.updateQuestion(questionId, updateData);
      if (response.status === 'success') {
        toast.success('Question updated successfully');
        setEditingQuestion(null);
        fetchQuestions();
      }
    } catch (error) {
      toast.error('Failed to update question');
      console.error('Error updating question:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      setLoading(true);
      const response = await questionAPI.deleteQuestion(questionId);
      if (response.status === 'success') {
        toast.success('Question deleted successfully');
        fetchQuestions();
      }
    } catch (error) {
      toast.error('Failed to delete question');
      console.error('Error deleting question:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReorderQuestions = async () => {
    try {
      setLoading(true);
      const questionOrders = questions.map((q, index) => ({
        question_id: q.question_id!,
        question_order: index + 1,
      }));

      const response = await questionAPI.reorderQuestions(passageId, questionOrders);
      if (response.status === 'success') {
        toast.success('Questions reordered successfully');
        fetchQuestions();
      }
    } catch (error) {
      toast.error('Failed to reorder questions');
      console.error('Error reordering questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const QuestionForm = ({
    question,
    isEditing = false,
    onSave,
    onCancel,
  }: {
    question: Partial<Question>;
    isEditing?: boolean;
    onSave: (data: Partial<Question>) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState(question);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <Label htmlFor='question_order'>Question Order *</Label>
            <Input
              id='question_order'
              type='number'
              value={formData.question_order || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, question_order: parseInt(e.target.value) }))
              }
              required
            />
          </div>
          <div>
            <Label htmlFor='point'>Points *</Label>
            <Input
              id='point'
              type='number'
              value={formData.point || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, point: parseInt(e.target.value) }))
              }
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor='question_type'>Question Type *</Label>
          <Select
            value={formData.question_type?.toString()}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, question_type: parseInt(value) }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder='Select question type' />
            </SelectTrigger>
            <SelectContent>
              {QUESTION_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value.toString()}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor='explanation'>Question Text/Explanation *</Label>
          <Textarea
            id='explanation'
            value={formData.explanation || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, explanation: e.target.value }))}
            required
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor='instruction'>Instruction</Label>
          <Textarea
            id='instruction'
            value={formData.instruction || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, instruction: e.target.value }))}
            rows={2}
          />
        </div>

        <div>
          <Label>Question Categories</Label>
          <div className='flex flex-wrap gap-2 mt-2'>
            {QUESTION_CATEGORIES.map((category) => (
              <Badge
                key={category}
                variant={formData.question_category?.includes(category) ? 'default' : 'outline'}
                className='cursor-pointer'
                onClick={() => {
                  const categories = formData.question_category || [];
                  const newCategories = categories.includes(category)
                    ? categories.filter((c) => c !== category)
                    : [...categories, category];
                  setFormData((prev) => ({ ...prev, question_category: newCategories }));
                }}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>

        {/* Question type specific fields */}
        {formData.question_type === 1 && (
          <div>
            <Label htmlFor='instruction_for_choice'>Choice Instruction</Label>
            <Textarea
              id='instruction_for_choice'
              value={formData.instruction_for_choice || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, instruction_for_choice: e.target.value }))
              }
              rows={2}
            />
          </div>
        )}

        {formData.question_type === 2 && (
          <>
            <div>
              <Label htmlFor='blank_index'>Blank Index</Label>
              <Input
                id='blank_index'
                type='number'
                value={formData.blank_index || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, blank_index: parseInt(e.target.value) }))
                }
              />
            </div>
            <div>
              <Label htmlFor='correct_answer'>Correct Answer</Label>
              <Input
                id='correct_answer'
                value={formData.correct_answer || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, correct_answer: e.target.value }))
                }
              />
            </div>
          </>
        )}

        {formData.question_type === 3 && (
          <div>
            <Label htmlFor='zone_index'>Zone Index</Label>
            <Input
              id='zone_index'
              type='number'
              value={formData.zone_index || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, zone_index: parseInt(e.target.value) }))
              }
            />
          </div>
        )}

        {formData.question_type === 4 && (
          <>
            <div>
              <Label htmlFor='instruction_for_matching'>Matching Instruction</Label>
              <Textarea
                id='instruction_for_matching'
                value={formData.instruction_for_matching || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, instruction_for_matching: e.target.value }))
                }
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor='correct_answer_for_matching'>Correct Answer for Matching</Label>
              <Textarea
                id='correct_answer_for_matching'
                value={formData.correct_answer_for_matching || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, correct_answer_for_matching: e.target.value }))
                }
                rows={2}
              />
            </div>
          </>
        )}

        <div className='flex gap-2'>
          <Button type='submit' disabled={loading}>
            <Save className='h-4 w-4 mr-2' />
            {isEditing ? 'Update' : 'Create'}
          </Button>
          <Button type='button' variant='outline' onClick={onCancel}>
            <X className='h-4 w-4 mr-2' />
            Cancel
          </Button>
        </div>
      </form>
    );
  };

  if (loading && questions.length === 0) {
    return <div className='p-4 text-center'>Loading questions...</div>;
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h2 className='text-2xl font-bold'>Questions Management</h2>
        <div className='flex gap-2'>
          <Button onClick={() => setShowNewQuestion(true)} disabled={showNewQuestion}>
            <Plus className='h-4 w-4 mr-2' />
            Add Question
          </Button>
          {questions.length > 1 && (
            <Button variant='outline' onClick={handleReorderQuestions} disabled={loading}>
              Reorder Questions
            </Button>
          )}
        </div>
      </div>

      {showNewQuestion && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Question</CardTitle>
          </CardHeader>
          <CardContent>
            <QuestionForm
              question={newQuestion}
              onSave={handleCreateQuestion}
              onCancel={() => setShowNewQuestion(false)}
            />
          </CardContent>
        </Card>
      )}

      <div className='space-y-4'>
        {questions.map((question) => (
          <Card key={question.question_id}>
            <CardHeader>
              <div className='flex justify-between items-start'>
                <div>
                  <CardTitle className='text-lg'>
                    Question {question.question_order} -{' '}
                    {QUESTION_TYPES.find((t) => t.value === question.question_type)?.label}
                  </CardTitle>
                  <div className='flex gap-2 mt-2'>
                    {question.question_category?.map((category) => (
                      <Badge key={category} variant='secondary'>
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className='flex gap-2'>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => setEditingQuestion(question.question_id!)}
                    disabled={editingQuestion === question.question_id}
                  >
                    <Edit className='h-4 w-4' />
                  </Button>
                  <Button
                    size='sm'
                    variant='destructive'
                    onClick={() => handleDeleteQuestion(question.question_id!)}
                    disabled={loading}
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {editingQuestion === question.question_id ? (
                <QuestionForm
                  question={question}
                  isEditing={true}
                  onSave={(data) => handleUpdateQuestion(question.question_id!, data)}
                  onCancel={() => setEditingQuestion(null)}
                />
              ) : (
                <div className='space-y-4'>
                  <div>
                    <p className='text-sm text-muted-foreground mb-1'>Question Text:</p>
                    <p>{question.explanation}</p>
                  </div>

                  {question.instruction && (
                    <div>
                      <p className='text-sm text-muted-foreground mb-1'>Instruction:</p>
                      <p>{question.instruction}</p>
                    </div>
                  )}

                  <div className='grid grid-cols-2 gap-4 text-sm'>
                    <div>
                      <span className='font-medium'>Points:</span> {question.point}
                    </div>
                    <div>
                      <span className='font-medium'>Correct Answers:</span>{' '}
                      {question.number_of_correct_answer}
                    </div>
                  </div>

                  {/* Question type specific content */}
                  {question.question_type === 1 && (
                    <ChoiceManager questionId={question.question_id!} />
                  )}

                  {question.question_type === 3 && (
                    <DragItemManager questionId={question.question_id!} />
                  )}

                  {question.question_type === 2 && question.correct_answer && (
                    <div>
                      <p className='text-sm text-muted-foreground mb-1'>Correct Answer:</p>
                      <p className='font-medium'>{question.correct_answer}</p>
                    </div>
                  )}

                  {question.question_type === 4 && question.correct_answer_for_matching && (
                    <div>
                      <p className='text-sm text-muted-foreground mb-1'>Matching Answer:</p>
                      <p className='font-medium'>{question.correct_answer_for_matching}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {questions.length === 0 && !showNewQuestion && (
        <Card>
          <CardContent className='text-center py-8'>
            <p className='text-muted-foreground mb-4'>No questions found for this passage.</p>
            <Button onClick={() => setShowNewQuestion(true)}>
              <Plus className='h-4 w-4 mr-2' />
              Create First Question
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
