'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MarkupFilters } from '@/store/slices/markup-slice';
import { MarkupType, PracticeType, TaskType } from '@/types/markup/markup.enum';
import { Loader2, X } from 'lucide-react';
import { memo, useCallback } from 'react';

interface MarkupFilterToolbarProps {
  filters: MarkupFilters;
  onFiltersChange: (filters: MarkupFilters) => void;
  onClearFilters: () => void;
  isLoading?: boolean;
}

const markupTypeOptions = [
  { value: MarkupType.BOOKMARK.toString(), label: 'Bookmark' },
  { value: MarkupType.FAVORITE.toString(), label: 'Favorite' },
];

const taskTypeOptions = [
  { value: TaskType.LISTENING.toString(), label: 'Listening' },
  { value: TaskType.READING.toString(), label: 'Reading' },
];

const practiceTypeOptions = [
  { value: PracticeType.EXAM.toString(), label: 'Exam' },
  { value: PracticeType.TASK.toString(), label: 'Task' },
];

export const MarkupFilterToolbar = memo(function MarkupFilterToolbar({
  filters,
  onFiltersChange,
  onClearFilters,
  isLoading = false,
}: Readonly<MarkupFilterToolbarProps>) {
  const updateFilter = useCallback(
    (key: keyof MarkupFilters, value: any) => {
      onFiltersChange({
        ...filters,
        [key]: value === '' || value === 'all' ? undefined : Number(value),
      });
    },
    [filters, onFiltersChange]
  );

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== ''
  );

  return (
    <Card className='backdrop-blur-lg border rounded-2xl'>
      <CardContent>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='markUpType' className='text-tekhelet-600'>
              Markup Type
            </Label>
            <Select
              value={filters.markUpType?.toString() || ''}
              onValueChange={(value) => updateFilter('markUpType', value)}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Select markup type' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Types</SelectItem>
                {markupTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='taskType' className='text-tekhelet-600'>
              Task Type
            </Label>
            <Select
              value={filters.taskType?.toString() || ''}
              onValueChange={(value) => updateFilter('taskType', value)}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Select task type' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Types</SelectItem>
                {taskTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='practiceType' className='text-tekhelet-600'>
              Practice Type
            </Label>
            <Select
              value={filters.practiceType?.toString() || ''}
              onValueChange={(value) => updateFilter('practiceType', value)}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Select practice type' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Types</SelectItem>
                {practiceTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='md:col-span-3 flex justify-center items-center gap-4'>
            {hasActiveFilters && (
              <Button
                variant='outline'
                size='sm'
                onClick={onClearFilters}
                className='border-persimmon-400 hover:bg-persimmon-500 text-persimmon-400 flex items-center w-1/3'
              >
                <X className='h-4 w-4 mr-2' />
                Clear All
              </Button>
            )}

            {isLoading && <Loader2 className='h-4 w-4 animate-spin text-tekhelet-500' />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default MarkupFilterToolbar;
