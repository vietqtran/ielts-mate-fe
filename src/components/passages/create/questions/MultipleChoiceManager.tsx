'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { MultipleChoiceForm, QuestionFormData } from './MultipleChoiceForm';

import { Button } from '@/components/ui/button';
import { useQuestion } from '@/hooks/useQuestion';
import { useState } from 'react';

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
  refetchPassageData: () => void;
}

export function MultipleChoiceManager({
  group,
  refetchPassageData,
}: Readonly<MultipleChoiceManagerProps>) {
  const [isAddingOrEditing, setIsAddingOrEditing] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);

  const {
    createQuestions,
    updateQuestionInfo,
    deleteQuestion,
    createChoice,
    updateChoice,
    deleteChoice,
    getChoicesByQuestionId,
    isLoading,
  } = useQuestion();

  const handleFormSubmit = async (data: QuestionFormData) => {
    if (!group.id) {
      console.error('Group ID is required');
      return;
    }

    try {
      if (editingQuestion) {
        const questionId = editingQuestion.question_id;

        // 1. Update main question info (number_of_correct_answers, etc.) FIRST
        const questionInfoRequest = {
          question_order: data.question_order,
          point: data.point,
          explanation: data.explanation,
          number_of_correct_answers: data.number_of_correct_answers,
          instruction_for_choice: data.instruction_for_choice,
        };
        await updateQuestionInfo(group.id, questionId, questionInfoRequest);

        // 2. Sequentially process choice changes to avoid race conditions
        const originalChoices = editingQuestion.choices || [];
        const submittedChoices = data.choices;

        // Step 2a: Handle deletions
        const choicesToDelete = originalChoices.filter(
          (orig: any) => !submittedChoices.some((sub: any) => sub.id === orig.choice_id)
        );
        if (choicesToDelete.length > 0) {
          const deletePromises = choicesToDelete.map((choice: any) =>
            deleteChoice(questionId, choice.choice_id)
          );
          await Promise.all(deletePromises);
        }

        // Step 2b: Handle updates - BATCH 1: Unset previously correct answers
        const unsetCorrectPromises = submittedChoices
          .filter((sub: any) => {
            const original = originalChoices.find((o: any) => o.choice_id === sub.id);
            return original && original.is_correct && !sub.is_correct;
          })
          .map((choice: any) => {
            const { id, ...updateData } = choice; // Clean data for update
            return updateChoice(questionId, choice.id, updateData);
          });

        if (unsetCorrectPromises.length > 0) {
          await Promise.all(unsetCorrectPromises);
        }

        // Step 2c: Handle updates - BATCH 2: Set new correct answers and update content
        const otherUpdatePromises = submittedChoices
          .filter((sub: any) => {
            const original = originalChoices.find((o: any) => o.choice_id === sub.id);
            if (!original) return false;
            if (original.is_correct && !sub.is_correct) return false;
            return (
              original.is_correct !== sub.is_correct ||
              original.label !== sub.label ||
              original.content !== sub.content ||
              original.choice_order !== sub.choice_order
            );
          })
          .map((choice: any) => {
            const { id, ...updateData } = choice; // Clean data for update
            return updateChoice(questionId, choice.id, updateData);
          });

        if (otherUpdatePromises.length > 0) {
          await Promise.all(otherUpdatePromises);
        }

        // Step 2d: Handle creations
        const choicesToCreate = submittedChoices.filter((sub: any) => !sub.id);
        if (choicesToCreate.length > 0) {
          const createPromises = choicesToCreate.map((choice: any) => {
            const { id, ...creationData } = choice; // Ensure no client-side ID is sent
            return createChoice(questionId, creationData);
          });
          await Promise.all(createPromises);
        }

        // 3. Refetch choices to get the final state
        const updatedChoicesResponse = await getChoicesByQuestionId(questionId);

        // 4. Construct the final, authoritative question object
        const finalUpdatedQuestion = {
          question_id: questionId,
          question_group_id: editingQuestion.question_group_id,
          question_type: editingQuestion.question_type,
          question_categories: editingQuestion.question_categories,
          question_order: data.question_order,
          point: data.point,
          explanation: data.explanation,
          number_of_correct_answers: data.number_of_correct_answers,
          instruction_for_choice: data.instruction_for_choice,
          choices: updatedChoicesResponse.data,
        };

        // 5. Update local state
        const updatedQuestions = group.questions.map((q: any) =>
          q.question_id === questionId ? finalUpdatedQuestion : q
        );
        refetchPassageData();
      } else {
        // Create new question with choices
        const questionRequest = {
          question_group_id: group.id,
          question_categories: [],
          question_order: data.question_order,
          point: data.point,
          question_type: 0, // MULTIPLE_CHOICE
          explanation: data.explanation,
          number_of_correct_answers: data.number_of_correct_answers,
          instruction_for_choice: data.instruction_for_choice,
          choices: data.choices.map(({ id, ...rest }) => rest), // Ensure no client-side IDs
        };
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
      refetchPassageData();
    } catch (error) {
      console.error('Failed to delete question:', error);
    }
  };

  const handleCancel = () => {
    setIsAddingOrEditing(false);
    setEditingQuestion(null);
  };

  const defaultInitialData = {
    question_order: group.questions.length + 1,
    point: 1,
    explanation: '',
    instruction_for_choice: '',
    number_of_correct_answers: 1,
    choices: [
      { label: 'A', content: '', choice_order: 1, is_correct: false },
      { label: 'B', content: '', choice_order: 2, is_correct: false },
    ],
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h3 className='font-semibold'>Multiple Choice Questions ({group.questions.length})</h3>
        <Button onClick={() => setIsAddingOrEditing(true)} className='gap-2'>
          <Plus className='h-4 w-4' />
          Add Question
        </Button>
      </div>

      {isAddingOrEditing && (
        <MultipleChoiceForm
          initialData={
            editingQuestion
              ? {
                  ...editingQuestion,
                  id: editingQuestion.question_id,
                  choices: editingQuestion.choices.map((c: any) => ({ ...c, id: c.choice_id })),
                }
              : defaultInitialData
          }
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
          isSubmitting={
            isLoading.createQuestions ||
            isLoading.updateQuestionInfo ||
            isLoading.createChoice ||
            isLoading.updateChoice ||
            isLoading.deleteChoice
          }
        />
      )}

      {/* Questions List */}
      {!isAddingOrEditing && group.questions.length > 0 && (
        <div className='space-y-4 mt-4'>
          <h4 className='font-medium'>Questions:</h4>
          {group.questions.map((question) => (
            <Card key={question.question_id}>
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
                      {question.choices?.map((choice: any) => (
                        <div
                          key={choice.choice_id}
                          className={`flex items-center gap-2 text-sm ${
                            choice.is_correct ? 'text-green-600 font-medium' : ''
                          }`}
                        >
                          <span className='font-mono'>{choice.label}.</span>
                          <span>{choice.content}</span>
                          {choice.is_correct && <span className='text-green-600'>✓</span>}
                        </div>
                      ))}
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

      {!isAddingOrEditing && group.questions.length === 0 && (
        <div className='text-center py-8 text-muted-foreground'>
          <Plus className='h-8 w-8 mx-auto mb-2 opacity-50' />
          <p>No questions created yet.</p>
          <p className='text-sm'>Add your first multiple choice question.</p>
        </div>
      )}
    </div>
  );
}
