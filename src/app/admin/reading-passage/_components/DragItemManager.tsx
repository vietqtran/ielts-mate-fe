'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, GripVertical, Plus, Save, Trash2, X } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { dragItemAPI } from '@/lib/api/reading';
import { DragItem } from '@/types/reading-passage.types';
import { toast } from 'sonner';

interface DragItemManagerProps {
  readonly questionId: string;
}

interface DragItemFormProps {
  readonly item: Partial<DragItem>;
  readonly isEditing?: boolean;
  readonly onSave: (data: Partial<DragItem>) => void;
  readonly onCancel: () => void;
  readonly loading?: boolean;
}

interface DragItemCardProps {
  readonly item: DragItem;
  readonly index: number;
  readonly onEdit: () => void;
  readonly onDelete: () => void;
  readonly loading: boolean;
  readonly editingItem: string | null;
  readonly onUpdateItem: (itemId: string, data: Partial<DragItem>) => void;
  readonly onCancelEdit: () => void;
  readonly onReorder: (fromIndex: number, toIndex: number) => void;
}

const DragItemForm: React.FC<DragItemFormProps> = ({
  item,
  isEditing = false,
  onSave,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState(item);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <Label htmlFor='content'>Content *</Label>
        <Textarea
          id='content'
          value={formData.content ?? ''}
          onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
          placeholder='Enter the drag item content'
          required
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor='drag_item_order'>Order</Label>
        <Input
          id='drag_item_order'
          type='number'
          value={formData.drag_item_order ?? ''}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, drag_item_order: parseInt(e.target.value) }))
          }
        />
      </div>

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

const DragItemCard: React.FC<DragItemCardProps> = ({
  item,
  index,
  onEdit,
  onDelete,
  loading,
  editingItem,
  onUpdateItem,
  onCancelEdit,
  onReorder,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (dragIndex !== index) {
      onReorder(dragIndex, index);
    }
  };

  return (
    <Card
      className={`transition-all ${isDragging ? 'opacity-50 rotate-1' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <CardContent className='pt-4'>
        {editingItem === item.drag_item_id ? (
          <DragItemForm
            item={item}
            isEditing={true}
            onSave={(data) => onUpdateItem(item.drag_item_id!, data)}
            onCancel={onCancelEdit}
            loading={loading}
          />
        ) : (
          <div className='flex items-start gap-3'>
            <div className='flex-shrink-0 cursor-grab'>
              <GripVertical className='h-5 w-5 text-muted-foreground' />
            </div>
            <div className='flex-1 space-y-2'>
              <div className='flex justify-between items-start'>
                <Badge variant='outline' className='font-mono'>
                  #{item.drag_item_order}
                </Badge>
                <div className='flex gap-2'>
                  <Button size='sm' variant='outline' onClick={onEdit} disabled={loading}>
                    <Edit className='h-3 w-3' />
                  </Button>
                  <Button size='sm' variant='destructive' onClick={onDelete} disabled={loading}>
                    <Trash2 className='h-3 w-3' />
                  </Button>
                </div>
              </div>
              <p className='text-sm'>{item.content}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function DragItemManager({ questionId }: DragItemManagerProps) {
  const [dragItems, setDragItems] = useState<DragItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [showNewItem, setShowNewItem] = useState(false);
  const [newItem, setNewItem] = useState<Partial<DragItem>>({
    content: '',
    drag_item_order: 1,
  });
  const fetchDragItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await dragItemAPI.getDragItemsByQuestion(questionId);
      if (response.status === 'success') {
        const sortedItems = (response.data ?? []).sort(
          (a, b) => a.drag_item_order - b.drag_item_order
        );
        setDragItems(sortedItems);
      }
    } catch (error) {
      console.error('Error fetching drag items:', error);
    } finally {
      setLoading(false);
    }
  }, [questionId]);

  useEffect(() => {
    fetchDragItems();
  }, [fetchDragItems]);

  const handleCreateDragItem = async (data: Partial<DragItem>) => {
    if (!data.content) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      setLoading(true);
      const itemData = {
        question_id: questionId,
        content: data.content,
        drag_item_order: data.drag_item_order ?? dragItems.length + 1,
      };

      const response = await dragItemAPI.createDragItem(itemData);
      if (response.status === 'success') {
        toast.success('Drag item created successfully');
        setShowNewItem(false);
        setNewItem({
          content: '',
          drag_item_order: dragItems.length + 2,
        });
        fetchDragItems();
      }
    } catch (error) {
      toast.error('Failed to create drag item');
      console.error('Error creating drag item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDragItem = async (itemId: string, updateData: Partial<DragItem>) => {
    try {
      setLoading(true);
      const response = await dragItemAPI.updateDragItem(itemId, updateData);
      if (response.status === 'success') {
        toast.success('Drag item updated successfully');
        setEditingItem(null);
        fetchDragItems();
      }
    } catch (error) {
      toast.error('Failed to update drag item');
      console.error('Error updating drag item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDragItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this drag item?')) return;

    try {
      setLoading(true);
      const response = await dragItemAPI.deleteDragItem(itemId);
      if (response.status === 'success') {
        toast.success('Drag item deleted successfully');
        fetchDragItems();
      }
    } catch (error) {
      toast.error('Failed to delete drag item');
      console.error('Error deleting drag item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReorderItems = (fromIndex: number, toIndex: number) => {
    const newItems = [...dragItems];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);

    // Update order numbers
    const reorderedItems = newItems.map((item, index) => ({
      ...item,
      drag_item_order: index + 1,
    }));

    setDragItems(reorderedItems);
  };

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <h3 className='text-lg font-semibold'>Drag Items</h3>
        <Button size='sm' onClick={() => setShowNewItem(true)} disabled={showNewItem}>
          <Plus className='h-4 w-4 mr-2' />
          Add Drag Item
        </Button>
      </div>

      {showNewItem && (
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Create New Drag Item</CardTitle>
          </CardHeader>
          <CardContent>
            <DragItemForm
              item={newItem}
              onSave={handleCreateDragItem}
              onCancel={() => setShowNewItem(false)}
              loading={loading}
            />
          </CardContent>
        </Card>
      )}

      <div className='space-y-3'>
        {dragItems.map((item, index) => (
          <DragItemCard
            key={item.drag_item_id}
            item={item}
            index={index}
            onEdit={() => setEditingItem(item.drag_item_id!)}
            onDelete={() => handleDeleteDragItem(item.drag_item_id!)}
            loading={loading}
            editingItem={editingItem}
            onUpdateItem={handleUpdateDragItem}
            onCancelEdit={() => setEditingItem(null)}
            onReorder={handleReorderItems}
          />
        ))}
      </div>

      {dragItems.length === 0 && !showNewItem && (
        <Card>
          <CardContent className='text-center py-6'>
            <p className='text-muted-foreground mb-4'>No drag items found for this question.</p>
            <p className='text-xs text-muted-foreground mb-4'>
              Drag items are used in drag-and-drop questions where students drag text elements to
              specific zones.
            </p>
            <Button onClick={() => setShowNewItem(true)}>
              <Plus className='h-4 w-4 mr-2' />
              Create First Drag Item
            </Button>
          </CardContent>
        </Card>
      )}

      {dragItems.length > 0 && (
        <div className='text-xs text-muted-foreground p-3 bg-blue-50 rounded'>
          💡 <strong>Tip:</strong> You can drag and drop items to reorder them. The order determines
          how they appear to students.
        </div>
      )}
    </div>
  );
}
