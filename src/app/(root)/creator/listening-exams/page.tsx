'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Eye,
  Pencil,
  PlusCircle,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';

export default function ListeningExamsPage() {
  const { getAllExams, deleteExam, isLoading, updateExam } = useListeningExam();
  const [exams, setExams] = useState<any[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingExamId, setDeletingExamId] = useState<string | null>(null);
  const dispatch = useDispatch();
  const filters = useSelector((state: RootState) => state.listeningExam.filters);
  const pagination = useSelector((state: RootState) => state.listeningExam.pagination);

  const fetchExams = async (
    page = pagination.currentPage,
    size = pagination.pageSize,
    filterState: typeof filters = filters
  ) => {
    try {
      dispatch(setLoading(true));
      const response = await getAllExams({
        page: page, // backend expects 0-based page in ExamController
        size,
        sortBy: filterState.sortBy || 'createdAt',
        sortDirection: filterState.sortDirection || 'desc',
        // Avoid sending whitespace-only keywords which serialize as '+' in query string
        keyword: (filterState.searchText || '').trim() || undefined,
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
    try {
      await deleteExam(id);
      toast.success('Listening exam deleted successfully');
      fetchExams();
    } catch (error) {
      toast.error('Failed to delete listening exam');
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
                  fetchExams(1, pagination.pageSize, next);
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
                  fetchExams(pagination.currentPage, pagination.pageSize, next);
                }}
              >
                Sort: Created At{' '}
                {filters.sortBy === 'createdAt' ? (
                  filters.sortDirection === 'asc' ? (
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
                onClick={() => {
                  const isCurrent = filters.sortBy === 'updatedAt';
                  const nextDir: 'asc' | 'desc' =
                    isCurrent && filters.sortDirection === 'asc' ? 'desc' : 'asc';
                  const next = { ...filters, sortBy: 'updatedAt', sortDirection: nextDir };
                  dispatch(setFilters(next));
                  fetchExams(pagination.currentPage, pagination.pageSize, next);
                }}
              >
                Sort: Updated At{' '}
                {filters.sortBy === 'updatedAt' ? (
                  filters.sortDirection === 'asc' ? (
                    <ArrowUp className='ml-2 h-4 w-4' />
                  ) : (
                    <ArrowDown className='ml-2 h-4 w-4' />
                  )
                ) : (
                  <ArrowUpDown className='ml-2 h-4 w-4 text-muted-foreground' />
                )}
              </Button>
              <Button
                variant='ghost'
                onClick={() => {
                  dispatch(clearFilters());
                  fetchExams(1, pagination.pageSize, {
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
            <div className='overflow-x-auto'>
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
                          fetchExams(pagination.currentPage, pagination.pageSize, next);
                        }}
                      >
                        Exam Name
                        {filters.sortBy === 'examName' ? (
                          filters.sortDirection === 'asc' ? (
                            <ArrowUp className='h-4 w-4' />
                          ) : (
                            <ArrowDown className='h-4 w-4' />
                          )
                        ) : (
                          <ArrowUpDown className='h-4 w-4 text-muted-foreground' />
                        )}
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
                          fetchExams(pagination.currentPage, pagination.pageSize, next);
                        }}
                      >
                        URL Slug
                        {filters.sortBy === 'urlSlug' ? (
                          filters.sortDirection === 'asc' ? (
                            <ArrowUp className='h-4 w-4' />
                          ) : (
                            <ArrowDown className='h-4 w-4' />
                          )
                        ) : (
                          <ArrowUpDown className='h-4 w-4 text-muted-foreground' />
                        )}
                      </button>
                    </TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Part 1</TableHead>
                    <TableHead>Part 2</TableHead>
                    <TableHead>Part 3</TableHead>
                    <TableHead>Part 4</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Updated At</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exams.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className='text-center py-6'>
                        No listening exams found. Create your first one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    exams.map((exam) => (
                      <TableRow key={exam.listening_exam_id}>
                        <TableCell className='font-medium max-w-[150px]'>
                          <div className='truncate' title={exam.exam_name}>
                            {exam.exam_name}
                          </div>
                        </TableCell>
                        <TableCell className='max-w-[150px]'>
                          <div className='truncate' title={exam.url_slug}>
                            {exam.url_slug}
                          </div>
                        </TableCell>
                        <TableCell className='max-w-[150px]'>
                          <div className='truncate' title={exam.exam_description || '-'}>
                            {exam.exam_description || '-'}
                          </div>
                        </TableCell>
                        <TableCell className='max-w-[150px]'>
                          {exam.part1?.title ? (
                            <Link
                              href={`/creator/listenings/${exam.part1.task_id}/preview`}
                              className='hover:underline block truncate'
                              title={exam.part1.title}
                            >
                              {exam.part1.title}
                            </Link>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className='max-w-[150px]'>
                          {exam.part2?.title ? (
                            <Link
                              href={`/creator/listenings/${exam.part2.task_id}/preview`}
                              className='hover:underline block truncate'
                              title={exam.part2.title}
                            >
                              {exam.part2.title}
                            </Link>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className='max-w-[150px]'>
                          {exam.part3?.title ? (
                            <Link
                              href={`/creator/listenings/${exam.part3.task_id}/preview`}
                              className='hover:underline block truncate'
                              title={exam.part3.title}
                            >
                              {exam.part3.title}
                            </Link>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className='max-w-[150px]'>
                          {exam.part4?.title ? (
                            <Link
                              href={`/creator/listenings/${exam.part4.task_id}/preview`}
                              className='hover:underline block truncate'
                              title={exam.part4.title}
                            >
                              {exam.part4.title}
                            </Link>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className='max-w-[150px]'>
                          <div
                            className='truncate'
                            title={
                              exam.created_at ? new Date(exam.created_at).toLocaleString() : '-'
                            }
                          >
                            {exam.created_at ? new Date(exam.created_at).toLocaleString() : '-'}
                          </div>
                        </TableCell>
                        <TableCell className='max-w-[150px]'>
                          <div
                            className='truncate'
                            title={
                              exam.updated_at ? new Date(exam.updated_at).toLocaleString() : '-'
                            }
                          >
                            {exam.updated_at ? new Date(exam.updated_at).toLocaleString() : '-'}
                          </div>
                        </TableCell>
                        <TableCell className='max-w-[200px]'>
                          <div
                            className='flex flex-wrap gap-1'
                            title={`Status: ${[
                              exam.is_current ? 'Current' : '',
                              exam.is_original ? 'Original' : '',
                              exam.is_deleted ? 'Deleted' : '',
                              exam.is_marked_up ? 'Marked Up' : '',
                              exam.markup_type ? `Markup: ${String(exam.markup_type)}` : '',
                            ]
                              .filter(Boolean)
                              .join(', ')}`}
                          >
                            {exam.is_current ? (
                              <Badge variant='outline' className='bg-green-500 text-white'>
                                Current
                              </Badge>
                            ) : null}
                            {exam.is_original ? (
                              <Badge variant='outline' className='bg-blue-500 text-white'>
                                Original
                              </Badge>
                            ) : null}
                            {exam.is_deleted ? (
                              <Badge variant='outline' className='bg-red-500 text-white'>
                                Deleted
                              </Badge>
                            ) : null}
                            {exam.is_marked_up ? (
                              <Badge variant='outline' className='bg-yellow-500 text-white'>
                                Marked Up
                              </Badge>
                            ) : null}
                            {exam.markup_type ? (
                              <Badge variant='outline' className='bg-gray-500 text-white'>
                                Markup: {String(exam.markup_type)}
                              </Badge>
                            ) : null}
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
                              <Link
                                href={`/creator/listening-exams/${exam.listening_exam_id}/edit`}
                              >
                                <Pencil className='h-4 w-4' />
                              </Link>
                            </Button>
                            <Button
                              variant='outline'
                              size='icon'
                              onClick={() => {
                                setDeletingExamId(exam.listening_exam_id);
                                setConfirmOpen(true);
                              }}
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                            {exam.is_deleted ? (
                              <Button
                                variant='outline'
                                size='icon'
                                onClick={async () => {
                                  try {
                                    await updateExam(exam.listening_exam_id, { is_deleted: false });
                                    toast.success('Exam restored');
                                    fetchExams(pagination.currentPage, pagination.pageSize);
                                  } catch (err) {
                                    toast.error('Failed to restore exam');
                                  }
                                }}
                              >
                                <RotateCcw className='h-4 w-4' />
                              </Button>
                            ) : null}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
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
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete listening exam?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the exam.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingExamId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deletingExamId) {
                  await handleDelete(deletingExamId);
                }
                setDeletingExamId(null);
                setConfirmOpen(false);
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
