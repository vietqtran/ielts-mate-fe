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
import { useListeningTask } from '@/hooks/apis/listening/useListeningTask';
import { ListeningTaskFilterParamsCamelCase } from '@/types/listening/listening.types';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import LoadingSpinner from '../../ui/loading-spinner';

interface TaskSelectionTableProps {
  onSelect: (taskId: string, taskTitle: string, partNumber: number) => void;
  selectedTasks: {
    part1: string;
    part2: string;
    part3: string;
    part4: string;
  };
}

const partNumberOptions = [
  { value: '0', label: 'Part 1' },
  { value: '1', label: 'Part 2' },
  { value: '2', label: 'Part 3' },
  { value: '3', label: 'Part 4' },
];

const statusOptions = [
  { value: '4', label: 'Test' }, // Default to Test status
];

export function TaskSelectionTable({ onSelect, selectedTasks }: TaskSelectionTableProps) {
  const { getListeningTasksByCreator, isLoading } = useListeningTask();

  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [selectedPart, setSelectedPart] = useState<number>(1);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalItems: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [filters, setFilters] = useState<ListeningTaskFilterParamsCamelCase>({
    page: 1,
    size: 10,
    title: '',
    status: ['4'], // Default to Test status (4)
    partNumber: [String(selectedPart - 1)], // Filter by selected part
    sortBy: 'updatedAt',
    sortDirection: 'desc',
  });

  const fetchTasks = async () => {
    try {
      // Filter out null/empty values before sending to API
      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        // Skip empty strings, empty arrays, null, undefined
        if (
          value === '' ||
          value === null ||
          value === undefined ||
          (Array.isArray(value) && value.length === 0)
        ) {
          return acc;
        }

        acc[key] = value;
        return acc;
      }, {} as any);

      const response = await getListeningTasksByCreator(cleanFilters);
      if (response) {
        setTasks(response.data);
        if (response.pagination) setPagination(response.pagination);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  // Update filters when selected part changes
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      partNumber: [String(selectedPart - 1)], // Convert to 0-based index for API
      page: 1,
    }));
  }, [selectedPart]);

  // Helper functions
  const getStatusLabel = (status: number): string => {
    switch (status) {
      case 4:
        return 'Test';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: number): string => {
    switch (status) {
      case 4:
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const isTaskSelected = (taskId: string): boolean => {
    return Object.values(selectedTasks).includes(taskId);
  };

  const getAssignedPart = (taskId: string): string => {
    if (selectedTasks.part1 === taskId) return 'Part 1';
    if (selectedTasks.part2 === taskId) return 'Part 2';
    if (selectedTasks.part3 === taskId) return 'Part 3';
    if (selectedTasks.part4 === taskId) return 'Part 4';
    return '';
  };

  const getTaskTitle = (taskId: string): string => {
    const task = tasks.find((t) => t.task_id === taskId);
    return task ? task.title : '';
  };

  // Filter and pagination handlers
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  };

  const handleSort = (sortBy: string) => {
    const newDirection =
      filters.sortBy === sortBy && filters.sortDirection === 'asc' ? 'desc' : 'asc';
    setFilters((prev) => ({
      ...prev,
      sortBy: sortBy,
      sortDirection: newDirection,
      page: 1,
    }));
  };

  const handleAddTask = () => {
    if (selectedTaskId && selectedPart >= 1 && selectedPart <= 4) {
      const taskTitle = getTaskTitle(selectedTaskId);
      onSelect(selectedTaskId, taskTitle, selectedPart);
      setSelectedTaskId('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Listening Tasks</CardTitle>
        <CardDescription>
          Choose tasks with "Test" status to include in this exam. The table automatically shows
          only tasks for the selected part.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='mb-4 space-y-4'>
          <div className='flex flex-col sm:flex-row gap-4'>
            <div className='flex-1'>
              <Label htmlFor='title'>Search by Title</Label>
              <Input
                id='title'
                placeholder='Enter task title...'
                value={filters.title || ''}
                onChange={(e) => setFilters((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className='flex-1'>
              <Label htmlFor='partNumber'>Part Number (Auto-filtered)</Label>
              <select
                className='w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm bg-gray-50'
                value={selectedPart - 1}
                disabled
              >
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
              <Label htmlFor='part-select'>
                Select Part (Table will show only tasks for this part):
              </Label>
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
                <div className='flex items-center space-x-2'>
                  <input
                    type='radio'
                    id='part-4'
                    name='part-select'
                    checked={selectedPart === 4}
                    onChange={() => {
                      setSelectedPart(4);
                    }}
                    className='h-4 w-4'
                  />
                  <Label htmlFor='part-4' className='cursor-pointer'>
                    Part 4
                  </Label>
                </div>
              </div>
            </div>

            <Button
              onClick={handleAddTask}
              disabled={!selectedTaskId}
              className='mt-6 bg-selective-yellow-300 text-white hover:bg-selective-yellow-300/90'
            >
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
              {isLoading['getListeningTasksByCreator'] ? (
                <TableRow>
                  <TableCell colSpan={5} className='text-center py-8'>
                    <LoadingSpinner />
                  </TableCell>
                </TableRow>
              ) : tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className='text-center py-6'>
                    No listening tasks found.
                  </TableCell>
                </TableRow>
              ) : (
                tasks.map((task) => (
                  <TableRow key={task.task_id}>
                    <TableCell>
                      <input
                        type='radio'
                        name='task-selection'
                        checked={selectedTaskId === task.task_id}
                        onChange={() => setSelectedTaskId(task.task_id)}
                        className='h-4 w-4'
                      />
                    </TableCell>
                    <TableCell className='font-medium max-w-[200px]'>
                      <div className='truncate' title={task.title}>
                        {task.title}
                      </div>
                    </TableCell>
                    <TableCell className='max-w-[80px]'>
                      <div title={`Part: ${task.part_number + 1}`}>Part {task.part_number + 1}</div>
                    </TableCell>
                    <TableCell className='max-w-[120px]'>
                      <Badge
                        variant='outline'
                        className={getStatusColor(task.status)}
                        title={`Status: ${getStatusLabel(task.status)}`}
                      >
                        {getStatusLabel(task.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className='max-w-[120px]'>
                      {isTaskSelected(task.task_id) && (
                        <Badge
                          variant='secondary'
                          title={`Assigned to: ${getAssignedPart(task.task_id)}`}
                        >
                          {getAssignedPart(task.task_id)}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {!isLoading['getListeningTasksByCreator'] && tasks.length > 0 && (
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
