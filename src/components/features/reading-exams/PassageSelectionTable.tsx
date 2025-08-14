'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { usePassage } from '@/hooks/apis/reading/usePassage';
import { Pagination, PassageGetResponse } from '@/types/reading/reading.types';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import LoadingSpinner from '../../ui/loading-spinner';

interface PassageSelectionTableProps {
  onSelect: (passageId: string, passageTitle: string, partNumber: number) => void;
  selectedPassages: {
    part1: string;
    part2: string;
    part3: string;
  };
}

const ieltsTypeOptions = [
  { value: '0', label: 'Academic' },
  { value: '1', label: 'General Training' },
];

const statusOptions = [
  { value: '4', label: 'Test' }, // Default to Test status
];

const partNumberOptions = [
  { value: '0', label: 'Part 1' },
  { value: '1', label: 'Part 2' },
  { value: '2', label: 'Part 3' },
];

export function PassageSelectionTable({ onSelect, selectedPassages }: PassageSelectionTableProps) {
  const { getPassagesForTeacher, isLoading } = usePassage();

  const [passages, setPassages] = useState<PassageGetResponse[]>([]);
  const [selectedPassageId, setSelectedPassageId] = useState<string>('');
  const [selectedPart, setSelectedPart] = useState<number>(1);

  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  });

  const [filters, setFilters] = useState({
    title: '',
    ieltsType: 0,
    status: 4, // Default to Test status (4)
    partNumber: undefined as number | undefined,
    sortBy: 'updatedAt',
    sortDirection: 'desc',
  });

  const fetchPassages = async () => {
    try {
      const response = await getPassagesForTeacher({
        page: pagination.currentPage,
        size: pagination.pageSize,
        ielts_type: filters.ieltsType,
        status: filters.status,
        part_number: filters.partNumber,
        title: filters.title || undefined,
        sortBy: filters.sortBy,
        sortDirection: filters.sortDirection,
      });

      if (response && response.data && response.pagination) {
        setPassages(response.data);
        setPagination({
          currentPage: response.pagination.currentPage,
          pageSize: response.pagination.pageSize,
          totalItems: response.pagination.totalItems,
          totalPages: response.pagination.totalPages,
          hasPreviousPage: response.pagination.hasPreviousPage,
          hasNextPage: response.pagination.hasNextPage,
        });
      }
    } catch (error) {}
  };

  useEffect(() => {
    fetchPassages();
  }, [
    pagination.currentPage,
    filters.ieltsType,
    filters.status,
    filters.partNumber,
    filters.title,
    filters.sortBy,
    filters.sortDirection,
  ]);

  // Clear incompatible selection when chosen part changes
  useEffect(() => {
    if (!selectedPassageId) return;
    const current = passages.find((p) => p.passage_id === selectedPassageId);
    if (current && current.part_number + 1 !== selectedPart) {
      setSelectedPassageId('');
    }
  }, [selectedPart, passages, selectedPassageId]);

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const handleSort = (field: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: field,
      sortDirection: prev.sortBy === field && prev.sortDirection === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleAddPassage = () => {
    if (selectedPassageId && selectedPart >= 1 && selectedPart <= 3) {
      const passageTitle = getPassageTitle(selectedPassageId);
      onSelect(selectedPassageId, passageTitle, selectedPart);
    }
  };

  const getielts_typeLabel = (type: number): string => {
    switch (type) {
      case 0:
        return 'Academic';
      case 1:
        return 'General Training';
      default:
        return 'Unknown';
    }
  };

  const getStatusLabel = (status: number): string => {
    switch (status) {
      case 0:
        return 'Draft';
      case 1:
        return 'Published';
      case 2:
        return 'Deactivated';
      case 3:
        return 'Finished';
      case 4:
        return 'Test';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: number): string => {
    switch (status) {
      case 0:
        return 'bg-gray-100 text-gray-800';
      case 1:
        return 'bg-green-100 text-green-800';
      case 2:
        return 'bg-red-100 text-red-800';
      case 3:
        return 'bg-blue-100 text-blue-800';
      case 4:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isPassageSelected = (passageId: string): boolean => {
    return (
      selectedPassages.part1 === passageId ||
      selectedPassages.part2 === passageId ||
      selectedPassages.part3 === passageId
    );
  };

  const getAssignedPart = (passageId: string): string => {
    if (selectedPassages.part1 === passageId) return 'Part 1';
    if (selectedPassages.part2 === passageId) return 'Part 2';
    if (selectedPassages.part3 === passageId) return 'Part 3';
    return '';
  };

  const getPassageTitle = (passageId: string): string => {
    const passage = passages.find((p) => p.passage_id === passageId);
    return passage ? passage.title : '';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Reading Passages</CardTitle>
        <CardDescription>
          Choose passages with "Test" status to include in this exam
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='mb-4 space-y-4'>
          <div className='flex flex-col sm:flex-row gap-4'>
            <div className='flex-1'>
              <Label htmlFor='title'>Search by Title</Label>
              <Input
                id='title'
                placeholder='Enter passage title...'
                value={filters.title}
                onChange={(e) => setFilters((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className='flex-1'>
              <Label htmlFor='ieltsType'>IELTS Type</Label>
              <select
                className='w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm'
                value={filters.ieltsType}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, ieltsType: Number(e.target.value) }))
                }
              >
                {ieltsTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className='flex-1'>
              <Label htmlFor='partNumber'>Part Number</Label>
              <select
                className='w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm'
                value={filters.partNumber === undefined ? '' : filters.partNumber}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    partNumber: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
              >
                <option value=''>All Parts</option>
                {partNumberOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className='flex items-center space-x-4'>
            <div>
              <Label htmlFor='part-select'>Add selected passage to:</Label>
              <div className='flex items-center space-x-4 mt-2'>
                <div className='flex items-center space-x-2'>
                  <input
                    type='radio'
                    id='part-1'
                    name='part-select'
                    checked={selectedPart === 1}
                    onChange={() => {
                      setSelectedPart(1);
                    }}
                    className='h-4 w-4'
                  />
                  <Label htmlFor='part-1' className='cursor-pointer'>
                    Part 1
                  </Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <input
                    type='radio'
                    id='part-2'
                    name='part-select'
                    checked={selectedPart === 2}
                    onChange={() => {
                      setSelectedPart(2);
                    }}
                    className='h-4 w-4'
                  />
                  <Label htmlFor='part-2' className='cursor-pointer'>
                    Part 2
                  </Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <input
                    type='radio'
                    id='part-3'
                    name='part-select'
                    checked={selectedPart === 3}
                    onChange={() => {
                      setSelectedPart(3);
                    }}
                    className='h-4 w-4'
                  />
                  <Label htmlFor='part-3' className='cursor-pointer'>
                    Part 3
                  </Label>
                </div>
              </div>
            </div>

            <Button onClick={handleAddPassage} disabled={!selectedPassageId} className='mt-6'>
              Add to Part {selectedPart}
            </Button>
          </div>
        </div>

        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-[50px]'>Select</TableHead>
                <TableHead
                  className='cursor-pointer hover:bg-accent hover:text-accent-foreground'
                  onClick={() => handleSort('title')}
                >
                  Title
                  {filters.sortBy === 'title' &&
                    (filters.sortDirection === 'asc' ? (
                      <ArrowUpIcon className='inline ml-2 h-4 w-4' />
                    ) : (
                      <ArrowDownIcon className='inline ml-2 h-4 w-4' />
                    ))}
                </TableHead>
                <TableHead
                  className='cursor-pointer hover:bg-accent hover:text-accent-foreground'
                  onClick={() => handleSort('ieltsType')}
                >
                  IELTS Type
                  {filters.sortBy === 'ieltsType' &&
                    (filters.sortDirection === 'asc' ? (
                      <ArrowUpIcon className='inline ml-2 h-4 w-4' />
                    ) : (
                      <ArrowDownIcon className='inline ml-2 h-4 w-4' />
                    ))}
                </TableHead>
                <TableHead
                  className='cursor-pointer hover:bg-accent hover:text-accent-foreground'
                  onClick={() => handleSort('partNumber')}
                >
                  Part
                  {filters.sortBy === 'partNumber' &&
                    (filters.sortDirection === 'asc' ? (
                      <ArrowUpIcon className='inline ml-2 h-4 w-4' />
                    ) : (
                      <ArrowDownIcon className='inline ml-2 h-4 w-4' />
                    ))}
                </TableHead>
                <TableHead
                  className='cursor-pointer hover:bg-accent hover:text-accent-foreground'
                  onClick={() => handleSort('status')}
                >
                  Status
                  {filters.sortBy === 'status' &&
                    (filters.sortDirection === 'asc' ? (
                      <ArrowUpIcon className='inline ml-2 h-4 w-4' />
                    ) : (
                      <ArrowDownIcon className='inline ml-2 h-4 w-4' />
                    ))}
                </TableHead>
                <TableHead>Current Assignment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading['getPassagesForTeacher'] ? (
                <TableRow>
                  <TableCell colSpan={6} className='text-center py-8'>
                    <div className='flex items-center justify-center'>
                      <LoadingSpinner color='#737373' />
                      <span className='ml-2 text-muted-foreground'>Loading...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : passages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className='text-center py-8 text-muted-foreground'>
                    No passages found with Test status. Please create passages with Test status
                    first.
                  </TableCell>
                </TableRow>
              ) : (
                passages.map((passage) => (
                  <TableRow key={passage.passage_id}>
                    <TableCell>
                      <input
                        type='radio'
                        name='passage-selection'
                        checked={selectedPassageId === passage.passage_id}
                        onChange={() => setSelectedPassageId(passage.passage_id)}
                        className='h-4 w-4'
                        disabled={passage.part_number + 1 !== selectedPart}
                      />
                    </TableCell>
                    <TableCell className='font-medium'>{passage.title}</TableCell>
                    <TableCell>
                      <Badge variant='outline'>{getielts_typeLabel(passage.ielts_type)}</Badge>
                    </TableCell>
                    <TableCell>Part {passage.part_number + 1}</TableCell>
                    <TableCell>
                      <Badge variant={'outline'} className={getStatusColor(passage.passage_status)}>
                        {getStatusLabel(passage.passage_status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {isPassageSelected(passage.passage_id) && (
                        <Badge variant='secondary'>{getAssignedPart(passage.passage_id)}</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {!isLoading['getPassagesForTeacher'] && passages.length > 0 && (
          <div className='flex items-center justify-between mt-4'>
            <div className='text-sm text-muted-foreground'>
              Showing {(pagination.currentPage - 1) * pagination.pageSize + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of{' '}
              {pagination.totalItems} entries
            </div>
            <div className='flex items-center space-x-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPreviousPage}
              >
                Previous
              </Button>
              <div className='flex items-center space-x-1'>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === pagination.currentPage ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
