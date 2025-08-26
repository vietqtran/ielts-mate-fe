'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MultipleChoiceForm, QuestionFormData } from './MultipleChoiceForm';

import { Button } from '@/components/ui/button';
import { useListeningQuestion } from '@/hooks';
import { useQuestion } from '@/hooks/apis/admin/useQuestion';

interface QuestionGroup {
  id?: string;
  section_order: number;
  section_label: string;
  instruction: string;
  question_type: number; // QuestionTypeEnumIndex
  questions: any[];
}

interface MultipleChoiceManagerProps {
  group: QuestionGroup;
  onUpdateGroup: (group: QuestionGroup) => void;
  refetchPassageData: () => void;
  isListening?: boolean;
}

export function MultipleChoiceManager({
  group,
  onUpdateGroup,
  refetchPassageData,
  isListening = false,
}: Readonly<MultipleChoiceManagerProps>) {
  const [isAddingOrEditing, setIsAddingOrEditing] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const [localQuestions, setLocalQuestions] = useState(group.questions);

  // Reset local state when group ID changes (indicating a new passage is being created)
  useEffect(() => {
    setLocalQuestions(group.questions);
    setIsAddingOrEditing(false);
    setEditingQuestion(null);
  }, [group.questions, group.id]);

  const questionApi = isListening ? useListeningQuestion() : useQuestion();
  const {
    createQuestions,
    updateQuestionInfo,
    updateQuestionOrder,
    deleteQuestion,
    createChoice,
    updateChoice,
    deleteChoice,
    getChoicesByQuestionId,
    isLoading,
  } = questionApi;

  const handleFormSubmit = async (data: QuestionFormData) => {
    if (!group.id) {
      return;
    }

    try {
      if (editingQuestion) {
        const questionId = editingQuestion.question_id;

        // 1. Update question order separately using the dedicated order endpoint
        if (data.question_order !== editingQuestion.question_order) {
          await updateQuestionOrder(
            group.id,
            questionId,
            { order: data.question_order },
            isListening
          );
          // Refetch passage data to get updated question order
          refetchPassageData();

          // Early return after order update to avoid duplicate processing
          setEditingQuestion(null);
          setIsAddingOrEditing(false);
          return;
        }

        // 2. Sequentially process updates according to required logic:
        // Step 1: Update question with number of correct answers from form
        const originalChoices = editingQuestion.choices || [];
        const submittedChoices = data.choices;

        // Step 1: First update - set number_of_correct_answers to total number of choices
        // This ensures database has enough capacity for all choices before we create/update them
        const totalChoicesCount = submittedChoices.length;
        const firstUpdateRequest = {
          explanation: data.explanation,
          point: data.point,
          question_categories: editingQuestion.question_categories || [],
          number_of_correct_answers: totalChoicesCount, // Set to total choices first
          instruction_for_choice: data.instruction_for_choice,
          blank_index: undefined, // Not applicable for multiple choice
          correct_answer: undefined, // Not applicable for multiple choice
          instruction_for_matching: undefined, // Not applicable for multiple choice
          correct_answer_for_matching: undefined, // Not applicable for multiple choice
          zone_index: undefined, // Not applicable for multiple choice
          drag_item_id: undefined, // Not applicable for multiple choice
        };
        await updateQuestionInfo(group.id, questionId, firstUpdateRequest, isListening);

        // Separate existing choices from new choices
        const existingChoices = submittedChoices.filter((sub: any) => sub.id);
        const newChoices = submittedChoices.filter((sub: any) => !sub.id);

        // Step 2a: Handle deletions first
        const choicesToDelete = originalChoices.filter(
          (orig: any) => !existingChoices.some((sub: any) => sub.id === orig.choice_id)
        );
        if (choicesToDelete.length > 0) {
          const deletePromises = choicesToDelete.map((choice: any) =>
            deleteChoice(questionId, choice.choice_id, isListening)
          );
          await Promise.all(deletePromises);
        }

        // Step 2b: Create new choices first (so they have IDs for subsequent updates)
        if (newChoices.length > 0) {
          const createPromises = newChoices.map((choice: any) => {
            const { id, ...creationData } = choice; // Ensure no client-side ID is sent
            return createChoice(questionId, creationData, isListening);
          });
          await Promise.all(createPromises);
        }

        // Step 2c: Refetch choices to get the updated list with new IDs
        const updatedChoicesAfterCreation = await getChoicesByQuestionId(questionId, isListening);
        const allCurrentChoices = updatedChoicesAfterCreation.data || [];

        // Step 2d: Unset all previously correct answers (set is_correct = false for unchecked choices)
        const unsetCorrectPromises = existingChoices
          .filter((sub: any) => {
            const original = originalChoices.find((o: any) => o.choice_id === sub.id);
            return original && original.is_correct && !sub.is_correct;
          })
          .map((choice: any) => {
            const { id, ...updateData } = choice;
            return updateChoice(
              questionId,
              choice.id,
              { ...updateData, is_correct: false },
              isListening
            );
          });

        if (unsetCorrectPromises.length > 0) {
          await Promise.all(unsetCorrectPromises);
        }

        // Step 2e: Set new correct answers (set is_correct = true for checked choices)
        const setCorrectPromises = existingChoices
          .filter((sub: any) => {
            const original = originalChoices.find((o: any) => o.choice_id === sub.id);
            return sub.is_correct && (!original || !original.is_correct);
          })
          .map((choice: any) => {
            const { id, ...updateData } = choice;
            return updateChoice(
              questionId,
              choice.id,
              { ...updateData, is_correct: true },
              isListening
            );
          });

        if (setCorrectPromises.length > 0) {
          await Promise.all(setCorrectPromises);
        }

        // Step 2f: Update other properties (content, label, choice_order) for existing choices
        const otherUpdatePromises = existingChoices
          .filter((sub: any) => {
            const original = originalChoices.find((o: any) => o.choice_id === sub.id);
            if (!original) return false;
            // Only update if content, label, or choice_order changed
            return (
              original.label !== sub.label ||
              original.content !== sub.content ||
              original.choice_order !== sub.choice_order
            );
          })
          .map((choice: any) => {
            const { id, ...updateData } = choice;
            return updateChoice(questionId, choice.id, updateData, isListening);
          });

        if (otherUpdatePromises.length > 0) {
          await Promise.all(otherUpdatePromises);
        }

        // Step 3: Refetch choices to get the final state
        const updatedChoicesResponse = await getChoicesByQuestionId(questionId, isListening);
        const finalChoices = updatedChoicesResponse.data || [];

        // Step 4: Second update - set number_of_correct_answers to actual correct choices count
        const finalCorrectCount = finalChoices.filter((choice: any) => choice.is_correct).length;

        // Second update to question info with actual correct count
        const secondUpdateRequest = {
          explanation: data.explanation,
          point: data.point,
          question_categories: editingQuestion.question_categories || [],
          number_of_correct_answers: finalCorrectCount, // Set to actual correct choices count
          instruction_for_choice: data.instruction_for_choice,
          blank_index: undefined, // Not applicable for multiple choice
          correct_answer: undefined, // Not applicable for multiple choice
          instruction_for_matching: undefined, // Not applicable for multiple choice
          correct_answer_for_matching: undefined, // Not applicable for multiple choice
          zone_index: undefined, // Not applicable for multiple choice
          drag_item_id: undefined, // Not applicable for multiple choice
        };
        await updateQuestionInfo(group.id, questionId, secondUpdateRequest, isListening);

        // Step 5: Construct the final, authoritative question object
        const finalUpdatedQuestion = {
          question_id: questionId,
          question_group_id: editingQuestion.question_group_id,
          question_type: editingQuestion.question_type,
          question_categories: editingQuestion.question_categories,
          question_order: data.question_order,
          point: data.point,
          explanation: data.explanation,
          number_of_correct_answers: data.number_of_correct_answers, // Use form value, not calculated
          instruction_for_choice: data.instruction_for_choice,
          // Ensure choices have consistent structure with choice_id property
          choices: finalChoices.map((choice: any) => ({
            ...choice,
            choice_id: choice.choice_id || choice.id,
            is_correct: !!choice.is_correct, // Ensure boolean type
          })),
        };

        // 5. Update local state and propagate changes to parent
        const updatedQuestions = localQuestions.map((q: any) =>
          q.question_id === questionId ? finalUpdatedQuestion : q
        );
        setLocalQuestions(updatedQuestions);

        // Notify parent component to update its state for preview
        onUpdateGroup({
          ...group,
          questions: updatedQuestions,
        });

        // Refetch passage data to ensure all data is in sync after complex update
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
        const response = await createQuestions(group.id, [questionRequest], isListening);

        if (response.data && Array.isArray(response.data)) {
          const newQuestions = response.data;
          const updatedQuestions = [...localQuestions, ...newQuestions];
          setLocalQuestions(updatedQuestions);

          // Notify parent component to update its state for preview
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
      await deleteQuestion(group.id, questionId, isListening);
      const updatedQuestions = localQuestions.filter((q) => q.question_id !== questionId);
      setLocalQuestions(updatedQuestions);

      // Notify parent component to update its state for preview
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
    question_order:
      localQuestions.length > 0
        ? Math.max(...localQuestions.map((q: any) => q.question_order)) + 1
        : 1,
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
        <h3 className='font-semibold'>Multiple Choice Questions ({localQuestions.length})</h3>
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
                  choices: (editingQuestion.choices || []).map((c: any) => ({
                    ...c,
                    id: c.choice_id,
                  })),
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
          isEditing={!!editingQuestion}
          isListening={isListening}
        />
      )}

      {/* Questions List */}
      {!isAddingOrEditing && localQuestions.length > 0 && (
        <div className='space-y-4 mt-4'>
          <h4 className='font-medium'>Questions:</h4>
          {localQuestions.map((question, i) => (
            <Card key={question.question_id + i}>
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

      {!isAddingOrEditing && localQuestions.length === 0 && (
        <div className='text-center py-8 text-muted-foreground'>
          <Plus className='h-8 w-8 mx-auto mb-2 opacity-50' />
          <p>No questions created yet.</p>
          <p className='text-sm'>Add your first multiple choice question.</p>
        </div>
      )}
    </div>
  );
}
