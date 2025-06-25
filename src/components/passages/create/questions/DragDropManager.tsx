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
}

interface Question {
  id?: string;
  question_id?: string;
  question_order: number;
  point: number;
  explanation: string;
  instruction_for_choice?: string;
  zone_index: number;
  drag_item_id?: string;
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

  // Function to fetch all drag items for a group
  const fetchAllDragItems = async (groupId: string) => {
    if (!groupId) return;

    try {
      const response = await getAllDragItemsByGroup(groupId);

      if (response?.data?.items) {
        const fetchedItems = response.data.items.map((item) => ({
          id: item.item_id,
          drag_item_id: item.item_id,
          content: item.item_content,
        }));

        console.log('Fetched all drag items from API:', fetchedItems);
        setLocalDragItems(fetchedItems);
      }
    } catch (error) {
      console.error('Failed to fetch all drag items:', error);
    }
  };

  // Reset local state when group ID changes (indicating a new passage is being created)
  useEffect(() => {
    setLocalQuestions(group.questions);

    // First try to extract drag items from both the group and questions
    const dragItemsFromGroup = group.drag_items || [];
    const dragItemsFromQuestions: DragItem[] = [];

    if (group.questions && group.questions.length > 0) {
      group.questions.forEach((question) => {
        if (question.drag_items && question.drag_items.length > 0) {
          question.drag_items.forEach((item) => {
            dragItemsFromQuestions.push({
              id: item.drag_item_id || item.item_id,
              drag_item_id: item.drag_item_id || item.item_id,
              content: item.content,
            });
          });
        }
      });
    }

    // Combine both sources, avoiding duplicates
    const combinedItems = [...dragItemsFromGroup];
    dragItemsFromQuestions.forEach((newItem) => {
      const exists = combinedItems.some(
        (item) =>
          (item.id && item.id === newItem.id) ||
          (item.drag_item_id && item.drag_item_id === newItem.drag_item_id)
      );

      if (!exists) {
        combinedItems.push(newItem);
      }
    });

    console.log('Combined drag items on init:', combinedItems);

    // Set items from combined sources first as a fallback
    setLocalDragItems(combinedItems);
    setIsEditing(false);

    // Then fetch all items from the API to ensure we have the complete list
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
    getAllDragItemsByGroup,
    isLoading,
  } = useQuestion();

  const handleSubmit = async (data: DragDropFormData) => {
    if (!group.id) {
      console.error('Group ID is required');
      return;
    }

    const groupId = group.id;
    const originalItems = localDragItems;
    const originalQuestions = localQuestions;

    try {
      // 1. Handle Drag Items
      const itemPromises: Promise<any>[] = [];

      // Identify new, updated, and deleted items
      const newItemData = data.drag_items.filter((item) => !item.item_id);
      const updatedItemData = data.drag_items.filter((item) => {
        const original = originalItems.find((orig) => orig.id === item.item_id);
        // NOTE: API does not support updating order, only content.
        return original && original.content !== item.content;
      });
      const deletedItemIds = originalItems
        .filter((orig) => !data.drag_items.some((item) => item.item_id === orig.id))
        .map((item) => item.id);

      // Create new items
      if (newItemData.length > 0) {
        // Create each new item with separate API calls
        newItemData.forEach((item) => {
          itemPromises.push(createDragItem(groupId, { content: item.content }));
        });
      }

      // Update existing items
      updatedItemData.forEach((item) => {
        itemPromises.push(updateDragItem(groupId, item.item_id!, { content: item.content }));
      });

      // Delete items
      deletedItemIds.forEach((id) => {
        if (id) {
          // Only delete if id is defined
          itemPromises.push(deleteDragItem(groupId, id));
        }
      });

      const itemResults = await Promise.all(itemPromises);

      // Process responses, handling both single items and arrays of items
      const successfulItems = itemResults
        .map((res) => {
          if (!res || !res.data) return null;
          // Handle both single item and array responses
          return Array.isArray(res.data) ? res.data : [res.data];
        })
        .filter(Boolean)
        .flat();

      console.log('Successful Items from API:', successfulItems);

      // Atomically update drag items state
      const updatedItems = [...originalItems].filter((item) => !deletedItemIds.includes(item.id));
      successfulItems.forEach((newItem) => {
        // Map the API response structure to our component's structure
        const mappedItem = {
          id: newItem.drag_item_id || newItem.item_id,
          drag_item_id: newItem.drag_item_id || newItem.item_id,
          content: newItem.content,
        };

        console.log('Mapped drag item:', mappedItem);

        const index = updatedItems.findIndex(
          (item) => item.id === mappedItem.id || item.drag_item_id === mappedItem.drag_item_id
        );

        if (index > -1) {
          updatedItems[index] = mappedItem; // Update existing
        } else {
          updatedItems.push(mappedItem); // Add new
        }
      });

      // 2. Handle Questions - ONLY create new questions, don't update existing ones
      const questionPromises: Promise<any>[] = [];
      const newQuestionData = data.questions.filter((q) => !q.id);
      // We're no longer updating existing questions as per requirements
      const deletedQuestionIds = originalQuestions
        .filter((orig) => !data.questions.some((q) => q.id === orig.id))
        .map((q) => q.id);

      // Create new questions
      if (newQuestionData.length > 0) {
        const newQuestionRequests = newQuestionData.map((q) => {
          // Remove instruction_for_choice if it's present but empty
          const questionData = {
            ...q,
            question_type: 3, // DRAG_AND_DROP
            question_group_id: groupId,
            question_categories: [],
            number_of_correct_answers: 0,
            drag_item_id: q.drag_item_id, // Ensure drag_item_id is included
          };

          // If instruction_for_choice is empty or undefined, don't send it to the API
          if (!questionData.instruction_for_choice) {
            delete questionData.instruction_for_choice;
          }

          return questionData;
        });

        questionPromises.push(createQuestions(groupId, newQuestionRequests));
      }

      // We no longer update existing questions, per requirements
      // Only handle deletions of questions
      deletedQuestionIds.forEach((id) => {
        if (id) {
          // Only delete if id is defined
          questionPromises.push(deleteQuestion(groupId, id));
        }
      });

      const questionResults = await Promise.all(questionPromises);
      const successfulQuestions = questionResults
        .map((res) =>
          res && Array.isArray(res.data) ? res.data : res && res.data ? [res.data] : []
        )
        .flat()
        .filter(Boolean);

      // Atomically update questions state
      const updatedQuestions = [...originalQuestions].filter(
        (q) => !deletedQuestionIds.includes(q.id)
      );

      console.log('Successful Questions from API:', successfulQuestions);

      // Process drag items from the question response
      const dragItemsFromQuestions: DragItem[] = [];

      successfulQuestions.forEach((newQuestion) => {
        // Extract drag items from the question response
        if (newQuestion.drag_items && newQuestion.drag_items.length > 0) {
          console.log('Found drag items in question response:', newQuestion.drag_items);
          newQuestion.drag_items.forEach((item: any) => {
            dragItemsFromQuestions.push({
              id: item.drag_item_id || item.item_id,
              drag_item_id: item.drag_item_id || item.item_id,
              content: item.content || '',
            });
          });
        }

        // Map API response structure to our component's structure
        const mappedQuestion = {
          id: newQuestion.question_id,
          question_id: newQuestion.question_id,
          question_order: newQuestion.question_order,
          point: newQuestion.point,
          explanation: newQuestion.explanation,
          instruction_for_choice: newQuestion.instruction_for_choice,
          zone_index: newQuestion.zone_index,
          drag_item_id:
            newQuestion.drag_items && newQuestion.drag_items.length > 0
              ? newQuestion.drag_items[0].drag_item_id
              : newQuestion.drag_item_id,
        };

        console.log('Mapped question:', mappedQuestion);

        const index = updatedQuestions.findIndex(
          (q) => q.id === mappedQuestion.id || q.question_id === mappedQuestion.question_id
        );

        if (index > -1) {
          updatedQuestions[index] = mappedQuestion; // Update existing
        } else {
          updatedQuestions.push(mappedQuestion); // Add new
        }
      });

      // Add drag items from questions to the updatedItems
      dragItemsFromQuestions.forEach((newDragItem) => {
        const exists = updatedItems.some(
          (item) => item.id === newDragItem.id || item.drag_item_id === newDragItem.drag_item_id
        );

        if (!exists) {
          console.log('Adding drag item from question response:', newDragItem);
          updatedItems.push(newDragItem);
        }
      });

      // 3. Update local state and propagate changes to parent
      console.log('Setting localDragItems to:', updatedItems);
      console.log('Setting localQuestions to:', updatedQuestions);

      setLocalDragItems(updatedItems);
      setLocalQuestions(updatedQuestions);

      // Notify parent component to update its state for preview
      // For the updated group, ensure we're using consistent ID field names
      const updatedGroup = {
        ...group,
        questions: updatedQuestions.map((q) => {
          // Get drag_item_id from either direct property or nested drag_items array
          let dragItemId = q.drag_item_id;
          if (!dragItemId && q.drag_items && q.drag_items.length > 0) {
            dragItemId = q.drag_items[0].drag_item_id || q.drag_items[0].item_id;
          }

          return {
            ...q,
            question_id: q.id || q.question_id,
            drag_item_id: dragItemId,
          };
        }),
        drag_items: updatedItems.map((item) => ({
          id: item.item_id || item.id || item.drag_item_id,
          drag_item_id: item.item_id || item.id || item.drag_item_id,
          content: item.content,
        })),
      };

      console.log('Updating group with:', updatedGroup);
      onUpdateGroup(updatedGroup);

      // After successfully submitting, fetch all drag items to ensure we have the complete list
      if (group.id) {
        fetchAllDragItems(group.id);
      }

      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save Drag & Drop changes:', error);
      // Optionally, show an error message to the user
    }
  };

  const dragItemMap = useMemo(() => {
    console.log('Building dragItemMap from:', localDragItems);
    const map = new Map();

    if (localDragItems && localDragItems.length > 0) {
      localDragItems.forEach((item) => {
        // Handle all possible ID field names
        const itemId = item.item_id || item.id || item.drag_item_id;
        if (itemId) {
          map.set(itemId, item.content);
          console.log(`Added to map: ${itemId} -> ${item.content}`);

          // Add mapping for all possible ID forms to ensure we catch references
          if (item.item_id) map.set(item.item_id, item.content);
          if (item.id) map.set(item.id, item.content);
          if (item.drag_item_id) map.set(item.drag_item_id, item.content);
        }
      });
    }

    return map;
  }, [localDragItems]);

  const initialFormData: DragDropFormData = {
    drag_items:
      localDragItems?.map((item) => {
        console.log('Processing drag item for form:', item);
        return {
          item_id: item.item_id || item.id || item.drag_item_id,
          content: item.content,
        };
      }) || [],
    questions:
      localQuestions?.map((q) => {
        // Handle case where drag_items is an array in the question response
        let dragItemId = q.drag_item_id;
        if (!dragItemId && q.drag_items && q.drag_items.length > 0) {
          dragItemId = q.drag_items[0].drag_item_id || q.drag_items[0].item_id;
        }

        console.log('Processing question for form:', q, 'Using drag_item_id:', dragItemId);

        return {
          id: q.id || q.question_id,
          question_order: q.question_order,
          point: q.point,
          explanation: q.explanation,
          instruction_for_choice: q.instruction_for_choice,
          zone_index: q.zone_index,
          drag_item_id: dragItemId || '', // Ensure it's never undefined
        };
      }) || [],
  };

  if (isEditing) {
    return (
      <DragDropForm
        initialData={initialFormData}
        onSubmit={handleSubmit}
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
                  {localDragItems?.map((item, i) => (
                    <li key={i} className='text-muted-foreground'>
                      {typeof item.content !== 'object' && JSON.stringify(item.content)}
                    </li>
                  )) || <li className='text-muted-foreground italic'>No items created.</li>}
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

                    console.log('Question in rendering:', question);
                    console.log('Using drag_item_id for display:', dragItemId);
                    console.log('Available in map:', dragItemMap.has(dragItemId));

                    return (
                      <li
                        key={question.id || question.question_id}
                        className='text-muted-foreground'
                      >
                        <span className='font-medium text-primary'>
                          Q{question.question_order} (Zone {question.zone_index}):
                        </span>{' '}
                        {dragItemMap.get(dragItemId) || (
                          <span className='italic text-red-500'>
                            Invalid Item (ID: {dragItemId || 'missing'})
                          </span>
                        )}
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
