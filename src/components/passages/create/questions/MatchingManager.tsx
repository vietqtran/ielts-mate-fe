'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MatchingForm, MatchingFormData } from './MatchingForm';

import { Button } from '@/components/ui/button';
import { useQuestion } from '@/hooks/useQuestion';

interface QuestionGroup {
  id?: string;
  section_order: number;
  section_label: string;
  instruction: string;
  question_type: string;
  questions: any[];
}

interface MatchingManagerProps {
  group: QuestionGroup;
  refetchPassageData: () => void;
}

export function MatchingManager({ group, refetchPassageData }: Readonly<MatchingManagerProps>) {
  const [isAddingOrEditing, setIsAddingOrEditing] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const [localQuestions, setLocalQuestions] = useState(group.questions);

  useEffect(() => {
    setLocalQuestions(group.questions);
  }, [group.questions]);

  const { createQuestions, updateQuestionInfo, deleteQuestion, isLoading } = useQuestion();

  const handleFormSubmit = async (data: MatchingFormData) => {
    if (!group.id) {
      console.error('Group ID is required');
      return;
    }

    const questionRequest = {
      ...data,
      question_type: 2, // MATCHING
      question_group_id: group.id,
      question_categories: [],
      number_of_correct_answers: 0, // Not applicable
    };

    try {
      if (editingQuestion) {
        // Update existing question
        await updateQuestionInfo(group.id, editingQuestion.id, questionRequest);
        refetchPassageData();
      } else {
        // Create new question
        await createQuestions(group.id, [questionRequest]);
        refetchPassageData();
      }
      setIsAddingOrEditing(false);
      setEditingQuestion(null);
    } catch (error) {
      console.error('Failed to save question:', error);
    }
  };

  const handleEdit = (question: any) => {
    setEditingQuestion(question);
    setIsAddingOrEditing(true);
  };

  const handleDelete = async (questionId: string) => {
    if (!group.id) {
      console.error('Group ID is required');
      return;
    }
    try {
      await deleteQuestion(group.id, questionId);
      setLocalQuestions((prev) => prev.filter((q) => q.id !== questionId));
    } catch (error) {
      console.error('Failed to delete question:', error);
    }
  };

  const handleCancel = () => {
    setIsAddingOrEditing(false);
    setEditingQuestion(null);
  };

  const defaultInitialData = {
    question_order: localQuestions.length + 1,
    point: 1,
    explanation: '',
    instruction_for_matching: '',
    correct_answer_for_matching: '',
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h3 className='font-semibold'>Matching Questions ({localQuestions.length})</h3>
        <Button onClick={() => setIsAddingOrEditing(true)} className='gap-2'>
          <Plus className='h-4 w-4' />
          Add Question
        </Button>
      </div>

      {isAddingOrEditing && (
        <MatchingForm
          initialData={editingQuestion ?? defaultInitialData}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
          isSubmitting={isLoading.createQuestions || isLoading.updateQuestionInfo}
        />
      )}

      {/* Questions List */}
      {!isAddingOrEditing && localQuestions.length > 0 && (
        <div className='space-y-4 mt-4'>
          <h4 className='font-medium'>Questions:</h4>
          {localQuestions.map((question) => (
            <Card key={question.id}>
              <CardContent className='pt-4'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-2'>
                      <span className='font-semibold'>Q{question.question_order}</span>
                      <span className='text-sm text-muted-foreground'>
                        ({question.point} point{question.point !== 1 ? 's' : ''})
                      </span>
                    </div>
                    <div
                      className='prose prose-sm max-w-none mb-3'
                      dangerouslySetInnerHTML={{ __html: question.instruction_for_matching }}
                    />
                    <div className='text-sm space-y-2'>
                      <div>
                        <p className='text-green-600 font-medium'>
                          <strong>Correct Answers:</strong>
                        </p>
                        <p className='font-mono text-sm bg-green-50 p-2 rounded mt-1'>
                          {question.correct_answer_for_matching}
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
                    <Button variant='ghost' size='sm' onClick={() => handleEdit(question)}>
                      Edit
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleDelete(question.id)}
                      disabled={isLoading.deleteQuestion}
                    >
                      {isLoading.deleteQuestion ? (
                        <span className='text-xs'>Deleting...</span>
                      ) : (
                        <Trash2 className='h-4 w-4' />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isAddingOrEditing && localQuestions.length === 0 && (
        <div className='text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg'>
          <Plus className='h-8 w-8 mx-auto mb-2 opacity-50' />
          <p>No questions created yet.</p>
          <p className='text-sm'>Add your first matching question.</p>
        </div>
      )}
    </div>
  );
}
