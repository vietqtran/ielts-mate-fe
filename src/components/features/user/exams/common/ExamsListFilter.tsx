'use client';

import { ArrowDown, ArrowUp, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ListeningExamAttemptFilters } from '@/store/slices/listening-exam-attempt-filter-slice';
import { useDebounce } from '@uidotdev/usehooks';
import React, { useState, useCallback, useMemo, memo, useEffect } from 'react';

interface ExamListFilterProps {
  searchText?: string;
  sortDirection?: 'asc' | 'desc' | '';
  sortBy?: string;
}

interface ExamListFilterToolbarProps {
  filters: ExamListFilterProps;
  onFiltersChange: (filters: ExamListFilterProps) => void;
  onClearFilters: () => void;
  isLoading?: boolean;
}

const sortOptions = [
  { value: 'updatedAt', label: 'Finished At' },
  { value: 'totalPoints', label: 'Score' },
  { value: 'duration', label: 'Duration' },
  { value: 'createdAt', label: 'Created At' },
];

export const ExamsListFilter = memo(function ExamsListFilterToolbar({
  filters,
  onFiltersChange,
  onClearFilters,
  isLoading = false,
}: Readonly<ExamListFilterToolbarProps>) {
  const [searchTerm, setSearchTerm] = useState(filters.searchText || '');
  const debouncedSearchTerm = useDebounce(searchTerm, 800);

  const updateFilter = useCallback(
    (key: keyof ListeningExamAttemptFilters['filters'], value: any) => {
      onFiltersChange({
        ...filters,
        [key]: value === '' || (Array.isArray(value) && value.length === 0) ? undefined : value,
      });
    },
    [filters, onFiltersChange]
  );

  const handleSortDirectionToggle = useCallback(() => {
    onFiltersChange({
      ...filters,
      sortDirection: filters.sortDirection === 'asc' ? 'desc' : 'asc',
    });
  }, [filters, onFiltersChange]);

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some((value) => {
      return value !== undefined && value !== 'createdAt';
    });
  }, [filters]);

  const handleSearchTextChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    [updateFilter]
  );

  useEffect(() => {
    if (debouncedSearchTerm !== filters.searchText) {
      updateFilter('searchText', debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, filters.searchText]);

  return (
    <div className='space-y-4'>
      {/* Main toolbar row */}
      <div className='flex flex-col sm:flex-row gap-4'>
        {/* Title search - grows to fill row */}
        <div className='flex-1 flex gap-2 items-center min-w-0'>
          <div className='flex-1 min-w-0'>
            <Input
              placeholder='Search by exam name...'
              value={searchTerm}
              onChange={handleSearchTextChange}
            />
          </div>
          {searchTerm && searchTerm.length > 0 && (
            <Button variant='outline' onClick={() => setSearchTerm('')} disabled={isLoading}>
              <X className='h-4 w-4' />
              Clear search
            </Button>
          )}
        </div>

        {/* Sort controls - don't grow */}
        <div className='flex gap-2 items-center'>
          <Select
            value={filters.sortBy}
            onValueChange={(value) => {
              onFiltersChange({
                ...filters,
                sortBy: value,
              });
            }}
            disabled={isLoading}
          >
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
          <Button variant='outline' onClick={handleSortDirectionToggle} disabled={isLoading}>
            {filters.sortDirection === 'asc' ? <ArrowDown /> : <ArrowUp />}
          </Button>
        </div>

        {/* Clear filters button */}
        {hasActiveFilters && (
          <Button
            variant='ghost'
            onClick={onClearFilters}
            disabled={isLoading}
            className='flex items-center gap-2 text-muted-foreground hover:text-foreground'
          >
            <X className='h-4 w-4' />
            Clear
          </Button>
        )}
      </div>

      {/* Loading indicator
      {isLoading && (
        <div className='flex items-center justify-center py-2'>
          <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
          <span className='text-sm text-muted-foreground ml-2'>Loading...</span>
        </div>
      )} */}
    </div>
  );
});

export default ExamsListFilter;
