'use client';

import { PaginationCommon } from '@/components/features/user/common';
import ExamsListFilter from '@/components/features/user/exams/common/ExamsListFilter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useListeningExam } from '@/hooks/apis/listening/useListeningExam';
import {
  setFilters,
  setLoading,
  setPagination,
} from '@/store/slices/listening-exam-attempt-filter-slice';
import { ListeningExamFilters, clearFilters } from '@/store/slices/listening-exam-filter-slice';
import { RootState } from '@/types';
import { Loader2, Play } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';

interface ListeningExamsTableProps {
  className?: string;
}

export default function ListeningExamsTable({ className }: ListeningExamsTableProps) {
  const dispatch = useDispatch();
  const filters = useSelector((state: RootState) => state.listeningExam.filters);
  const reduxIsLoading = useSelector((state: RootState) => state.listeningExam.isLoading);
  const pagination = useSelector((state: RootState) => state.listeningExam.pagination);
  const { fetchListeningExamsList, isLoading, error, exams } = useListeningExam();

  useEffect(() => {
    const loadExams = async () => {
      try {
        dispatch(setLoading(true));
        await fetchListeningExamsList({
          page: pagination.currentPage,
          size: pagination.pageSize,
          keyword: filters.searchText,
          sortBy: filters.sortBy,
          sortDirection: filters.sortDirection,
        });

        if (exams?.pagination) {
          dispatch(
            setPagination({
              totalPages: exams.pagination.totalPages,
              pageSize: exams.pagination.pageSize,
              totalItems: exams.pagination.totalItems,
              hasNextPage: exams.pagination.hasNextPage,
              hasPreviousPage: exams.pagination.hasPreviousPage,
              currentPage: exams.pagination.currentPage,
            })
          );
        }
      } catch (error) {
        toast.error('Failed to fetch listening exams');
      } finally {
        dispatch(setLoading(false));
      }
    };

    loadExams();
  }, [
    filters.searchText,
    filters.sortBy,
    filters.sortDirection,
    pagination.currentPage,
    pagination.pageSize,
  ]);
  const handleFiltersChange = (newFilters: ListeningExamFilters['filters']) => {
    dispatch(setFilters(newFilters));
    dispatch(setPagination({ ...pagination, currentPage: 1 }));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  const handlePageChange = (page: number) => {
    dispatch(setPagination({ ...pagination, currentPage: page }));
  };

  const handlePageSizeChange = (size: string) => {
    dispatch(setPagination({ ...pagination, pageSize: Number(size), currentPage: 1 }));
  };

  return (
    <div className={className}>
      <ExamsListFilter
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
      />
      <Table className='mt-4'>
        <TableHeader>
          <TableRow>
            <TableHead>Exam Name</TableHead>
            <TableHead>Listening Tasks</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exams?.data.length === 0 && !reduxIsLoading ? (
            <TableRow>
              <TableCell colSpan={4} className='text-center py-6'>
                No listening exams found at the moment.
              </TableCell>
            </TableRow>
          ) : !reduxIsLoading ? (
            exams?.data.map((exam) => (
              <TableRow key={exam.listening_exam_id}>
                <TableCell className='font-medium'>{exam.exam_name || 'Listening Exam'}</TableCell>
                <TableCell>
                  <div className='flex flex-wrap gap-1'>
                    <Badge variant='outline' className='text-xs'>
                      Part 1: {exam.part1.title}
                    </Badge>
                    <Badge variant='outline' className='text-xs'>
                      Part 2: {exam.part2.title}
                    </Badge>
                    <Badge variant='outline' className='text-xs'>
                      Part 3: {exam.part3.title}
                    </Badge>
                    <Badge variant='outline' className='text-xs'>
                      Part 4: {exam.part4.title}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant='secondary'>30 minutes</Badge>
                </TableCell>
                <TableCell className='text-right'>
                  <div className='flex justify-end gap-2'>
                    <Button size='sm' asChild className='bg-tekhelet-600 hover:bg-tekhelet-700'>
                      <Link href={`/exams/preview?examUrl=${exam.url_slug}&examType=listening`}>
                        <Play className='h-4 w-4' />
                        Take Exam
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className='py-6'>
                <div className='flex items-center justify-center gap-2'>
                  <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
                  <span className='text-sm text-muted-foreground'>Loading...</span>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <PaginationCommon
        pagination={pagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}
