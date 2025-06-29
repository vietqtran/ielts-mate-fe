'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FillInBlanksForm, FillInBlanksFormData } from './FillInBlanksForm';

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

interface FillInBlanksManagerProps {
  group: QuestionGroup;
  refetchPassageData: () => void;
  onUpdateGroup: (group: QuestionGroup) => void;
}

export function FillInBlanksManager({
  group,
  refetchPassageData,
  onUpdateGroup,
}: Readonly<FillInBlanksManagerProps>) {
  const [isAddingOrEditing, setIsAddingOrEditing] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const [localQuestions, setLocalQuestions] = useState(group.questions);

  // Reset local state when group ID changes (indicating a new passage is being created)
  useEffect(() => {
    setLocalQuestions(group.questions);
    setIsAddingOrEditing(false);
    setEditingQuestion(null);
  }, [group.questions, group.id]);

  const { createQuestions, updateQuestionInfo, deleteQuestion, isLoading } = useQuestion();

  const handleFormSubmit = async (data: FillInBlanksFormData) => {
    if (!group.id) {
      return;
    }

    const questionRequest = {
      ...data,
      question_type: 1, // FILL_IN_THE_BLANKS
      question_group_id: group.id,
      question_categories: [],
      number_of_correct_answers: 0, // Not applicable
    };

    try {
      if (editingQuestion) {
        // Update existing question
        const response = await updateQuestionInfo(
          group.id,
          editingQuestion.question_id,
          questionRequest
        );
        if (response.data) {
          // Ensure we have the right ID field
          const updatedQuestion = {
            ...response.data,
            question_id: response.data.question_id,
          };

          // Update local state
          const updatedQuestions = localQuestions.map((q) =>
            q.question_id === editingQuestion.question_id ? updatedQuestion : q
          );
          setLocalQuestions(updatedQuestions);

          // Propagate changes to parent component for preview
          onUpdateGroup({
            ...group,
            questions: updatedQuestions,
          });
        } else {
          refetchPassageData();
        }
      } else {
        // Create new question
        const response = await createQuestions(group.id, [questionRequest]);
        if (response.data && Array.isArray(response.data)) {
          // Ensure consistent structure with question_id field
          const newQuestions = response.data.map((q) => ({
            ...q,
            question_id: q.question_id,
          }));

          // Update local state
          const updatedQuestions = [...localQuestions, ...newQuestions];
          setLocalQuestions(updatedQuestions);

          // Propagate changes to parent component for preview
          onUpdateGroup({
            ...group,
            questions: updatedQuestions,
          });
        } else {
          refetchPassageData();
        }
      }
      setIsAddingOrEditing(false);
      setEditingQuestion(null);
    } catch (error) {}
  };

  const handleEdit = (question: any) => {
    setEditingQuestion(question);
    setIsAddingOrEditing(true);
  };

  const handleDelete = async (questionId: string) => {
    if (!group.id) {
      return;
    }
    try {
      await deleteQuestion(group.id, questionId);
      const updatedQuestions = localQuestions.filter((q) => q.question_id !== questionId);
      setLocalQuestions(updatedQuestions);

      // Propagate changes to parent component for preview
      onUpdateGroup({
        ...group,
        questions: updatedQuestions,
      });
    } catch (error) {}
  };

  const handleCancel = () => {
    setIsAddingOrEditing(false);
    setEditingQuestion(null);
  };

  const defaultInitialData = {
    question_order: localQuestions.length + 1,
    point: 1,
    explanation: '',
    blank_index: localQuestions.length + 1,
    correct_answer: '',
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h3 className='font-semibold'>Fill in the Blanks Questions ({localQuestions.length})</h3>
        <Button onClick={() => setIsAddingOrEditing(true)} className='gap-2'>
          <Plus className='h-4 w-4' />
          Add Question
        </Button>
      </div>

      {isAddingOrEditing && (
        <FillInBlanksForm
          initialData={editingQuestion || defaultInitialData}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
          isSubmitting={isLoading.createQuestions || isLoading.updateQuestionInfo}
        />
      )}

      {/* Questions List */}
      {!isAddingOrEditing && localQuestions.length > 0 && (
        <div className='space-y-4 mt-4'>
          <h4 className='font-medium'>Questions:</h4>
          {localQuestions.map((question, index) => (
            <Card key={question.question_id}>
              <CardContent className='pt-4'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-2'>
                      <span className='font-semibold'>Q{question.question_order}</span>
                      <span className='text-sm text-muted-foreground'>
                        (Blank {question.blank_index}, {question.point} point
                        {question.point !== 1 ? 's' : ''})
                      </span>
                    </div>
                    <div className='text-sm'>
                      <p className='text-green-600 font-medium'>
                        <strong>Answer:</strong> {question.correct_answer}
                      </p>
                      {question.explanation && (
                        <p className='text-muted-foreground mt-1'>
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
                      onClick={() => handleDelete(question.question_id)}
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
          <p className='text-sm'>Add your first fill-in-the-blanks question.</p>
        </div>
      )}
    </div>
  );
}
