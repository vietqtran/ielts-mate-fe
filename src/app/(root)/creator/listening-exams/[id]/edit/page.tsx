'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/ui/loading-spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SlugInput } from '@/components/ui/slug-input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useListeningExam } from '@/hooks/apis/admin/useListeningExam';
import { useListeningTask } from '@/hooks/apis/listening/useListeningTask';
import { ListeningTaskFilterParams } from '@/types/listening/listening.types';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

type PartKey = 'part1_id' | 'part2_id' | 'part3_id' | 'part4_id';
const PARTS: PartKey[] = ['part1_id', 'part2_id', 'part3_id', 'part4_id'];
const PART_LABELS = ['Part 1', 'Part 2', 'Part 3', 'Part 4'];

export default function EditListeningExamPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params.id as string;
  const { getListeningTasksByCreator, isLoading: isLoadingTask } = useListeningTask();
  const {
    getExamById,
    updateExam,
    generateSlug,
    checkSlug,
    isLoading: isLoadingExam,
  } = useListeningExam();

  // Memoize the checkSlug function to prevent infinite re-renders
  const memoizedCheckSlug = useCallback(
    async (slug: string) => {
      return await checkSlug(slug);
    },
    [checkSlug]
  );

  const [tasks, setTasks] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalItems: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [filters, setFilters] = useState<ListeningTaskFilterParams>({
    page: 1,
    size: 10,
    sort_by: 'updatedAt',
    sort_direction: 'desc',
  });

  const [form, setForm] = useState({
    exam_name: '',
    exam_description: '',
    url_slug: '',
    part1_id: '',
    part2_id: '',
    part3_id: '',
    part4_id: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Fetch exam and prefill form
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await getExamById(examId);
        if (response) {
          setForm({
            exam_name: response.exam_name || '',
            exam_description: response.exam_description || '',
            url_slug: response.url_slug || '',
            part1_id: response.part1?.task_id || '',
            part2_id: response.part2?.task_id || '',
            part3_id: response.part3?.task_id || '',
            part4_id: response.part4?.task_id || '',
          });
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsPageLoading(false);
      }
    };
    fetchExam();
  }, [examId]);

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const response = await getListeningTasksByCreator(filters);
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
    // eslint-disable-next-line
  }, [filters]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Unified filter updates like in listings page
  const handleFilterChange = (newFilters: Partial<ListeningTaskFilterParams>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  };

  // Radio selection logic: only one task per part, and a task can't be assigned to multiple parts
  const handleRadioSelect = async (part: PartKey, taskId: string) => {
    try {
      setForm((prev) => {
        const updated = { ...prev };
        PARTS.forEach((p) => {
          if (p !== part && updated[p] === taskId) {
            updated[p] = '';
          }
        });
        updated[part] = taskId;
        return updated;
      });
    } catch (error: any) {
      if (error?.response?.data?.error_code === '000002') {
        toast.error('Please check the correct parts with the list of Listening Task');
      } else {
        toast.error('Failed to update listening exam');
      }
    }
  };

  const handleRemovePart = (part: PartKey) => {
    setForm((prev) => ({ ...prev, [part]: '' }));
  };

  const getTaskById = (taskId: string) => tasks.find((t) => t.task_id === taskId) || null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.exam_name || !form.exam_description || !form.url_slug) {
      toast.error('Please fill all exam info');
      return;
    }
    const partIds = [form.part1_id, form.part2_id, form.part3_id, form.part4_id];
    if (partIds.some((id) => !id)) {
      toast.error('Please select a task for all 4 parts');
      return;
    }
    if (new Set(partIds).size !== 4) {
      toast.error('Each part must be a different task');
      return;
    }
    setSubmitting(true);
    try {
      await updateExam(examId, form);
      toast.success('Listening exam updated successfully');
      router.push(`/creator/listening-exams/${examId}`);
    } catch (error: any) {
      console.log(error);
      if (error.response.data.error_code === '000002') {
        toast.error('Please check the correct parts with the list of Listening Task');
      } else {
        toast.error('Failed to update listening exam');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (isPageLoading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <LoadingSpinner color='black' />
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6'>
      <Card className='mb-8'>
        <CardHeader>
          <CardTitle>Edit Listening Exam</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block font-medium mb-1'>Exam Name</label>
                <Input
                  name='exam_name'
                  value={form.exam_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <SlugInput
                  value={form.url_slug}
                  onChange={(value) => setForm((prev) => ({ ...prev, url_slug: value }))}
                  onGenerateSlug={async () => {
                    return await generateSlug(form.exam_name);
                  }}
                  onCheckSlug={memoizedCheckSlug}
                  examName={form.exam_name}
                  skipValidation={true}
                />
              </div>
            </div>
            <div>
              <label className='block font-medium mb-1'>Description</label>
              <Textarea
                name='exam_description'
                value={form.exam_description}
                onChange={handleInputChange}
                required
                rows={3}
              />
            </div>
            <Button type='submit' disabled={submitting || isLoadingExam.updateExam}>
              {submitting || isLoadingExam.updateExam ? (
                <LoadingSpinner color='white' />
              ) : (
                'Update Exam'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      {/* Selected Parts Table */}
      <Card className='mb-8'>
        <CardHeader>
          <CardTitle>Selected Tasks for Each Part</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Part</TableHead>
                <TableHead>Task Title</TableHead>
                <TableHead>Part Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PARTS.map((part, idx) => {
                const taskId = form[part];
                const task = getTaskById(taskId);
                return (
                  <TableRow key={part}>
                    <TableCell>{PART_LABELS[idx]}</TableCell>
                    <TableCell>
                      {task ? (
                        task.title
                      ) : (
                        <span className='text-muted-foreground'>No task selected</span>
                      )}
                    </TableCell>
                    <TableCell>{task ? task.part_number + 1 : '-'}</TableCell>
                    <TableCell>
                      {task ? (task.status === 1 ? 'Published' : 'Draft') : '-'}
                    </TableCell>
                    <TableCell>
                      {task && (
                        <Button size='sm' variant='outline' onClick={() => handleRemovePart(part)}>
                          Remove
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {/* Main Task Table with filter/search and radio selection */}
      <Card>
        <CardHeader>
          <CardTitle>Available Listening Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filter & Sort toolbar */}
          <div className='mb-4 flex flex-col gap-3 md:flex-row md:items-center'>
            <div className='flex-1'>
              <Input
                placeholder='Search by title...'
                value={filters.title || ''}
                onChange={(e) => handleFilterChange({ title: e.target.value })}
              />
            </div>
            <div className='flex gap-2 items-center'>
              <Select
                value={
                  Array.isArray(filters.part_number) && filters.part_number.length > 0
                    ? String(Number(filters.part_number[0]) + 1)
                    : ''
                }
                onValueChange={(v) =>
                  handleFilterChange({
                    part_number: v && v !== 'all' ? [String(Number(v) - 1)] : undefined,
                  })
                }
              >
                <SelectTrigger className='w-[140px]'>
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

              <Select
                value={
                  Array.isArray(filters.status) && filters.status.length > 0
                    ? String(filters.status[0])
                    : ''
                }
                onValueChange={(v) => handleFilterChange({ status: v === 'all' ? undefined : [v] })}
              >
                <SelectTrigger className='w-[150px]'>
                  <SelectValue placeholder='All Statuses' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Statuses</SelectItem>
                  <SelectItem value='1'>Published</SelectItem>
                  <SelectItem value='0'>Draft</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant='outline'
                onClick={() =>
                  handleFilterChange({
                    sort_by: 'updatedAt',
                    sort_direction:
                      filters.sort_by === 'updatedAt' ? filters.sort_direction : 'desc',
                  })
                }
              >
                Sort: Updated At{' '}
                {filters.sort_by === 'updatedAt' ? (
                  filters.sort_direction === 'asc' ? (
                    <ArrowUp className='ml-2 h-4 w-4' />
                  ) : (
                    <ArrowDown className='ml-2 h-4 w-4' />
                  )
                ) : (
                  <ArrowUpDown className='ml-2 h-4 w-4 text-muted-foreground' />
                )}
              </Button>
              <Button
                variant='outline'
                onClick={() =>
                  handleFilterChange({
                    sort_by: 'createdAt',
                    sort_direction:
                      filters.sort_by === 'createdAt' ? filters.sort_direction : 'desc',
                  })
                }
              >
                Sort: Created At{' '}
                {filters.sort_by === 'createdAt' ? (
                  filters.sort_direction === 'asc' ? (
                    <ArrowUp className='ml-2 h-4 w-4' />
                  ) : (
                    <ArrowDown className='ml-2 h-4 w-4' />
                  )
                ) : (
                  <ArrowUpDown className='ml-2 h-4 w-4 text-muted-foreground' />
                )}
              </Button>
              <Button
                variant='outline'
                title='Toggle sort direction'
                onClick={() =>
                  handleFilterChange({
                    sort_direction: filters.sort_direction === 'asc' ? 'desc' : 'asc',
                  })
                }
              >
                {filters.sort_direction === 'asc' ? (
                  <ArrowUp className='h-4 w-4' />
                ) : (
                  <ArrowDown className='h-4 w-4' />
                )}
              </Button>
              <Button
                variant='ghost'
                onClick={() =>
                  setFilters({ page: 1, size: 10, sort_by: 'updatedAt', sort_direction: 'desc' })
                }
              >
                Clear
              </Button>
            </div>
          </div>

          {isLoadingTask['getListeningTasksByCreator'] ? (
            <div className='flex justify-center py-8'>
              <LoadingSpinner />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Part</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    {PART_LABELS.map((label) => (
                      <TableHead key={label}>{label}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className='text-center py-6'>
                        No listening tasks found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    tasks.map((task) => (
                      <TableRow key={task.task_id}>
                        <TableCell>{task.title}</TableCell>
                        <TableCell>{task.part_number + 1}</TableCell>
                        <TableCell>{task.status === 1 ? 'Published' : 'Draft'}</TableCell>
                        <TableCell>
                          {task.created_at ? new Date(task.created_at).toLocaleString() : ''}
                        </TableCell>
                        {PARTS.map((part) => (
                          <TableCell key={part} className='text-center'>
                            <input
                              type='radio'
                              name={part}
                              value={task.task_id}
                              checked={form[part] === task.task_id}
                              onChange={() => handleRadioSelect(part, task.task_id)}
                              disabled={
                                Object.values(form).includes(task.task_id) &&
                                form[part] !== task.task_id
                              }
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {/* Pagination Controls */}
              <div className='mt-4 flex items-center justify-between'>
                <div className='text-sm text-muted-foreground'>
                  Page {pagination.currentPage} of {pagination.totalPages}
                </div>
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    onClick={() => handlePageChange(Math.max(1, pagination.currentPage - 1))}
                    disabled={!pagination.hasPreviousPage}
                  >
                    Previous
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() =>
                      handlePageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))
                    }
                    disabled={!pagination.hasNextPage}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
