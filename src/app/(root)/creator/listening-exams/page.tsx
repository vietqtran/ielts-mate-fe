'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useListeningExam } from '@/hooks/apis/admin/useListeningExam';
import {
  clearFilters,
  setFilters,
  setLoading,
  setPagination,
} from '@/store/slices/listening-exam-filter-slice';
import { RootState } from '@/types/store.types';
import { ArrowDown, ArrowUp, Eye, Pencil, PlusCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';

export default function ListeningExamsPage() {
  const { getAllExams, deleteExam, isLoading } = useListeningExam();
  const [exams, setExams] = useState<any[]>([]);
  const dispatch = useDispatch();
  const filters = useSelector((state: RootState) => state.listeningExam.filters);
  const pagination = useSelector((state: RootState) => state.listeningExam.pagination);

  const fetchExams = async (page = pagination.currentPage, size = pagination.pageSize) => {
    try {
      dispatch(setLoading(true));
      const response = await getAllExams({
        page: page - 1, // backend expects 0-based page in ExamController
        size,
        sortBy: filters.sortBy || 'createdAt',
        sortDirection: filters.sortDirection || 'desc',
        keyword: filters.searchText || undefined,
      });
      if (response) {
        setExams(response.data || []);
        if (response.pagination) {
          dispatch(setPagination(response.pagination));
        }
      }
    } catch (error) {
      console.log(error);
      toast.error('Failed to fetch listening exams');
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this listening exam?')) {
      try {
        await deleteExam(id);
        toast.success('Listening exam deleted successfully');
        fetchExams();
      } catch (error) {
        toast.error('Failed to delete listening exam');
      }
    }
  };

  return (
    <div className='container mx-auto p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold'>Listening Exams</h1>
        <Button asChild>
          <Link href='/creator/listening-exams/create'>
            <PlusCircle className='mr-2 h-4 w-4' />
            Create Exam
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Listening Exams</CardTitle>
          <CardDescription>Manage IELTS listening exams for student practice</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Server-side filter & sort toolbar */}
          <div className='mb-4 flex flex-col gap-3 md:flex-row md:items-center'>
            <div className='flex-1'>
              <Input
                placeholder='Search by exam name or slug...'
                value={filters.searchText || ''}
                onChange={(e) => {
                  const next = { ...filters, searchText: e.target.value };
                  dispatch(setFilters(next));
                  dispatch(setPagination({ ...pagination, currentPage: 1 }));
                  fetchExams(1, pagination.pageSize);
                }}
              />
            </div>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                onClick={() => {
                  const isCurrent = filters.sortBy === 'createdAt';
                  const nextDir: 'asc' | 'desc' =
                    isCurrent && filters.sortDirection === 'asc' ? 'desc' : 'asc';
                  const next = { ...filters, sortBy: 'createdAt', sortDirection: nextDir };
                  dispatch(setFilters(next));
                  fetchExams();
                }}
              >
                Sort: Created At{' '}
                {filters.sortBy === 'createdAt' &&
                  (filters.sortDirection === 'asc' ? (
                    <ArrowUp className='h-4 w-4' />
                  ) : (
                    <ArrowDown className='h-4 w-4' />
                  ))}
              </Button>
              <Button
                variant='outline'
                onClick={() => {
                  const isCurrent = filters.sortBy === 'updatedAt';
                  const nextDir: 'asc' | 'desc' =
                    isCurrent && filters.sortDirection === 'asc' ? 'desc' : 'asc';
                  const next = { ...filters, sortBy: 'updatedAt', sortDirection: nextDir };
                  dispatch(setFilters(next));
                  fetchExams();
                }}
              >
                Sort: Updated At{' '}
                {filters.sortBy === 'updatedAt' &&
                  (filters.sortDirection === 'asc' ? (
                    <ArrowUp className='h-4 w-4' />
                  ) : (
                    <ArrowDown className='h-4 w-4' />
                  ))}
              </Button>
              <Button
                variant='ghost'
                onClick={() => {
                  dispatch(clearFilters());
                  fetchExams(1, pagination.pageSize);
                }}
              >
                Clear
              </Button>
            </div>
          </div>
          {isLoading['getAllExams'] ? (
            <div className='flex justify-center py-8'>
              <LoadingSpinner />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <button
                      type='button'
                      className='flex items-center gap-2'
                      onClick={() => {
                        const isCurrent = filters.sortBy === 'examName';
                        const nextDir: 'asc' | 'desc' =
                          isCurrent && filters.sortDirection === 'asc' ? 'desc' : 'asc';
                        const next = { ...filters, sortBy: 'examName', sortDirection: nextDir };
                        dispatch(setFilters(next));
                        fetchExams();
                      }}
                    >
                      Exam Name
                      {filters.sortBy === 'examName' &&
                        (filters.sortDirection === 'asc' ? (
                          <ArrowUp className='h-4 w-4' />
                        ) : (
                          <ArrowDown className='h-4 w-4' />
                        ))}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      type='button'
                      className='flex items-center gap-2'
                      onClick={() => {
                        const isCurrent = filters.sortBy === 'urlSlug';
                        const nextDir: 'asc' | 'desc' =
                          isCurrent && filters.sortDirection === 'asc' ? 'desc' : 'asc';
                        const next = { ...filters, sortBy: 'urlSlug', sortDirection: nextDir };
                        dispatch(setFilters(next));
                        fetchExams();
                      }}
                    >
                      URL Slug
                      {filters.sortBy === 'urlSlug' &&
                        (filters.sortDirection === 'asc' ? (
                          <ArrowUp className='h-4 w-4' />
                        ) : (
                          <ArrowDown className='h-4 w-4' />
                        ))}
                    </button>
                  </TableHead>
                  <TableHead>Listening Parts</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className='text-center py-6'>
                      No listening exams found. Create your first one.
                    </TableCell>
                  </TableRow>
                ) : (
                  exams.map((exam) => (
                    <TableRow key={exam.listening_exam_id}>
                      <TableCell className='font-medium'>{exam.exam_name}</TableCell>
                      <TableCell>{exam.url_slug}</TableCell>
                      <TableCell>
                        <div>
                          {['part1', 'part2', 'part3', 'part4'].map((part, idx) =>
                            exam[part] && exam[part].title ? (
                              <div key={part}>
                                <Badge variant='outline'>
                                  Part {idx + 1}: {exam[part].title}
                                </Badge>
                              </div>
                            ) : null
                          )}
                        </div>
                      </TableCell>
                      <TableCell className='text-right'>
                        <div className='flex justify-end gap-2'>
                          <Button variant='outline' size='icon' asChild>
                            <Link
                              href={`/creator/listening-exams/${exam.listening_exam_id}/preview`}
                            >
                              <Eye className='h-4 w-4' />
                            </Link>
                          </Button>
                          <Button variant='outline' size='icon' asChild>
                            <Link href={`/creator/listening-exams/${exam.listening_exam_id}/edit`}>
                              <Pencil className='h-4 w-4' />
                            </Link>
                          </Button>
                          <Button
                            variant='outline'
                            size='icon'
                            onClick={() => handleDelete(exam.listening_exam_id)}
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
          {/* Pagination */}
          <div className='mt-4 flex items-center justify-between'>
            <div className='text-sm text-muted-foreground'>
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                onClick={() =>
                  fetchExams(Math.max(1, pagination.currentPage - 1), pagination.pageSize)
                }
                disabled={!pagination.hasPreviousPage}
              >
                Previous
              </Button>
              <Button
                variant='outline'
                onClick={() =>
                  fetchExams(
                    Math.min(pagination.totalPages, pagination.currentPage + 1),
                    pagination.pageSize
                  )
                }
                disabled={!pagination.hasNextPage}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
