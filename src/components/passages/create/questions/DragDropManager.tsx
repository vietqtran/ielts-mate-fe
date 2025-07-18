'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { DragItemForm } from './DragItemForm';
import { QuestionForm } from './QuestionForm';

import { Button } from '@/components/ui/button';
import { useListeningQuestion, useQuestion } from '@/hooks';
import { toast } from 'sonner';

// Define proper type interfaces
interface DragItem {
  id?: string;
  drag_item_id?: string;
  item_id?: string;
  content: string;
  item_content?: string; // Add this for API response format
}

interface Question {
  id?: string;
  question_id?: string;
  question_order: number;
  point: number;
  explanation: string;
  instruction_for_choice?: string;
  zone_index: number;
  drag_item_id?: string | null; // Can be null for questions without assigned items
  drag_items?: DragItem[];
}

interface QuestionGroup {
  id?: string;
  section_order: number;
  section_label: string;
  instruction: string;
  question_type: string;
  questions: Question[];
  drag_items?: DragItem[];
}

interface DragDropManagerProps {
  group: QuestionGroup;
  refetchPassageData: () => void;
  onUpdateGroup: (group: QuestionGroup) => void;
  isListening?: boolean;
}

// Define form modes
type FormMode =
  | 'viewing'
  | 'creating_drag_item'
  | 'creating_question'
  | 'editing_drag_item'
  | 'editing_question';

