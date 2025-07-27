'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Filter, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PassageFilters } from '@/store/slices/passage-slice';
import { useState } from 'react';

interface PassageFilterToolbarProps {
  filters: PassageFilters;
  onFiltersChange: (filters: PassageFilters) => void;
  onClearFilters: () => void;
}

const ieltsTypeOptions = [
  { value: '0', label: 'Academic' },
  { value: '1', label: 'General Training' },
];

const statusOptions = [
  { value: '0', label: 'Draft' },
  { value: '1', label: 'Published' },
  { value: '4', label: 'Test' },
];

const partNumberOptions = [
  { value: '0', label: 'Part 1' },
  { value: '1', label: 'Part 2' },
  { value: '2', label: 'Part 3' },
];

export function PassageFilterToolbar({
  filters,
  onFiltersChange,
  onClearFilters,
}: Readonly<PassageFilterToolbarProps>) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof PassageFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value === '' || (Array.isArray(value) && value.length === 0) ? undefined : value,
    });
  };

  const hasActiveFilters = Object.values(filters).some((value) => {
    return value !== undefined && value !== '';
  });

  const getActiveFilterCount = () => {
    return Object.values(filters).filter((value) => {
      return value !== undefined && value !== '';
    }).length;
  };

  return (
    <Card className='mb-6 py-4'>
      <CardContent>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Filter className='h-4 w-4' />
            <Label className='text-sm font-medium'>Filters</Label>
            {hasActiveFilters && (
              <span className='bg-red-600 text-primary-foreground text-xs px-2 py-1 rounded-full'>
                {getActiveFilterCount()}
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
            <Button variant='outline' size='sm' onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className='grid mt-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='title'>Title</Label>
              <Input
                id='title'
                placeholder='Search by title...'
                value={filters.title ?? ''}
                onChange={(e) => updateFilter('title', e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='ieltsType'>IELTS Type</Label>
              <Select
                value={filters.ieltsType?.toString() || ''}
                onValueChange={(value) =>
                  updateFilter('ieltsType', value ? Number(value) : undefined)
                }
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select IELTS type' />
                </SelectTrigger>
                <SelectContent>
                  {ieltsTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='status'>Status</Label>
              <Select
                value={filters.status?.toString() || ''}
                onValueChange={(value) => updateFilter('status', value ? Number(value) : undefined)}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select status' />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='partNumber'>Part Number</Label>
              <Select
                value={filters.partNumber?.toString() || ''}
                onValueChange={(value) =>
                  updateFilter('partNumber', value ? Number(value) : undefined)
                }
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select part number' />
                </SelectTrigger>
                <SelectContent>
                  {partNumberOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='questionCategory'>Question Category</Label>
              <Input
                id='questionCategory'
                placeholder='Enter category...'
                value={filters.questionCategory ?? ''}
                onChange={(e) => updateFilter('questionCategory', e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='createdBy'>Created By</Label>
              <Input
                id='createdBy'
                placeholder='Search by creator...'
                value={filters.createdBy ?? ''}
                onChange={(e) => updateFilter('createdBy', e.target.value)}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
