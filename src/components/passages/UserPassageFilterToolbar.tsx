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
import { UserPassageFilters } from '@/store/slices/user-passage-slice';
import React, { useState, useCallback, useMemo, memo } from 'react';

interface UserPassageFilterToolbarProps {
  filters: UserPassageFilters;
  onFiltersChange: (filters: UserPassageFilters) => void;
  onClearFilters: () => void;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  onSortByChange: (field: string) => void;
  onSortDirectionChange: (direction: 'asc' | 'desc') => void;
  isLoading?: boolean;
}

const ieltsTypeOptions = [
  { value: '0', label: 'Academic' },
  { value: '1', label: 'General Training' },
];

const partNumberOptions = [
  { value: '0', label: 'Part 1' },
  { value: '1', label: 'Part 2' },
  { value: '2', label: 'Part 3' },
];

const sortOptions = [
  { value: 'createdAt', label: 'Created Date' },
  { value: 'title', label: 'Title' },
  { value: 'ieltsType', label: 'IELTS Type' },
  { value: 'partNumber', label: 'Part Number' },
];

export const UserPassageFilterToolbar = memo(function UserPassageFilterToolbar({
  filters,
  onFiltersChange,
  onClearFilters,
  sortBy,
  sortDirection,
  onSortByChange,
  onSortDirectionChange,
  isLoading = false,
}: Readonly<UserPassageFilterToolbarProps>) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = useCallback(
    (key: keyof UserPassageFilters, value: any) => {
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
      updateFilter('title', e.target.value);
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
      updateFilter('partNumber', values.length > 0 ? values.map(Number) : undefined);
    },
    [updateFilter]
  );

  return (
    <Card className='mb-6 py-4'>
      <CardContent>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Filter className='h-4 w-4' />
            <Label className='text-sm font-medium'>Filters</Label>
            {isLoading && <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />}
            {hasActiveFilters && (
              <span className='bg-blue-600 text-primary-foreground text-xs px-2 py-1 rounded-full'>
                {activeFilterCount}
              </span>
            )}
          </div>
          <div className='flex items-center gap-2'>
            {hasActiveFilters && (
              <Button variant='outline' size='sm' onClick={onClearFilters}>
                <X className='h-4 w-4 mr-2' />
                Clear All
              </Button>
            )}
            <Button variant='outline' size='sm' onClick={handleToggleExpanded}>
              {isExpanded ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className='grid mt-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='title'>Search</Label>
              <Input
                id='title'
                placeholder='Search by title...'
                value={filters.title ?? ''}
                onChange={handleTitleChange}
              />
            </div>

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
                selected={Array.isArray(filters.partNumber) ? filters.partNumber.map(String) : []}
                onChange={handlePartNumberChange}
                placeholder='Select parts'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='sortBy'>Sort By</Label>
              <div className='flex'>
                <Select value={sortBy} onValueChange={onSortByChange}>
                  <SelectTrigger className='flex-1'>
                    <SelectValue placeholder='Sort by...' />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='sortDirection'>Sort Direction</Label>
              <div className='flex'>
                <Select value={sortDirection} onValueChange={onSortDirectionChange}>
                  <SelectTrigger className='flex-1'>
                    <SelectValue placeholder='Sort direction...' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='asc'>Ascending</SelectItem>
                    <SelectItem value='desc'>Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
