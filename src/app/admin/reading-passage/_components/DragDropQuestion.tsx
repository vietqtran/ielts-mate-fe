'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Plus, Square, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Question {
  id: string;
  type: string;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  dragOptions?: string[];
  dropZoneAnswers?: { [key: string]: string };
}

interface DragDropQuestionProps {
  question: Question;
  passageContent: string;
  onChange: (updates: Partial<Question>) => void;
}

export function DragDropQuestion({ question, passageContent, onChange }: DragDropQuestionProps) {
  const [dragOptions, setDragOptions] = useState<string[]>(question.dragOptions || ['']);
  const [dropZoneAnswers, setDropZoneAnswers] = useState<{ [key: string]: string }>(
    question.dropZoneAnswers || {}
  );

  const getDropZones = () => {
    const matches = passageContent.match(/\[DROP_ZONE:[^\]]+\]/g) || [];
    return matches.map((match) => {
      const id = match.match(/\[DROP_ZONE:([^\]]+)\]/)?.[1] || '';
      return { id, text: match };
    });
  };

  const dropZones = getDropZones();

  useEffect(() => {
    onChange({
      dragOptions,
      dropZoneAnswers,
      correctAnswer: Object.values(dropZoneAnswers),
    });
  }, [dragOptions, dropZoneAnswers]);

  const addDragOption = () => {
    setDragOptions([...dragOptions, '']);
  };

  const updateDragOption = (index: number, value: string) => {
    const newOptions = [...dragOptions];
    newOptions[index] = value;
    setDragOptions(newOptions);
  };

  const removeDragOption = (index: number) => {
    const newOptions = dragOptions.filter((_, i) => i !== index);
    setDragOptions(newOptions);
  };

  const updateDropZoneAnswer = (dropZoneId: string, answer: string) => {
    setDropZoneAnswers((prev) => ({
      ...prev,
      [dropZoneId]: answer,
    }));
  };

  return (
    <div className='space-y-6'>
      {dropZones.length === 0 ? (
        <Card>
          <CardContent className='py-6 text-center'>
            <p className='text-gray-500 mb-2'>No drop zones found in the passage</p>
            <p className='text-sm text-gray-400'>
              Go back to the Passage Content tab and insert drop zones using the &quot;Insert Drop
              Zone&quot; button
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <Label className='text-base font-medium'>Drag Options</Label>
              <Button onClick={addDragOption} variant='outline' size='sm'>
                <Plus className='h-4 w-4 mr-2' />
                Add Option
              </Button>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              {dragOptions.map((option, index) => (
                <div key={index} className='flex items-center gap-2'>
                  <Input
                    placeholder={`Drag option ${index + 1}`}
                    value={option}
                    onChange={(e) => updateDragOption(index, e.target.value)}
                  />
                  {dragOptions.length > 1 && (
                    <Button variant='outline' size='sm' onClick={() => removeDragOption(index)}>
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className='space-y-4'>
            <Label className='text-base font-medium'>Drop Zone Answers</Label>
            <div className='space-y-3'>
              {dropZones.map((zone, index) => (
                <div key={zone.id} className='flex items-center gap-4 p-3 bg-gray-50 rounded-lg'>
                  <div className='flex items-center gap-2'>
                    <Square className='h-4 w-4 text-blue-600' />
                    <Badge variant='outline'>Zone {index + 1}</Badge>
                  </div>
                  <div className='flex-1'>
                    <select
                      className='w-full p-2 border rounded'
                      value={dropZoneAnswers[zone.id] || ''}
                      onChange={(e) => updateDropZoneAnswer(zone.id, e.target.value)}
                    >
                      <option value=''>Select correct answer...</option>
                      {dragOptions
                        .filter((opt) => opt.trim())
                        .map((option, optIndex) => (
                          <option key={optIndex} value={option}>
                            {option}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Card>
            <CardContent className='py-4'>
              <h4 className='font-medium mb-2'>Preview</h4>
              <div className='space-y-2'>
                <div className='flex flex-wrap gap-2 p-3 bg-blue-50 rounded'>
                  <span className='text-sm font-medium'>Available options:</span>
                  {dragOptions
                    .filter((opt) => opt.trim())
                    .map((option, index) => (
                      <Badge key={index} variant='secondary'>
                        {option}
                      </Badge>
                    ))}
                </div>
                <div className='text-sm text-gray-600'>
                  Students will drag these options into the drop zones within the passage text.
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
