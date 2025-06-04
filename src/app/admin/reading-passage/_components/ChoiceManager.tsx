'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Edit, Plus, Save, Trash2, X } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { choiceAPI } from '@/lib/api/reading';
import { Choice } from '@/types/reading-passage.types';
import { toast } from 'sonner';

interface ChoiceManagerProps {
  readonly questionId: string;
}

interface ChoiceFormProps {
  choice: Partial<Choice>;
  isEditing?: boolean;
  onSave: (data: Partial<Choice>) => void;
  onCancel: () => void;
  loading?: boolean;
}

const ChoiceForm: React.FC<ChoiceFormProps> = ({
  choice,
  isEditing = false,
  onSave,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState(choice);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <Label htmlFor='label'>Choice Label *</Label>
          <Input
            id='label'
            value={formData.label ?? ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, label: e.target.value }))}
            placeholder='A, B, C, D...'
            required
          />
        </div>
        <div>
          <Label htmlFor='choice_order'>Order</Label>
          <Input
            id='choice_order'
            type='number'
            value={formData.choice_order ?? ''}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, choice_order: parseInt(e.target.value) }))
            }
          />
        </div>
      </div>

      <div>
        <Label htmlFor='content'>Choice Content *</Label>
        <Textarea
          id='content'
          value={formData.content ?? ''}
          onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
          placeholder='Enter the choice text'
          required
          rows={3}
        />
      </div>

      <div className='flex items-center space-x-2'>
        <Checkbox
          id='is_correct'
          checked={formData.is_correct || false}
          onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_correct: !!checked }))}
        />
        <Label htmlFor='is_correct'>This is a correct answer</Label>
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

export default function ChoiceManager({ questionId }: ChoiceManagerProps) {
  const [choices, setChoices] = useState<Choice[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingChoice, setEditingChoice] = useState<string | null>(null);
  const [showNewChoice, setShowNewChoice] = useState(false);
  const [newChoice, setNewChoice] = useState<Partial<Choice>>({
    label: '',
    content: '',
    choice_order: 1,
    is_correct: false,
  });
  const fetchChoices = useCallback(async () => {
    try {
      setLoading(true);
      const response = await choiceAPI.getChoicesByQuestion(questionId);
      if (response.status === 'success') {
        setChoices(response.data ?? []);
      }
    } catch (error) {
      console.error('Error fetching choices:', error);
    } finally {
      setLoading(false);
    }
  }, [questionId]);

  useEffect(() => {
    fetchChoices();
  }, [fetchChoices]);

  const handleCreateChoice = async () => {
    if (!newChoice.label || !newChoice.content) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      setLoading(true);
      const choiceData = {
        question_id: questionId,
        label: newChoice.label,
        content: newChoice.content,
        choice_order: newChoice.choice_order ?? choices.length + 1,
        is_correct: newChoice.is_correct ?? false,
      };

      const response = await choiceAPI.createChoice(choiceData);
      if (response.status === 'success') {
        toast.success('Choice created successfully');
        setShowNewChoice(false);
        setNewChoice({
          label: '',
          content: '',
          choice_order: choices.length + 2,
          is_correct: false,
        });
        fetchChoices();
      }
    } catch (error) {
      toast.error('Failed to create choice');
      console.error('Error creating choice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateChoice = async (choiceId: string, updateData: Partial<Choice>) => {
    try {
      setLoading(true);
      const response = await choiceAPI.updateChoice(choiceId, updateData);
      if (response.status === 'success') {
        toast.success('Choice updated successfully');
        setEditingChoice(null);
        fetchChoices();
      }
    } catch (error) {
      toast.error('Failed to update choice');
      console.error('Error updating choice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChoice = async (choiceId: string) => {
    if (!confirm('Are you sure you want to delete this choice?')) return;

    try {
      setLoading(true);
      const response = await choiceAPI.deleteChoice(choiceId);
      if (response.status === 'success') {
        toast.success('Choice deleted successfully');
        fetchChoices();
      }
    } catch (error) {
      toast.error('Failed to delete choice');
      console.error('Error deleting choice:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <h3 className='text-lg font-semibold'>Answer Choices</h3>
        <Button size='sm' onClick={() => setShowNewChoice(true)} disabled={showNewChoice}>
          <Plus className='h-4 w-4 mr-2' />
          Add Choice
        </Button>
      </div>

      {showNewChoice && (
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Create New Choice</CardTitle>
          </CardHeader>
          <CardContent>
            <ChoiceForm
              choice={newChoice}
              onSave={handleCreateChoice}
              onCancel={() => setShowNewChoice(false)}
              loading={loading}
            />
          </CardContent>
        </Card>
      )}

      <div className='space-y-3'>
        {choices.map((choice) => (
          <Card
            key={choice.choice_id}
            className={choice.is_correct ? 'border-green-200 bg-green-50' : ''}
          >
            <CardContent className='pt-4'>
              {editingChoice === choice.choice_id ? (
                <ChoiceForm
                  choice={choice}
                  isEditing={true}
                  onSave={(data) => handleUpdateChoice(choice.choice_id!, data)}
                  onCancel={() => setEditingChoice(null)}
                  loading={loading}
                />
              ) : (
                <div className='space-y-2'>
                  <div className='flex justify-between items-start'>
                    <div className='flex items-center gap-2'>
                      <Badge variant='outline' className='font-mono'>
                        {choice.label}
                      </Badge>
                      {choice.is_correct && (
                        <Badge variant='default' className='bg-green-600'>
                          <CheckCircle className='h-3 w-3 mr-1' />
                          Correct
                        </Badge>
                      )}
                    </div>
                    <div className='flex gap-2'>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => setEditingChoice(choice.choice_id!)}
                        disabled={editingChoice === choice.choice_id}
                      >
                        <Edit className='h-3 w-3' />
                      </Button>
                      <Button
                        size='sm'
                        variant='destructive'
                        onClick={() => handleDeleteChoice(choice.choice_id!)}
                        disabled={loading}
                      >
                        <Trash2 className='h-3 w-3' />
                      </Button>
                    </div>
                  </div>
                  <p className='text-sm'>{choice.content}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {choices.length === 0 && !showNewChoice && (
        <Card>
          <CardContent className='text-center py-6'>
            <p className='text-muted-foreground mb-4'>No choices found for this question.</p>
            <Button onClick={() => setShowNewChoice(true)}>
              <Plus className='h-4 w-4 mr-2' />
              Create First Choice
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
