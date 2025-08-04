'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Filter, Loader2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ListeningAttemptFilters } from '@/store/slices/listening-attempt-filter-slice';
import { ieltsTypeOptions, partNumberOptions, statusOptions } from '@/utils/filter';
import { useDebounce } from '@uidotdev/usehooks';
import React, { useState, useCallback, useMemo, memo, useEffect } from 'react';

interface ListeningAttemptFilterToolbarProps {
  filters: ListeningAttemptFilters;
  onFiltersChange: (filters: ListeningAttemptFilters) => void;
  onClearFilters: () => void;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  onSortByChange: (field: string) => void;
  onSortDirectionChange: (direction: 'asc' | 'desc') => void;
  isLoading?: boolean;
}

const sortOptions = [
  { value: 'finishedAt', label: 'Finish Date' },
  { value: 'totalPoints', label: 'Score' },
  { value: 'duration', label: 'Duration' },
  { value: 'createdAt', label: 'Created At' },
];

export const ListeningAttemptFilterToolbar = memo(function ListeningAttemptFilterToolbar({
  filters,
  onFiltersChange,
  onClearFilters,
  sortBy,
  sortDirection,
  onSortByChange,
  onSortDirectionChange,
  isLoading = false,
}: Readonly<ListeningAttemptFilterToolbarProps>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.title || '');
  const debouncedSearchTerm = useDebounce(searchTerm, 800);

  const updateFilter = useCallback(
    (key: keyof ListeningAttemptFilters, value: any) => {
      onFiltersChange({
        ...filters,
        [key]: value === '' || (Array.isArray(value) && value.length === 0) ? undefined : value,
      });
    },
    [filters, onFiltersChange]
  );

  const handleToggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleSortDirectionToggle = useCallback(() => {
    onSortDirectionChange(sortDirection === 'asc' ? 'desc' : 'asc');
  }, [sortDirection, onSortDirectionChange]);

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some((value) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== undefined && value !== '';
    });
  }, [filters]);

  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter((value) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== undefined && value !== '';
    }).length;
  }, [filters]);

  // Memoized input handlers
  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    [updateFilter]
  );

  const handleIeltsTypeChange = useCallback(
    (values: string[]) => {
      updateFilter('ieltsType', values.map(Number));
    },
    [updateFilter]
  );

  const handlePartNumberChange = useCallback(
    (values: string[]) => {
      updateFilter('partNumber', values.map(Number));
    },
    [updateFilter]
  );

  const handleStatusChange = useCallback(
    (values: string[]) => {
      updateFilter('status', values.map(Number));
    },
    [updateFilter]
  );

  useEffect(() => {
    if (debouncedSearchTerm !== filters.title) {
      updateFilter('title', debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, filters.title]);

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          {/* Main toolbar row */}
          <div className='flex flex-col sm:flex-row gap-4'>
            {/* Title search - always visible */}
            <div className='flex-1 min-w-0'>
              <Input
                placeholder='Search by passage title...'
                value={searchTerm}
                onChange={handleTitleChange}
                className='w-full'
              />
            </div>

            {/* Sort controls */}
            <div className='flex gap-2 shrink-0'>
              <Select value={sortBy} onValueChange={onSortByChange} disabled={isLoading}>
                <SelectTrigger className='w-[140px]'>
                  <SelectValue placeholder='Sort by' />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant='outline'
                size='sm'
                onClick={handleSortDirectionToggle}
                disabled={isLoading}
                className='px-3'
              >
                {sortDirection === 'asc' ? '↑' : '↓'}
              </Button>
            </div>

            {/* Filter toggle button */}
            <Button
              variant='outline'
              size='sm'
              onClick={handleToggleExpanded}
              disabled={isLoading}
              className='flex items-center gap-2'
            >
              <Filter className='h-4 w-4' />
              Filters
              {activeFilterCount > 0 && (
                <span className='bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center'>
                  {activeFilterCount}
                </span>
              )}
            </Button>

            {/* Clear filters button */}
            {hasActiveFilters && (
              <Button
                variant='ghost'
                size='sm'
                onClick={onClearFilters}
                disabled={isLoading}
                className='flex items-center gap-2 text-muted-foreground hover:text-foreground'
              >
                <X className='h-4 w-4' />
                Clear
              </Button>
            )}
          </div>

          {/* Expanded filters */}
          {isExpanded && (
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t'>
              <div className='space-y-2'>
                <Label htmlFor='ieltsType'>IELTS Type</Label>
                <MultiSelect
                  options={ieltsTypeOptions}
                  selected={filters.ieltsType?.map(String) || []}
                  onChange={handleIeltsTypeChange}
                  placeholder='Select IELTS types'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='partNumber'>Part Number</Label>
                <MultiSelect
                  options={partNumberOptions}
                  selected={filters.partNumber?.map(String) || []}
                  onChange={handlePartNumberChange}
                  placeholder='Select parts'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='status'>Status</Label>
                <MultiSelect
                  options={statusOptions}
                  selected={filters.status?.map(String) || []}
                  onChange={handleStatusChange}
                  placeholder='Select status'
                />
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className='flex items-center justify-center py-2'>
              <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
              <span className='text-sm text-muted-foreground ml-2'>Loading...</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

export default ListeningAttemptFilterToolbar;
