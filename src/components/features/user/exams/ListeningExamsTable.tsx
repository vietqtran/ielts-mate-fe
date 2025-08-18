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
  ListeningExamFilters,
  clearFilters,
  setFilters,
  setLoading,
  setPagination,
} from '@/store/slices/listening-exam-filter-slice';
import { RootState } from '@/types';
import { ListActiveListeningExamsResponse } from '@/types/listening/listening-exam.types';
import { Loader2, Play } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';

interface ListeningExamsTableProps {
  className?: string;
}

export default function ListeningExamsTable({ className }: ListeningExamsTableProps) {
  const dispatch = useDispatch();
  const { fetchListeningExamsList, isLoading, error } = useListeningExam();
  const [exams, setExams] = useState<ListActiveListeningExamsResponse[]>([]);
  const filters = useSelector((state: RootState) => state.listeningExam.filters);
  const reduxIsLoading = useSelector((state: RootState) => state.listeningExam.isLoading);
  const pagination = useSelector((state: RootState) => state.listeningExam.pagination);

  const loadExams = async () => {
    try {
      dispatch(setLoading(true));
      console.log(pagination);

      const res = await fetchListeningExamsList({
        page: pagination.currentPage,
        size: pagination.pageSize,
        keyword: filters.searchText,
        sortBy: filters.sortBy,
        sortDirection: filters.sortDirection,
      });

      if (res?.data) {
        setExams(res.data);
      }

      if (res?.pagination) {
        dispatch(
          setPagination({
            totalPages: res.pagination.totalPages || 1,
            pageSize: res.pagination.pageSize || 10,
            totalItems: res.pagination.totalItems || 0,
            hasNextPage: res.pagination.hasNextPage || false,
            hasPreviousPage: res.pagination.hasPreviousPage || false,
            currentPage: res.pagination.currentPage || 1,
          })
        );
      }
    } catch (error) {
      toast.error('Failed to fetch listening exams');
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
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
          {exams.length === 0 && !reduxIsLoading ? (
            <TableRow>
              <TableCell colSpan={4} className='text-center py-6'>
                No listening exams found at the moment.
              </TableCell>
            </TableRow>
          ) : !reduxIsLoading ? (
            exams.map((exam) => (
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
