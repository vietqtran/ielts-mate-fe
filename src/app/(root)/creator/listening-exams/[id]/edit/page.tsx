'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
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
import { ListeningTaskFilterParamsCamelCase } from '@/types/listening/listening.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

// Form validation schema
const formSchema = z
  .object({
    exam_name: z.string().min(3, 'Exam name must be at least 3 characters'),
    exam_description: z.string().min(10, 'Description must be at least 10 characters'),
    url_slug: z.string().min(3, 'URL slug must be at least 3 characters'),
    part1_id: z.string().min(1, 'Task for part 1 is required'),
    part2_id: z.string().min(1, 'Task for part 2 is required'),
    part3_id: z.string().min(1, 'Task for part 3 is required'),
    part4_id: z.string().min(1, 'Task for part 4 is required'),
  })
  .refine(
    (data) => {
      const partIds = [data.part1_id, data.part2_id, data.part3_id, data.part4_id];
      return new Set(partIds).size === 4;
    },
    {
      message: 'Each part must be a different task',
      path: ['part1_id'], // This will show the error on the first part field
    }
  );

type FormValues = z.infer<typeof formSchema>;

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
  const [filters, setFilters] = useState<ListeningTaskFilterParamsCamelCase>({
    page: 1,
    size: 10,
    sortBy: 'updatedAt',
    sortDirection: 'desc',
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      exam_name: '',
      exam_description: '',
      url_slug: '',
      part1_id: '',
      part2_id: '',
      part3_id: '',
      part4_id: '',
    },
  });

  const [isPageLoading, setIsPageLoading] = useState(true);

  // Fetch exam and prefill form
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await getExamById(examId);
        if (response) {
          form.reset({
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
  }, [examId, form]);

  // Fetch tasks
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
    // eslint-disable-next-line
  }, [filters]);

  // Unified filter updates like in listings page
  const handleFilterChange = (newFilters: Partial<ListeningTaskFilterParamsCamelCase>) => {
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
      const currentValues = form.getValues();
      const updatedValues = { ...currentValues };
      PARTS.forEach((p) => {
        if (p !== part && updatedValues[p] === taskId) {
          updatedValues[p] = '';
        }
      });
      updatedValues[part] = taskId;
      form.reset(updatedValues);
    } catch (error: any) {
      if (error?.response?.data?.error_code === '000002') {
        toast.error('Please check the correct parts with the list of Listening Task');
      } else {
        toast.error('Failed to update listening exam');
      }
    }
  };

  const handleRemovePart = (part: PartKey) => {
    form.setValue(part, '');
  };

  const getTaskById = (taskId: string) => tasks.find((t) => t.task_id === taskId) || null;

  const onSubmit = async (values: FormValues) => {
    try {
      // Check if all parts are selected
      const partIds = [values.part1_id, values.part2_id, values.part3_id, values.part4_id];
      const missingParts = partIds.filter((id) => !id);

      if (missingParts.length > 0) {
        toast.error(`Vui lòng chọn đủ 4 parts. Còn thiếu ${missingParts.length} part(s).`);
        return;
      }

      // Check if all parts are different
      const uniqueParts = new Set(partIds);
      if (uniqueParts.size !== 4) {
        toast.error('Mỗi part phải là một task khác nhau. Vui lòng kiểm tra lại.');
        return;
      }

      await updateExam(examId, values);
      toast.success('Listening exam updated successfully');
      router.push(`/creator/listening-exams/${examId}`);
    } catch (error: any) {
      console.log(error);
      if (error.response?.data?.error_code === '000002') {
        toast.error('Please check the correct parts with the list of Listening Task');
      } else {
        toast.error('Có lỗi xảy ra khi cập nhật listening exam. Vui lòng thử lại.');
      }
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='exam_name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exam Name</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter exam name' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='url_slug'
                  render={({ field }) => (
                    <SlugInput
                      value={field.value}
                      onChange={field.onChange}
                      onGenerateSlug={async () => {
                        return await generateSlug(form.getValues('exam_name'));
                      }}
                      onCheckSlug={memoizedCheckSlug}
                      examName={form.getValues('exam_name')}
                      skipValidation={true}
                    />
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name='exam_description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Enter detailed description of the exam'
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type='submit' disabled={isLoadingExam.updateExam}>
                {isLoadingExam.updateExam ? <LoadingSpinner color='white' /> : 'Update Exam'}
              </Button>
            </form>
          </Form>
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
                const taskId = form.watch(part);
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
                    <TableCell>{task ? 'Test' : '-'}</TableCell>
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
          <CardTitle>Available Test Listening Tasks</CardTitle>
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
                  Array.isArray(filters.partNumber) && filters.partNumber.length > 0
                    ? String(Number(filters.partNumber[0]) + 1)
                    : ''
                }
                onValueChange={(v) =>
                  handleFilterChange({
                    partNumber: v && v !== 'all' ? [String(Number(v) - 1)] : undefined,
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
                  setFilters({
                    page: 1,
                    size: 10,
                    sort_by: 'updatedAt',
                    sort_direction: 'desc',
                  })
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
                        <TableCell>
                          {task.created_at ? new Date(task.created_at).toLocaleString() : ''}
                        </TableCell>
                        {PARTS.map((part) => (
                          <TableCell key={part} className='text-center'>
                            <input
                              type='radio'
                              name={part}
                              value={task.task_id}
                              checked={form.watch(part) === task.task_id}
                              onChange={() => handleRadioSelect(part, task.task_id)}
                              disabled={
                                Object.values(form.getValues()).includes(task.task_id) &&
                                form.watch(part) !== task.task_id
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
