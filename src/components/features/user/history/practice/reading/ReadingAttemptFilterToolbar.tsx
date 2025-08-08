'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Filter, Loader2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
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
import { ReadingAttemptFilters } from '@/store/slices/reading-attempt-filter-slice';
import {
  ieltsTypeOptions,
  isUUID,
  partNumberOptions,
  questionCategoryOptions,
} from '@/utils/filter';
import { useDebounce } from '@uidotdev/usehooks';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';

interface ReadingAttemptFilterToolbarProps {
  filters: ReadingAttemptFilters;
  onFiltersChange: (filters: ReadingAttemptFilters) => void;
  onClearFilters: () => void;
  isLoading: boolean;
}

const sortOptions = [
  { value: 'createdAt', label: 'Created Date' },
  { value: 'title', label: 'Title' },
  { value: 'ieltsType', label: 'IELTS Type' },
  { value: 'partNumber', label: 'Part Number' },
];

export const ReadingAttemptFilterToolbar = memo(function ReadingAttemptFilterToolbar({
  filters,
  onFiltersChange,
  onClearFilters,
  isLoading = false,
}: Readonly<ReadingAttemptFilterToolbarProps>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.searchText || '');
  const [passageId, setPassageId] = useState(filters.passageId || '');
  const [error, setError] = useState<Record<string, string | null>>({});
  const debouncedSearchTerm = useDebounce(searchTerm, 800);
  const debouncedPassageId = useDebounce(passageId, 800);

  const isValidUUID = useCallback((str: string): boolean => {
    return isUUID(str);
  }, []);

  const updateFilter = useCallback(
    (key: keyof ReadingAttemptFilters, value: any) => {
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

  const handleSortDirectionChange = useCallback(() => {
    updateFilter('sortDirection', filters.sortDirection === 'asc' ? 'desc' : 'asc');
  }, [filters, updateFilter]);

  const handleQuestionCategoryChange = useCallback(
    (value: string) => {
      updateFilter('questionCategory', value);
    },
    [updateFilter]
  );

  const handleClearPassageId = useCallback(() => {
    setPassageId('');
    updateFilter('passageId', '');
    setError((prev) => ({ ...prev, passageId: null }));
  }, [updateFilter]);

  useEffect(() => {
    setSearchTerm(filters.passageId || '');
  }, [filters.passageId]);

  useEffect(() => {
    if (debouncedSearchTerm === filters.passageId) return;
    updateFilter('passageId', debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    setPassageId(filters.passageId || '');
  }, [filters.passageId]);

  useEffect(() => {
    if (debouncedPassageId === filters.passageId) return;
    if (!isValidUUID(debouncedPassageId) && debouncedPassageId) {
      setError((prev) => ({
        ...prev,
        passageId: 'Must be a valid passage ID.',
      }));
      return;
    }
    updateFilter('passageId', debouncedPassageId);
    setError((prev) => ({ ...prev, passageId: null }));
  }, [debouncedPassageId]);

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
          <div className='grid mt-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            <div className='grid grid-cols-2 gap-4 col-span-full'>
              <div className='flex gap-2 justify-between items-end'>
                <div className='space-y-2 flex-1'>
                  <Label htmlFor='title'>Search</Label>
                  <Input
                    id='title'
                    placeholder='Search by title'
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
                      onClick={() => updateFilter('searchText', '')}
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  </div>
                )}
              </div>
              <div className='flex gap-2 justify-between items-end'>
                <div className='space-y-2 flex-1'>
                  <Input
                    id='passageId'
                    placeholder='Search by passage ID'
                    value={passageId}
                    onChange={(e) => setPassageId(e.target.value)}
                    aria-invalid={!!error.passageId}
                    aria-describedby={error.passageId ? 'passageId-error' : undefined}
                  />
                  {error.passageId && (
                    <span
                      id='passageId-error'
                      className='text-red-500 text-xs mt-1 block'
                      role='alert'
                    >
                      {error.passageId}
                    </span>
                  )}
                </div>
                {passageId && (
                  <div>
                    <Button
                      variant='ghost'
                      className='mt-2'
                      size='icon'
                      onClick={handleClearPassageId}
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  </div>
                )}
              </div>
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
            <div className='flex gap-2 items-end justify-between col-span-2'>
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
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
