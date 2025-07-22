'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/ui/loading-spinner';
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
import { ListeningTaskFilterParams } from '@/types/listening.types';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import * as z from 'zod';

const listeningTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  instruction: z.string().min(1, 'Instruction is required'),
  ielts_type: z.number().min(0),
  part_number: z.number().min(0),
  status: z.number().min(0),
  audio_file: z.any(),
  is_automatic_transcription: z.boolean(),
  transcript: z.string().optional(),
});

type ListeningTaskFormData = z.infer<typeof listeningTaskSchema>;

type PartKey = 'part1_id' | 'part2_id' | 'part3_id' | 'part4_id';
const PARTS: PartKey[] = ['part1_id', 'part2_id', 'part3_id', 'part4_id'];
const PART_LABELS = ['Part 1', 'Part 2', 'Part 3', 'Part 4'];

export default function CreateListeningExamPage() {
  const router = useRouter();
  const { getListeningTasksByCreator, isLoading: isLoadingTask } = useListeningTask();
  const { createExam, isLoading: isLoadingExam } = useListeningExam();

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

  const fetchTasks = async () => {
    try {
      const response = await getListeningTasksByCreator(filters);
      if (response) {
        setTasks(response.data);
        if (response.pagination) setPagination(response.pagination);
      }
    } catch (error) {
      toast.error('Failed to fetch listening tasks');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Radio selection logic: only one task per part, and a task can't be assigned to multiple parts
  const handleRadioSelect = (part: PartKey, taskId: string) => {
    // Remove this task from any other part
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
  };

  // Remove a selected task from a part
  const handleRemovePart = (part: PartKey) => {
    setForm((prev) => ({ ...prev, [part]: '' }));
  };

  // Helper to get task info by id
  const getTaskById = (taskId: string) => tasks.find((t) => t.task_id === taskId) || null;

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

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
      await createExam(form);
      toast.success('Listening exam created successfully');
      router.push('/creator/listening-exams');
    } catch (error) {
      toast.error('Failed to create listening exam');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='container mx-auto p-6'>
      <Card className='mb-8'>
        <CardHeader>
          <CardTitle>Create Listening Exam</CardTitle>
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
                <label className='block font-medium mb-1'>URL Slug</label>
                <Input
                  name='url_slug'
                  value={form.url_slug}
                  onChange={(e) => {
                    const value = e.target.value
                      .toLowerCase()
                      .replace(/\s+/g, '-')
                      .replace(/[^a-z0-9-]/g, '');
                    setForm((prev) => ({ ...prev, url_slug: value }));
                  }}
                  required
                  placeholder='example-exam-title'
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
            <Button type='submit' disabled={submitting || isLoadingExam.createExam}>
              {submitting || isLoadingExam.createExam ? (
                <LoadingSpinner color='white' />
              ) : (
                'Create Exam'
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
          {isLoadingTask['getListeningTasksByCreator'] ? (
            <div className='flex justify-center py-8'>
              <LoadingSpinner />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Part</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  {PART_LABELS.map((label, idx) => (
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
                      {PARTS.map((part, idx) => (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
