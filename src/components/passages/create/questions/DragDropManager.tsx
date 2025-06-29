'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { DragDropForm, DragDropFormData } from './DragDropForm';

import { Button } from '@/components/ui/button';
import { useQuestion } from '@/hooks/useQuestion';

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
}

export function DragDropManager({
  group,
  refetchPassageData,
  onUpdateGroup,
}: Readonly<DragDropManagerProps>) {
  const [isEditing, setIsEditing] = useState(false);
  const [localQuestions, setLocalQuestions] = useState(group.questions);
  const [localDragItems, setLocalDragItems] = useState<DragItem[]>([]);

  // Debug helper to analyze associations between questions and drag items
  const debugAssociations = (questions: Question[], dragItems: DragItem[]) => {
    // Check each question's association
    questions.forEach((q, index) => {
      const itemId = q.drag_item_id;
      const foundItem = itemId
        ? dragItems.find(
            (item) => item.drag_item_id === itemId || item.id === itemId || item.item_id === itemId
          )
        : null;
    });
  };

  // Function to fetch all drag items for a group
  const fetchAllDragItems = async (groupId: string) => {
    if (!groupId) return;

    try {
      const response = await getAllDragItemsByGroup(groupId);
      if (response?.data?.items) {
        // From the API response example:
        // "items": [{"item_id": "...", "item_content": "..."}]
        const fetchedItems = response.data.items.map((item) => ({
          // Store all possible ID forms to ensure compatibility
          id: item.item_id,
          drag_item_id: item.item_id,
          item_id: item.item_id,
          // Map item_content to content for consistency
          content: item.item_content,
          item_content: item.item_content,
        }));

        setLocalDragItems(fetchedItems);

        // Debug associations after fetching
        debugAssociations(localQuestions, fetchedItems);
      }
    } catch (error) {}
  };

  // Reset local state when group changes (indicating a new passage is being created or updated)
  useEffect(() => {
    // Process questions first
    const questions = group.questions || [];

    // Create a standardized collection of drag items from all sources
    let normalizedDragItems: DragItem[] = [];

    // 1. Add items from group.drag_items if present
    if (group.drag_items && group.drag_items.length > 0) {
      // From the API response example:
      // "drag_items": [{"drag_item_id": "...", "content": "..."}]
      normalizedDragItems = group.drag_items.map((item) => ({
        id: item.drag_item_id || item.id || item.item_id,
        drag_item_id: item.drag_item_id || item.id || item.item_id,
        item_id: item.drag_item_id || item.id || item.item_id,
        // Ensure we handle both content formats
        content: item.content || item.item_content || '',
        item_content: item.content || item.item_content || '',
      }));
    }

    // 2. Associate drag items with questions if they have drag_item_id
    const processedQuestions = questions.map((question) => {
      // Check if question has a valid drag_item_id (not null or undefined)
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
        // Explicitly handle null drag_item_id by ensuring drag_items is empty
        return {
          ...question,
          drag_item_id: undefined, // Use undefined instead of null for TypeScript compatibility
          drag_items: [],
        };
      }
      return question;
    });

    // Log important debug information about the initial state
    setLocalQuestions(processedQuestions);
    setLocalDragItems(normalizedDragItems);
    setIsEditing(false);

    // Debug associations
    debugAssociations(processedQuestions, normalizedDragItems);

    // Always fetch all items from the API to ensure we have complete data
    if (group.id) {
      fetchAllDragItems(group.id);
    }
  }, [group.questions, group.drag_items, group.id]);
  const {
    createQuestions,
    updateQuestionInfo,
    deleteQuestion,
    createDragItem,
    updateDragItem,
    deleteDragItem,
    getAllDragItemsByGroup, // This gets items with format {item_id, item_content}
    isLoading,
  } = useQuestion();

  // Function to update a single question
  const handleUpdateQuestion = async (questionId: string, questionData: any): Promise<boolean> => {
    if (!group.id || !questionId) {
      return false;
    }

    try {
      // Convert empty string drag_item_id to undefined for API
      const apiDragItemId =
        questionData.drag_item_id === '' ? undefined : questionData.drag_item_id;

      const result = await updateQuestionInfo(group.id, questionId, {
        explanation: questionData.explanation,
        point: questionData.point,
        question_categories: [],
        zone_index: questionData.zone_index,
        drag_item_id: apiDragItemId,
      });

      if (result?.data) {
        // Update the local questions state
        setLocalQuestions((prev) =>
          prev.map((q) =>
            q.id === questionId || q.question_id === questionId
              ? {
                  ...q,
                  explanation: questionData.explanation,
                  point: questionData.point,
                  zone_index: questionData.zone_index,
                  drag_item_id: questionData.drag_item_id,
                }
              : q
          )
        );
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const handleSubmit = async (data: DragDropFormData) => {
    if (!group.id) {
      return;
    }

    const groupId = group.id;

    try {
      // 1. Identify changes to questions
      const newQuestions = data.questions.filter((q) => !q.id);
      const existingQuestions = data.questions.filter((q) => q.id);
      const deletedQuestionIds = localQuestions
        .filter((orig) => !data.questions.some((q) => q.id === orig.id))
        .map((q) => q.id)
        .filter(Boolean) as string[];

      // 2. Create new questions
      let createdQuestions: any[] = [];
      if (newQuestions.length > 0) {
        const newQuestionRequests = newQuestions.map((q) => {
          // Convert empty string drag_item_id to undefined for API
          const apiDragItemId = q.drag_item_id === '' ? undefined : q.drag_item_id;

          return {
            ...q,
            question_type: 3, // DRAG_AND_DROP
            question_group_id: groupId,
            question_categories: [],
            number_of_correct_answers: 0,
            drag_item_id: apiDragItemId,
            ...(q.instruction_for_choice
              ? { instruction_for_choice: q.instruction_for_choice }
              : {}),
          };
        });

        const result = await createQuestions(groupId, newQuestionRequests);
        createdQuestions = Array.isArray(result.data) ? result.data : [result.data];
      }

      // 3. Update existing questions individually
      for (const question of existingQuestions) {
        if (question.id) {
          await handleUpdateQuestion(question.id, question);
        }
      }

      // 4. Delete questions
      for (const id of deletedQuestionIds) {
        await deleteQuestion(groupId, id);
      }

      // 5. Map created questions to our format
      const mappedNewQuestions = createdQuestions.map((q) => ({
        id: q.question_id,
        question_id: q.question_id,
        question_order: q.question_order,
        point: q.point,
        explanation: q.explanation,
        instruction_for_choice: q.instruction_for_choice,
        zone_index: q.zone_index,
        drag_item_id: q.drag_item_id,
        drag_items:
          q.drag_items && q.drag_items.length > 0
            ? q.drag_items.map((item: any) => ({
                drag_item_id: item.drag_item_id,
                item_id: item.drag_item_id,
                content: item.content || item.item_content || '',
              }))
            : [],
      }));

      // 7. Create initial updated questions
      let updatedQuestions = [
        ...localQuestions.filter((q) => !deletedQuestionIds.includes(q.id as string)),
        ...mappedNewQuestions,
      ];

      // 6. Refetch all drag items to ensure data consistency and re-associate
      if (group.id) {
        await fetchAllDragItems(group.id);

        // Re-associate drag items with questions after fetching
        updatedQuestions = updatedQuestions.map((question) => {
          // Only try to associate if drag_item_id exists and is not null or undefined
          if (
            question.drag_item_id &&
            question.drag_item_id !== 'null' &&
            question.drag_item_id !== 'undefined'
          ) {
            const matchingItem = localDragItems.find(
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
                    drag_item_id:
                      matchingItem.drag_item_id || matchingItem.id || matchingItem.item_id,
                    item_id: matchingItem.drag_item_id || matchingItem.id || matchingItem.item_id,
                    content: matchingItem.content || matchingItem.item_content || '',
                    item_content: matchingItem.content || matchingItem.item_content || '',
                  },
                ],
              };
            }
          } else {
            // Explicitly clear drag_items array if there's no drag_item_id
            return {
              ...question,
              drag_item_id: undefined, // Use undefined instead of null for TypeScript compatibility
              drag_items: [],
            };
          }
          return question;
        });
      }

      setLocalQuestions(updatedQuestions);

      // 8. Update parent component with simple, clean group object
      const updatedGroup = {
        ...group,
        questions: updatedQuestions,
      };

      onUpdateGroup(updatedGroup);
      setIsEditing(false);
    } catch (error) {
      // Optionally, show an error message to the user
    }
  };

  const dragItemMap = useMemo(() => {
    const map = new Map();

    if (localDragItems && localDragItems.length > 0) {
      localDragItems.forEach((item) => {
        const itemContent = item.content || item.item_content || '';
        const itemId = item.drag_item_id || item.id || item.item_id;

        if (itemId) {
          // Use a single consistent ID and content
          map.set(itemId, itemContent);
        }
      });
    }

    // Also map directly from questions if we have questions with drag_items
    if (localQuestions && localQuestions.length > 0) {
      localQuestions.forEach((question) => {
        if (question.drag_items && question.drag_items.length > 0) {
          question.drag_items.forEach((item) => {
            const itemId = item.drag_item_id || item.item_id;
            if (itemId) {
              map.set(itemId, item.content);
            }
          });
        }
      });
    }

    return map;
  }, [localDragItems]);

  const initialFormData: DragDropFormData = {
    drag_items:
      localDragItems?.map((item) => {
        return {
          item_id: item.drag_item_id || item.id || item.item_id,
          content: item.content || item.item_content || '',
        };
      }) || [],
    questions:
      localQuestions?.map((q) => {
        // Handle case where drag_items is an array in the question response
        let dragItemId = q.drag_item_id;
        if (!dragItemId && q.drag_items && q.drag_items.length > 0) {
          dragItemId = q.drag_items[0].drag_item_id || q.drag_items[0].item_id;
        }

        // Convert null/undefined drag_item_id to empty string for form data
        // since DragDropFormData expects drag_item_id to be a string
        const formDragItemId = dragItemId || '';

        return {
          id: q.id || q.question_id,
          question_order: q.question_order,
          point: q.point,
          explanation: q.explanation,
          instruction_for_choice: q.instruction_for_choice,
          zone_index: q.zone_index,
          drag_item_id: formDragItemId, // Always use string (empty string instead of null)
        };
      }) || [],
  };

  if (isEditing) {
    return (
      <DragDropForm
        initialData={initialFormData}
        onSubmit={(e) => {
          handleSubmit(e);
        }}
        onCancel={() => setIsEditing(false)}
        isSubmitting={
          isLoading.createQuestions ||
          isLoading.updateQuestionInfo ||
          isLoading.deleteQuestion ||
          isLoading.createDragItem ||
          isLoading.updateDragItem ||
          isLoading.deleteDragItem
        }
        groupId={group.id}
        onUpdateQuestion={handleUpdateQuestion}
      />
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h3 className='font-semibold'>Drag & Drop Configuration</h3>
        <Button onClick={() => setIsEditing(true)} className='gap-2'>
          <Edit className='h-4 w-4' />
          Edit Configuration
        </Button>
      </div>

      {localQuestions.length === 0 && localDragItems?.length === 0 ? (
        <div className='text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg'>
          <Plus className='h-8 w-8 mx-auto mb-2 opacity-50' />
          <p>No Drag & Drop configuration set up yet.</p>
          <p className='text-sm'>Click "Edit Configuration" to start.</p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Current Configuration Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 gap-6 text-sm'>
              <div>
                <h4 className='font-semibold mb-2 border-b pb-1'>
                  Drag Items ({localDragItems?.length || 0})
                </h4>
                <ul className='space-y-1 list-disc list-inside'>
                  {localDragItems?.length > 0 ? (
                    localDragItems.map((item, i) => {
                      // Make sure we're not displaying an ID as content
                      let displayContent = item.content;
                      if (
                        typeof displayContent === 'string' &&
                        displayContent.match(
                          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
                        )
                      ) {
                        displayContent = `Drag Item ${i + 1}`;
                      }
                      return (
                        <li key={i} className='text-muted-foreground'>
                          {typeof displayContent !== 'object'
                            ? displayContent
                            : `Drag Item ${i + 1}`}
                          <span className='text-xs text-muted-foreground ml-2'>
                            (ID: {item.drag_item_id || item.id || item.item_id})
                          </span>
                        </li>
                      );
                    })
                  ) : (
                    <li className='text-muted-foreground italic'>No items created.</li>
                  )}
                </ul>
              </div>
              <div>
                <h4 className='font-semibold mb-2 border-b pb-1'>
                  Questions / Drop Zones ({localQuestions.length})
                </h4>
                <ul className='space-y-2'>
                  {localQuestions.map((question) => {
                    // Get drag_item_id from either direct property or nested drag_items array
                    let dragItemId = question.drag_item_id;
                    if (!dragItemId && question.drag_items && question.drag_items.length > 0) {
                      dragItemId =
                        question.drag_items[0].drag_item_id || question.drag_items[0].item_id;
                    }

                    // Find the drag item content from all possible sources
                    let dragItemContent = null;

                    // Skip processing if there's no drag item ID (not an error condition)
                    if (!dragItemId || dragItemId === 'null' || dragItemId === 'undefined') {
                      dragItemContent = null;
                    } else {
                      // 1. First check the direct dragItemMap
                      dragItemContent = dragItemMap.get(dragItemId);
                      if (dragItemContent) {
                      }

                      // 2. If not found, look for it directly in localDragItems
                      if (!dragItemContent) {
                        const foundItem = localDragItems.find(
                          (item) =>
                            item.id === dragItemId ||
                            item.drag_item_id === dragItemId ||
                            item.item_id === dragItemId
                        );

                        if (foundItem) {
                          dragItemContent = foundItem.content || foundItem.item_content;
                        }
                      }

                      // 3. If still not found, check question's own drag_items array
                      if (
                        !dragItemContent &&
                        question.drag_items &&
                        question.drag_items.length > 0
                      ) {
                        dragItemContent =
                          question.drag_items[0].content || question.drag_items[0].item_content;
                      }

                      // 4. Make sure the content is not an ID (guard against displaying IDs)
                      if (
                        dragItemContent &&
                        typeof dragItemContent === 'string' &&
                        dragItemContent.match(
                          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
                        )
                      ) {
                        dragItemContent = `Drag Item (ID: ${dragItemContent})`;
                      }
                    }

                    return (
                      <li
                        key={question.id || question.question_id}
                        className='text-muted-foreground'
                      >
                        <span className='font-medium text-primary'>
                          Q{question.question_order} (Zone {question.zone_index}):
                        </span>{' '}
                        {dragItemContent ? (
                          <span>{dragItemContent}</span>
                        ) : (
                          <span className='italic text-amber-500'>
                            {dragItemId && dragItemId !== 'null' && dragItemId !== 'undefined'
                              ? `Invalid Item (ID: ${dragItemId})`
                              : 'No item assigned yet'}
                          </span>
                        )}
                        {/* Debug info - can be removed in production */}
                        <span className='text-xs text-muted-foreground ml-2'>
                          (QID: {question.id || question.question_id})
                        </span>
                      </li>
                    );
                  })}
                  {localQuestions.length === 0 && (
                    <li className='text-muted-foreground italic'>No questions created.</li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
