'use client';

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
import {
  IeltsListeningType,
  ListeningTaskFilterParams,
  ListeningTaskStatus,
} from '@/types/listening.types';
import React, { useEffect, useState } from 'react';

interface ListeningTaskFilterToolbarProps {
  filters: ListeningTaskFilterParams;
  onFilterChange: (filters: Partial<ListeningTaskFilterParams>) => void;
}

export function ListeningTaskFilterToolbar({
  filters,
  onFilterChange,
}: Readonly<ListeningTaskFilterToolbarProps>) {
  const [title, setTitle] = useState<string>('');

  useEffect(() => {
    setTitle(filters.title ?? '');
  }, [filters.title]);

  const handleTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ title });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleTitleClear = () => {
    setTitle('');
    onFilterChange({ title: '' });
  };

  const handleIeltsTypeChange = (value: string) => {
    onFilterChange({ ielts_type: value === 'all' ? undefined : value });
  };

  const handlePartNumberChange = (value: string) => {
    onFilterChange({ part_number: value === 'all' ? undefined : value });
  };

  const handleStatusChange = (value: string) => {
    onFilterChange({ status: value === 'all' ? undefined : value });
  };

  const handleSortDirectionChange = (value: string) => {
    onFilterChange({ sort_direction: value });
  };

  const handleSortByChange = (value: string) => {
    onFilterChange({ sort_by: value });
  };

  const handleResetFilters = () => {
    setTitle('');
    onFilterChange({
      title: '',
      ielts_type: undefined,
      part_number: undefined,
      status: undefined,
      sort_by: 'updatedAt',
      sort_direction: 'desc',
    });
  };

  return (
    <div className='space-y-4 p-4 border rounded-md bg-gray-50'>
      <div className='flex flex-col md:flex-row gap-4'>
        <div className='flex-1'>
          <form onSubmit={handleTitleSubmit} className='flex space-x-2'>
            <div className='flex-1'>
              <Label htmlFor='title' className='sr-only'>
                Title
              </Label>
              <Input
                id='title'
                placeholder='Search by title...'
                value={title}
                onChange={handleTitleChange}
              />
            </div>
            <Button type='submit' variant='secondary'>
              Search
            </Button>
            {title && (
              <Button type='button' variant='ghost' onClick={handleTitleClear}>
                Clear
              </Button>
            )}
          </form>
        </div>
      </div>

      <div className='flex items-center flex-wrap gap-10'>
        <div className='flex items-center gap-1.5'>
          <Label htmlFor='ieltsType'>IELTS Type</Label>
          <Select value={filters.ielts_type ?? 'all'} onValueChange={handleIeltsTypeChange}>
            <SelectTrigger id='ieltsType'>
              <SelectValue placeholder='All Types' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Types</SelectItem>
              <SelectItem value={IeltsListeningType.ACADEMIC.toString()}>Academic</SelectItem>
              <SelectItem value={IeltsListeningType.GENERAL_TRAINING.toString()}>
                General Training
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='flex items-center gap-1.5'>
          <Label htmlFor='partNumber'>Part Number</Label>
          <Select value={filters.part_number ?? 'all'} onValueChange={handlePartNumberChange}>
            <SelectTrigger id='partNumber'>
              <SelectValue placeholder='All Parts' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Parts</SelectItem>
              <SelectItem value='1'>Part 1</SelectItem>
              <SelectItem value='2'>Part 2</SelectItem>
              <SelectItem value='3'>Part 3</SelectItem>
              <SelectItem value='4'>Part 4</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='flex items-center gap-1.5'>
          <Label htmlFor='status'>Status</Label>
          <Select value={filters.status ?? 'all'} onValueChange={handleStatusChange}>
            <SelectTrigger id='status'>
              <SelectValue placeholder='All Statuses' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Statuses</SelectItem>
              <SelectItem value={ListeningTaskStatus.DRAFT.toString()}>Draft</SelectItem>
              <SelectItem value={ListeningTaskStatus.PUBLISHED.toString()}>Published</SelectItem>
              <SelectItem value={ListeningTaskStatus.DEACTIVATED.toString()}>
                Deactivated
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='flex items-center gap-1.5'>
          <Label htmlFor='sortBy'>Sort By</Label>
          <Select value={filters.sort_by ?? 'updatedAt'} onValueChange={handleSortByChange}>
            <SelectTrigger id='sortBy'>
              <SelectValue placeholder='Sort By' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='updatedAt'>Last Updated</SelectItem>
              <SelectItem value='createdAt'>Created Date</SelectItem>
              <SelectItem value='title'>Title</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='flex items-center gap-1.5'>
          <Label htmlFor='sortDirection'>Direction</Label>
          <Select
            value={filters.sort_direction ?? 'desc'}
            onValueChange={handleSortDirectionChange}
          >
            <SelectTrigger id='sortDirection'>
              <SelectValue placeholder='Direction' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='desc'>Descending</SelectItem>
              <SelectItem value='asc'>Ascending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className='flex justify-end'>
        <Button variant='outline' onClick={handleResetFilters}>
          Reset Filters
        </Button>
      </div>
    </div>
  );
}