export function DragDropManager({
  group,
  refetchPassageData,
  onUpdateGroup,
  isListening = false,
}: Readonly<DragDropManagerProps>) {
  const [formMode, setFormMode] = useState<FormMode>('viewing');
  const [localQuestions, setLocalQuestions] = useState(group.questions);
  const [localDragItems, setLocalDragItems] = useState<DragItem[]>([]);

  // Editing states
  const [editingDragItem, setEditingDragItem] = useState<DragItem | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Ref to track if we're updating from parent to avoid infinite loop
  const isUpdatingFromParent = useRef(false);
  const isInitialMount = useRef(true);
  const hasUserChanges = useRef(false); // Track if user has made actual changes
  const lastUpdateRef = useRef<{ questions: Question[]; drag_items: DragItem[] }>({
    questions: group.questions || [],
    drag_items: group.drag_items || [],
  });

  // Add a dummy state to force re-render
  const [formClosedKey, setFormClosedKey] = useState(0);

  // Stable callback for updating parent
  const updateParentGroup = useCallback(
    (updatedGroup: QuestionGroup) => {
      onUpdateGroup(updatedGroup);
    },
    [onUpdateGroup]
  );

  const questionApi = isListening ? useListeningQuestion() : useQuestion();
  const {
    createQuestions,
    updateQuestionInfo,
    deleteQuestion,
    createDragItem,
    updateDragItem,
    deleteDragItem,
    getAllDragItemsByGroup,
    isLoading,
  } = questionApi;

  // Function to fetch all drag items for a group
  const fetchAllDragItems = async (groupId: string) => {
    if (!groupId) return;
    try {
      const response = await getAllDragItemsByGroup(groupId, isListening);
      if (response?.data?.items) {
        const fetchedItems = response.data.items.map((item) => ({
          id: item.item_id,
          drag_item_id: item.item_id,
          item_id: item.item_id,
          content: item.item_content,
          item_content: item.item_content,
        }));
        setLocalDragItems(fetchedItems);
      }
    } catch (error) {
      console.error('Failed to fetch drag items:', error);
    }
  };

  // Reset local state when group changes
  useEffect(() => {
    // Skip if we're updating from parent to avoid infinite loop
    if (isUpdatingFromParent.current) {
      isUpdatingFromParent.current = false;
      return;
    }

    // Reset user changes flag when group changes
    hasUserChanges.current = false;

    const questions = group.questions || [];
    let normalizedDragItems: DragItem[] = [];

    if (group.drag_items && group.drag_items.length > 0) {
      normalizedDragItems = group.drag_items.map((item) => ({
        id: item.drag_item_id || item.id || item.item_id,
        drag_item_id: item.drag_item_id || item.id || item.item_id,
        item_id: item.drag_item_id || item.id || item.item_id,
        content: item.content || item.item_content || '',
        item_content: item.content || item.item_content || '',
      }));
    }

    const processedQuestions = questions.map((question) => {
      if (
        question.drag_item_id &&
        question.drag_item_id !== 'null' &&
        question.drag_item_id !== 'undefined'
      ) {
        const matchingItem = normalizedDragItems.find(
          (item) =>
            item.drag_item_id === question.drag_item_id ||
            item.id === question.drag_item_id ||
            item.item_id === question.drag_item_id
        );

        if (matchingItem) {
          return {
            ...question,
            drag_items: [
              {
                drag_item_id: matchingItem.drag_item_id || matchingItem.id || matchingItem.item_id,
                item_id: matchingItem.drag_item_id || matchingItem.id || matchingItem.item_id,
                content: matchingItem.content || matchingItem.item_content || '',
                item_content: matchingItem.content || matchingItem.item_content || '',
              },
            ],
          };
        }
      } else {
        return {
          ...question,
          drag_item_id: undefined,
          drag_items: [],
        };
      }
      return question;
    });

    setLocalQuestions(processedQuestions);

    // Only set localDragItems if we have data from group.drag_items
    // Otherwise, keep existing localDragItems to avoid resetting to empty array
    if (normalizedDragItems.length > 0) {
      setLocalDragItems(normalizedDragItems);
    }

    // Only fetch drag items if we don't have any local drag items yet
    // This prevents infinite loop between fetch and update
    if (group.id && localDragItems.length === 0 && normalizedDragItems.length === 0) {
      fetchAllDragItems(group.id);
    }

    // Mark initial mount as complete after first initialization
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
  }, [group.questions, group.drag_items, group.id]);

  // Reset formMode to viewing only on initial mount
  useEffect(() => {
    setFormMode('viewing');
  }, []); // Empty dependency array - only run once on mount

  // Fetch drag items on initial mount if needed
  useEffect(() => {
    if (
      group.id &&
      localDragItems.length === 0 &&
      (!group.drag_items || group.drag_items.length === 0)
    ) {
      fetchAllDragItems(group.id);
    }
  }, [group.id]); // Only depend on group.id to avoid infinite loop

  // Handle drag item creation/update success
  const handleDragItemSuccess = (dragItem: { item_id: string; content: string }) => {
    setFormMode('viewing');
    setEditingDragItem(null);
    setFormClosedKey((k) => k + 1); // force re-render
    // Fetch the latest drag items from backend after create/edit
    if (group.id && typeof group.id === 'string') {
      setTimeout(() => fetchAllDragItems(group.id as string), 0);
    }
  };

  // Handle question creation/update success
  const handleQuestionSuccess = (question: {
    id: string;
    question_order: number;
    point: number;
    explanation: string;
    zone_index: number;
    drag_item_id?: string;
    drag_items?: Array<{
      drag_item_id: string;
      content: string;
    }>;
  }) => {
    // Don't mark as user changes since this is handled by individual API calls
    // hasUserChanges.current = true; // Mark that user has made changes

    if (editingQuestion) {
      // Update existing question
      setLocalQuestions((prev) =>
        prev.map((q) =>
          q.id === editingQuestion.id || q.question_id === editingQuestion.id
            ? {
                ...q,
                question_order: question.question_order,
                point: question.point,
                explanation: question.explanation,
                zone_index: question.zone_index,
                drag_item_id: question.drag_item_id,
                drag_items: question.drag_items || [],
              }
            : q
        )
      );
      setEditingQuestion(null);
    } else {
      // Add new question
      setLocalQuestions((prev) => [
        ...prev,
        {
          id: question.id,
          question_id: question.id,
          question_order: question.question_order,
          point: question.point,
          explanation: question.explanation,
          zone_index: question.zone_index,
          drag_item_id: question.drag_item_id,
          drag_items: question.drag_items || [],
        },
      ]);
    }

    setFormMode('viewing');
  };

  // Update parent component whenever local state changes
  useEffect(() => {
    // Skip initial mount to avoid unnecessary API calls
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Only update parent when in viewing mode and user has made actual changes
    if (formMode === 'viewing' && hasUserChanges.current) {
      // Check if there are actual changes to avoid unnecessary updates
      const currentState = { questions: localQuestions, drag_items: localDragItems };
      const lastState = lastUpdateRef.current;

      const hasChanges =
        JSON.stringify(currentState.questions) !== JSON.stringify(lastState.questions) ||
        JSON.stringify(currentState.drag_items) !== JSON.stringify(lastState.drag_items);

      if (hasChanges) {
        isUpdatingFromParent.current = true;
        lastUpdateRef.current = currentState;

        const updatedGroup = {
          id: group.id,
          section_order: group.section_order,
          section_label: group.section_label,
          instruction: group.instruction,
          question_type: group.question_type,
          questions: localQuestions,
          drag_items: localDragItems,
        };
        updateParentGroup(updatedGroup);
      }
    }
  }, [
    localQuestions,
    localDragItems,
    formMode,
    updateParentGroup,
    group.id,
    group.section_order,
    group.section_label,
    group.instruction,
    group.question_type,
  ]);

  // Handle drag item deletion
  const handleDeleteDragItem = async (itemId: string) => {
    if (!group.id) {
      toast.error('Group ID is required');
      return;
    }

    try {
      await deleteDragItem(group.id, itemId);
      // Only mark as user changes for deletion since we need to update group state
      hasUserChanges.current = true;
      setLocalDragItems((prev) => prev.filter((item) => item.item_id !== itemId));
      toast.success('Drag item deleted successfully');
    } catch (error) {
      toast.error('Failed to delete drag item');
    }
  };

  // Handle question deletion
  const handleDeleteQuestion = async (questionId: string) => {
    if (!group.id) {
      toast.error('Group ID is required');
      return;
    }

    try {
      await deleteQuestion(group.id, questionId);
      // Only mark as user changes for deletion since we need to update group state
      hasUserChanges.current = true;
      setLocalQuestions((prev) =>
        prev.filter((q) => q.id !== questionId && q.question_id !== questionId)
      );
      toast.success('Question deleted successfully');
    } catch (error) {
      toast.error('Failed to delete question');
    }
  };

  // Start creating drag item
  const startCreatingDragItem = () => {
    setFormMode('creating_drag_item');
    setEditingDragItem(null);
  };

  // Start creating question
  const startCreatingQuestion = () => {
    setFormMode('creating_question');
    setEditingQuestion(null);
  };

  // Start editing drag item
  const startEditingDragItem = (dragItem: DragItem) => {
    setEditingDragItem(dragItem);
    setFormMode('editing_drag_item');
  };

  // Start editing question
  const startEditingQuestion = (question: Question) => {
    setEditingQuestion(question);
    setFormMode('editing_question');
  };

  // Cancel form
  const cancelForm = () => {
    setFormMode('viewing');
    setEditingDragItem(null);
    setEditingQuestion(null);
  };

  // Render form based on mode
  if (formMode === 'creating_drag_item' || formMode === 'editing_drag_item') {
    return (
      <DragItemForm
        key={formClosedKey}
        groupId={group.id || ''}
        onSuccess={handleDragItemSuccess}
        onCancel={cancelForm}
        initialData={editingDragItem ? { content: editingDragItem.content } : undefined}
        isEditing={formMode === 'editing_drag_item'}
        itemId={editingDragItem?.item_id}
        isListening={isListening}
      />
    );
  }

  if (formMode === 'creating_question' || formMode === 'editing_question') {
    return (
      <QuestionForm
        groupId={group.id || ''}
        onSuccess={handleQuestionSuccess}
        onCancel={cancelForm}
        dragItems={localDragItems.map((item) => ({
          item_id: item.item_id || item.id || '',
          content: item.content || item.item_content || '',
        }))}
        existingQuestions={localQuestions.map((q) => ({
          question_order: q.question_order,
          zone_index: q.zone_index,
        }))}
        initialData={
          editingQuestion
            ? {
                question_order: editingQuestion.question_order,
                point: editingQuestion.point,
                explanation: editingQuestion.explanation,
                zone_index: editingQuestion.zone_index,
                drag_item_id: editingQuestion.drag_item_id || '',
              }
            : undefined
        }
        isEditing={formMode === 'editing_question'}
        questionId={editingQuestion?.id || editingQuestion?.question_id}
      />
    );
  }

  // Main view
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h3 className='font-semibold'>Drag & Drop Configuration</h3>
        <div className='flex gap-2'>
          <Button onClick={startCreatingDragItem} variant='outline' className='gap-2'>
            <Plus className='h-4 w-4' />
            Add Drag Item
          </Button>
          <Button onClick={startCreatingQuestion} variant='outline' className='gap-2'>
            <Plus className='h-4 w-4' />
            Add Question
          </Button>
        </div>
      </div>

      {localQuestions.length === 0 && localDragItems?.length === 0 ? (
        <div className='text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg'>
          <Plus className='h-8 w-8 mx-auto mb-2 opacity-50' />
          <p>No Drag & Drop configuration set up yet.</p>
          <p className='text-sm'>Click "Add Drag Item" or "Add Question" to start.</p>
        </div>
      ) : (
        <div className='grid grid-cols-2 gap-6'>
          {/* Drag Items Section */}
          <Card>
            <CardHeader>
              <CardTitle>Drag Items ({localDragItems?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {localDragItems?.length > 0 ? (
                <div className='space-y-3'>
                  {localDragItems.map((item, index) => (
                    <div
                      key={item.item_id || index}
                      className='flex items-center justify-between p-3 border rounded-lg'
                    >
                      <div className='flex-1'>
                        <p className='font-medium'>{item.content || item.item_content}</p>
                        <p className='text-xs text-muted-foreground'>
                          ID: {item.item_id || item.id}
                        </p>
                      </div>
                      <div className='flex gap-2'>
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={() => startEditingDragItem(item)}
                        >
                          <Edit className='h-4 w-4' />
                        </Button>
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          onClick={() => handleDeleteDragItem(item.item_id || item.id || '')}
                          disabled={isLoading.deleteDragItem}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-muted-foreground italic'>No drag items created yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Questions Section */}
          <Card>
            <CardHeader>
              <CardTitle>Questions ({localQuestions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {localQuestions.length > 0 ? (
                <div className='space-y-3'>
                  {localQuestions.map((question, index) => {
                    // Get drag item content from question's drag_items array first
                    let dragItemContent = null;
                    if (question.drag_items && question.drag_items.length > 0) {
                      dragItemContent = question.drag_items[0].content;
                    } else {
                      // Fallback to searching in localDragItems
                      const dragItem = localDragItems.find(
                        (item) =>
                          item.item_id === question.drag_item_id ||
                          item.id === question.drag_item_id
                      );
                      dragItemContent = dragItem ? dragItem.content : null;
                    }

                    return (
                      <div
                        key={question.id || question.question_id || index}
                        className='p-3 border rounded-lg'
                      >
                        <div className='flex items-center justify-between mb-2'>
                          <h4 className='font-medium'>
                            Q{question.question_order} (Zone {question.zone_index})
                          </h4>
                          <div className='flex gap-2'>
                            <Button
                              type='button'
                              variant='outline'
                              size='sm'
                              onClick={() => startEditingQuestion(question)}
                            >
                              <Edit className='h-4 w-4' />
                            </Button>
                            <Button
                              type='button'
                              variant='ghost'
                              size='sm'
                              onClick={() =>
                                handleDeleteQuestion(question.id || question.question_id || '')
                              }
                              disabled={isLoading.deleteQuestion}
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </div>
                        </div>
                        <div className='space-y-1 text-sm'>
                          <p>
                            <span className='font-medium'>Points:</span> {question.point}
                          </p>
                          <p>
                            <span className='font-medium'>Drag Item:</span>{' '}
                            {dragItemContent || 'None assigned'}
                          </p>
                          <p>
                            <span className='font-medium'>Explanation:</span> {question.explanation}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className='text-muted-foreground italic'>No questions created yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
