'use client';

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
import { useReadingExam } from '@/hooks/apis/admin/useReadingExam';
import {
  clearFilters,
  setFilters,
  setLoading,
  setPagination,
} from '@/store/slices/reading-exam-filter-slice';
import { RootState } from '@/types';
import { ReadingExamResponse } from '@/types/reading/reading-exam.types';
import { ArrowDown, ArrowUp, Eye, Pencil, PlusCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';

export default function ReadingExamsPage() {
  const { getAllExams, deleteExam, isLoading } = useReadingExam();
  const [exams, setExams] = useState<ReadingExamResponse['data'][]>([]);
  const dispatch = useDispatch();
  const filters = useSelector((state: RootState) => state.readingExam.filters);
  const pagination = useSelector((state: RootState) => state.readingExam.pagination);

  useEffect(() => {
    applyFetch();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this reading exam?')) {
      try {
        await deleteExam(id);
        toast.success('Reading exam deleted successfully');
        applyFetch();
      } catch (error) {
        toast.error('Failed to delete reading exam');
      }
    }
  };

  const applyFetch = async (
    page = pagination.currentPage,
    size = pagination.pageSize,
    filterState: typeof filters = filters
  ) => {
    try {
      dispatch(setLoading(true));
      const response = await getAllExams({
        page,
        size,
        sortBy: filterState.sortBy || 'updatedAt',
        sortDirection: (filterState.sortDirection as 'asc' | 'desc') || 'desc',
        keyword: (filterState.searchText || '').trim() || undefined,
      });
      if (response) {
        setExams(response.data);
        if (response.pagination) {
          dispatch(setPagination(response.pagination));
        }
      }
    } catch (error) {
      toast.error('Failed to fetch reading exams');
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className='container mx-auto p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold'>Reading Exams</h1>
        <Button asChild>
          <Link href='/creator/reading-exams/create'>
            <PlusCircle className='mr-2 h-4 w-4' />
            Create Exam
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Reading Exams</CardTitle>
          <CardDescription>Manage IELTS reading exams for student practice</CardDescription>
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
                  applyFetch(1, pagination.pageSize, next);
                }}
              />
            </div>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                onClick={() => {
                  const next = { ...filters, sortBy: 'updatedAt' };
                  dispatch(setFilters(next));
                  applyFetch(pagination.currentPage, pagination.pageSize, next);
                }}
              >
                Sort: Updated At
              </Button>
              <Button
                variant='outline'
                onClick={() => {
                  const next = { ...filters, sortBy: 'createdAt' };
                  dispatch(setFilters(next));
                  applyFetch(pagination.currentPage, pagination.pageSize, next);
                }}
              >
                Sort: Created At
              </Button>
              <Button
                variant='outline'
                onClick={() => {
                  const nextDir: 'asc' | 'desc' = filters.sortDirection === 'asc' ? 'desc' : 'asc';
                  const next = { ...filters, sortDirection: nextDir };
                  dispatch(setFilters(next));
                  applyFetch(pagination.currentPage, pagination.pageSize, next);
                }}
                title='Toggle sort direction'
              >
                {filters.sortDirection === 'asc' ? (
                  <ArrowUp className='h-4 w-4' />
                ) : (
                  <ArrowDown className='h-4 w-4' />
                )}
              </Button>
              <Button
                variant='ghost'
                onClick={() => {
                  dispatch(clearFilters());
                  applyFetch(1, pagination.pageSize, {
                    searchText: '',
                    sortBy: '',
                    sortDirection: '',
                  } as typeof filters);
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
                        applyFetch(pagination.currentPage, pagination.pageSize, next);
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
                        applyFetch(pagination.currentPage, pagination.pageSize, next);
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
                  <TableHead>Part 1</TableHead>
                  <TableHead>Part 2</TableHead>
                  <TableHead>Part 3</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className='text-center py-6'>
                      No reading exams found. Create your first one.
                    </TableCell>
                  </TableRow>
                ) : (
                  exams.map((exam) => (
                    <TableRow key={exam.reading_exam_id}>
                      <TableCell className='font-medium'>{exam.reading_exam_name}</TableCell>
                      <TableCell>{exam.url_slug}</TableCell>
                      <TableCell>{exam.reading_passage_id_part1?.reading_passage_name}</TableCell>
                      <TableCell>{exam.reading_passage_id_part2?.reading_passage_name}</TableCell>
                      <TableCell>{exam.reading_passage_id_part3?.reading_passage_name}</TableCell>
                      <TableCell className='text-right'>
                        <div className='flex justify-end gap-2'>
                          <Button variant='outline' size='icon' asChild>
                            <Link href={`/creator/reading-exams/${exam.reading_exam_id}`}>
                              <Eye className='h-4 w-4' />
                            </Link>
                          </Button>
                          <Button variant='outline' size='icon' asChild>
                            <Link href={`/creator/reading-exams/${exam.reading_exam_id}/edit`}>
                              <Pencil className='h-4 w-4' />
                            </Link>
                          </Button>
                          <Button
                            variant='outline'
                            size='icon'
                            onClick={() => handleDelete(exam.reading_exam_id)}
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
                  applyFetch(Math.max(1, pagination.currentPage - 1), pagination.pageSize)
                }
                disabled={!pagination.hasPreviousPage}
              >
                Previous
              </Button>
              <Button
                variant='outline'
                onClick={() =>
                  applyFetch(
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
