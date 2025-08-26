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
import { ListeningTasksFilters } from '@/store/slices/listening-filter-slice';
import { ieltsTypeOptions, partNumberOptions } from '@/utils/filter';
import { useDebounce } from '@uidotdev/usehooks';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';

interface UserListeningTasksFilterToolbarProps {
  filters: ListeningTasksFilters;
  onFiltersChange: (filters: ListeningTasksFilters) => void;
  onClearFilters: () => void;
  isLoading: boolean;
  createdByOptions: { value: string; label: string }[];
}

const sortOptions = [
  { value: 'createdAt', label: 'Created Date' },
  { value: 'title', label: 'Title' },
  { value: 'ieltsType', label: 'IELTS Type' },
  { value: 'partNumber', label: 'Part Number' },
];

export const UserListeningTasksFilterToolbar = memo(function UserListeningTasksFilterToolbar({
  filters,
  onFiltersChange,
  onClearFilters,
  isLoading = false,
  createdByOptions = [],
}: Readonly<UserListeningTasksFilterToolbarProps>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.title || '');
  const debouncedSearchTerm = useDebounce(searchTerm, 800);

  const updateFilter = useCallback(
    (key: keyof ListeningTasksFilters, value: any) => {
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

  const handleSortByChange = useCallback(
    (value: string) => {
      updateFilter('sortBy', value);
    },
    [updateFilter]
  );

  const handleCreatedByChange = useCallback(
    (value: string) => {
      updateFilter('createdBy', value);
    },
    [updateFilter]
  );

  const handleSortDirectionChange = useCallback(() => {
    updateFilter('sortDirection', filters.sortDirection === 'asc' ? 'desc' : 'asc');
  }, [filters, updateFilter]);

  const handleQuestionCategoryChange = useCallback(
    (value: string) => {
      updateFilter('questionCategory', value);
    },
    [updateFilter]
  );

  useEffect(() => {
    setSearchTerm(filters.title || '');
  }, [filters.title]);

  useEffect(() => {
    if (debouncedSearchTerm === filters.title) return;
    updateFilter('title', debouncedSearchTerm);
  }, [debouncedSearchTerm]);

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
                <X className='h-4 w-4' />
                Clear All
              </Button>
            )}
            <Button variant='outline' size='sm' onClick={handleToggleExpanded}>
              {isExpanded ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className='grid mt-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <div className='col-span-full flex gap-2 justify-between items-end'>
              <div className='space-y-2 flex-1'>
                <Label htmlFor='title'>Search</Label>
                <Input
                  id='title'
                  placeholder='Search by title...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {searchTerm && (
                <div>
                  <Button
                    variant='ghost'
                    className='mt-2'
                    size='icon'
                    onClick={() => updateFilter('title', '')}
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>
              )}
            </div>

            <div className='flex gap-2 items-end justify-between'>
              <div className='space-y-2 flex-1'>
                <Label htmlFor='ieltsType'>IELTS Type</Label>
                <MultiSelect
                  options={ieltsTypeOptions}
                  selected={filters.ieltsType?.map(String) || []}
                  onChange={handleIeltsTypeChange}
                  placeholder='Select IELTS types'
                />
              </div>
              {filters.ieltsType && filters.ieltsType.length > 0 && (
                <Button variant='ghost' size='icon' onClick={() => updateFilter('ieltsType', [])}>
                  <X className='h-4 w-4' />
                </Button>
              )}
            </div>

            <div className='flex gap-2 items-end justify-between'>
              <div className='space-y-2 flex-1'>
                <Label htmlFor='partNumber'>Part Number</Label>
                <MultiSelect
                  options={partNumberOptions}
                  selected={Array.isArray(filters.partNumber) ? filters.partNumber.map(String) : []}
                  onChange={handlePartNumberChange}
                  placeholder='Select parts'
                />
              </div>
              {Array.isArray(filters.partNumber) && filters.partNumber.length > 0 && (
                <Button variant='ghost' size='icon' onClick={() => updateFilter('partNumber', [])}>
                  <X className='h-4 w-4' />
                </Button>
              )}
            </div>

            <div className='flex gap-2 items-end justify-between'>
              <div className='space-y-2 flex-1'>
                <Label htmlFor='sortBy'>Sort By</Label>
                <Select value={filters.sortBy} onValueChange={handleSortByChange}>
                  <SelectTrigger className='w-full' id='sortBy'>
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
              </div>
              {filters.sortBy && (
                <Button variant='ghost' size='icon' onClick={() => updateFilter('sortBy', '')}>
                  <X className='h-4 w-4' />
                </Button>
              )}
            </div>

            <div className='flex gap-2 items-end justify-between'>
              <div className='space-y-2 flex-1'>
                <Label htmlFor='sortDirection'>Sort Direction</Label>
                <Select value={filters.sortDirection} onValueChange={handleSortDirectionChange}>
                  <SelectTrigger className='w-full' id='sortDirection'>
                    <SelectValue placeholder='Sort direction' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='asc'>Ascending</SelectItem>
                    <SelectItem value='desc'>Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {filters.sortDirection && (
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => updateFilter('sortDirection', '')}
                >
                  <X className='h-4 w-4' />
                </Button>
              )}
            </div>
            {/* <div className='flex gap-2 items-end justify-between'>
              <div className='space-y-2 flex-1'>
                <Label htmlFor='createdBy'>Created By</Label>
                <Combobox
                  options={createdByOptions}
                  value={filters.createdBy}
                  onValueChange={handleCreatedByChange}
                  placeholder='Select creator'
                  className='w-full'
                />
              </div>
              {filters.createdBy && (
                <Button variant='ghost' size='icon' onClick={() => updateFilter('createdBy', '')}>
                  <X className='h-4 w-4' />
                </Button>
              )}
            </div> */}
            {/* <div className='flex gap-2 items-end justify-between'>
              <div className='space-y-2 flex-1'>
                <Label htmlFor='questionCategory'>Question Category</Label>
                <Combobox
                  options={questionCategoryOptions}
                  value={filters.questionCategory}
                  onValueChange={handleQuestionCategoryChange}
                  placeholder='Select question category'
                  className='w-full'
                />
              </div>
              {filters.questionCategory && (
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => updateFilter('questionCategory', '')}
                >
                  <X className='h-4 w-4' />
                </Button>
              )}
            </div> */}
          </div>
        )}
      </CardContent>
    </Card>
  );
});
