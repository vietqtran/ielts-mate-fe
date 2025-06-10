'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { DragDropForm, DragDropFormData } from './DragDropForm';

import { Button } from '@/components/ui/button';
import { useQuestion } from '@/hooks/useQuestion';

interface QuestionGroup {
  id?: string;
  section_order: number;
  section_label: string;
  instruction: string;
  question_type: string;
  questions: any[];
  drag_items?: any[]; // Can be more specific with DragItemType
}

interface DragDropManagerProps {
  group: QuestionGroup;
  refetchPassageData: () => void;
}

export function DragDropManager({ group, refetchPassageData }: Readonly<DragDropManagerProps>) {
  const [isEditing, setIsEditing] = useState(false);
  const [localQuestions, setLocalQuestions] = useState(group.questions);
  const [localDragItems, setLocalDragItems] = useState(group.drag_items || []);

  useEffect(() => {
    setLocalQuestions(group.questions);
    setLocalDragItems(group.drag_items || []);
  }, [group.questions, group.drag_items]);
  const {
    createQuestions,
    updateQuestionInfo,
    deleteQuestion,
    createDragItem,
    updateDragItem,
    deleteDragItem,
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
      const newItemData = data.drag_items.filter((item) => !item.id);
      const updatedItemData = data.drag_items.filter((item) => {
        const original = originalItems.find((orig) => orig.id === item.id);
        // NOTE: API does not support updating order, only content.
        return original && original.content !== item.content;
      });
      const deletedItemIds = originalItems
        .filter((orig) => !data.drag_items.some((item) => item.id === orig.id))
        .map((item) => item.id);

      // Create new items
      if (newItemData.length > 0) {
        newItemData.forEach((item) => {
          itemPromises.push(createDragItem(groupId, { content: item.content }));
        });
      }

      // Update existing items
      updatedItemData.forEach((item) => {
        itemPromises.push(updateDragItem(groupId, item.id!, { content: item.content }));
      });

      // Delete items
      deletedItemIds.forEach((id) => {
        itemPromises.push(deleteDragItem(groupId, id));
      });

      const itemResults = await Promise.all(itemPromises);
      const successfulItems = itemResults
        .map((res) => (res && res.data ? res.data : null))
        .filter(Boolean);

      // Atomically update drag items state
      const updatedItems = [...originalItems].filter((item) => !deletedItemIds.includes(item.id));
      successfulItems.forEach((newItem) => {
        const index = updatedItems.findIndex((item) => item.id === newItem.id);
        if (index > -1) {
          updatedItems[index] = newItem; // Update existing
        } else {
          updatedItems.push(newItem); // Add new
        }
      });

      // 2. Handle Questions
      const questionPromises: Promise<any>[] = [];
      const newQuestionData = data.questions.filter((q) => !q.id);
      const updatedQuestionData = data.questions.filter((q) => {
        const original = originalQuestions.find((orig) => orig.id === q.id);
        return original && JSON.stringify(original) !== JSON.stringify(q); // Simple deep compare
      });
      const deletedQuestionIds = originalQuestions
        .filter((orig) => !data.questions.some((q) => q.id === orig.id))
        .map((q) => q.id);

      // Create new questions
      if (newQuestionData.length > 0) {
        const newQuestionRequests = newQuestionData.map((q) => ({
          ...q,
          question_type: 3, // DRAG_AND_DROP
          question_group_id: groupId,
          question_categories: [],
          number_of_correct_answers: 0,
        }));
        questionPromises.push(createQuestions(groupId, newQuestionRequests));
      }

      // Update questions
      updatedQuestionData.forEach((q) => {
        questionPromises.push(updateQuestionInfo(groupId, q.id!, q));
      });

      // Delete questions
      deletedQuestionIds.forEach((id) => {
        questionPromises.push(deleteQuestion(groupId, id));
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
      successfulQuestions.forEach((newQuestion) => {
        const index = updatedQuestions.findIndex((q) => q.id === newQuestion.id);
        if (index > -1) {
          updatedQuestions[index] = newQuestion; // Update existing
        } else {
          updatedQuestions.push(newQuestion); // Add new
        }
      });

      // 3. Update local state
      setLocalDragItems(updatedItems);
      setLocalQuestions(updatedQuestions);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save Drag & Drop changes:', error);
      // Optionally, show an error message to the user
    }
  };

  const dragItemMap = useMemo(() => {
    return new Map(localDragItems?.map((item) => [item.id, item.content]));
  }, [localDragItems]);

  const initialFormData: DragDropFormData = {
    drag_items:
      localDragItems?.map((item) => ({
        id: item.id,
        content: item.content,
        itemOrder: item.item_order,
      })) || [],
    questions:
      localQuestions?.map((q) => ({
        id: q.id,
        question_order: q.question_order,
        point: q.point,
        explanation: q.explanation,
        instruction_for_choice: q.instruction_for_choice,
        zone_index: q.zone_index,
        drag_item_id: q.drag_item_id,
      })) || [],
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
                  {localDragItems?.map((item) => (
                    <li key={item.id} className='text-muted-foreground'>
                      {item.content}
                    </li>
                  )) || <li className='text-muted-foreground italic'>No items created.</li>}
                </ul>
              </div>
              <div>
                <h4 className='font-semibold mb-2 border-b pb-1'>
                  Questions / Drop Zones ({localQuestions.length})
                </h4>
                <ul className='space-y-2'>
                  {localQuestions.map((question) => (
                    <li key={question.id} className='text-muted-foreground'>
                      <span className='font-medium text-primary'>
                        Q{question.question_order} (Zone {question.zone_index}):
                      </span>{' '}
                      {dragItemMap.get(question.drag_item_id) || (
                        <span className='italic text-red-500'>Invalid Item</span>
                      )}
                    </li>
                  ))}
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
