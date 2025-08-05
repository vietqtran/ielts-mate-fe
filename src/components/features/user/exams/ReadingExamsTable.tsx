'use client';

import { PaginationCommon } from '@/components/features/user/common';
import ExamsListFilter from '@/components/features/user/exams/common/ExamsListFilter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/loading-spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import useReadingExamAttempt from '@/hooks/apis/reading/useReadingExamAttempt';
import {
  ReadingExamFilters,
  clearFilters,
  setFilters,
  setLoading,
  setPagination,
} from '@/store/slices/reading-exam-filter-slice';
import { RootState } from '@/types';
import { ReadingExamResponse } from '@/types/reading/reading-exam.types';
import { Play } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';

interface ReadingExamsTableProps {
  className?: string;
}

export default function ReadingExamsTable({ className }: ReadingExamsTableProps) {
  const { getAllAvailableExams, isLoading } = useReadingExamAttempt();
  const [exams, setExams] = useState<ReadingExamResponse['data'][]>([]);
  const dispatch = useDispatch();

  const filters = useSelector((state: RootState) => state.readingExam.filters);
  const reduxIsLoading = useSelector((state: RootState) => state.readingExam.isLoading);
  const pagination = useSelector((state: RootState) => state.readingExam.pagination);

  const fetchExams = async () => {
    try {
      dispatch(setLoading(true));
      const response = await getAllAvailableExams({
        page: pagination.currentPage,
        size: pagination.pageSize,
        keyword: filters.searchText,
        sortBy: filters.sortBy,
        sortDirection: filters.sortDirection,
      });
      if (response) {
        setExams(response.data);
      }
    } catch (error) {
      toast.error('Failed to fetch reading exams');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleFiltersChange = (newFilters: ReadingExamFilters['filters']) => {
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

  useEffect(() => {
    fetchExams();
  }, [
    filters.searchText,
    filters.sortBy,
    filters.sortDirection,
    pagination.currentPage,
    pagination.pageSize,
  ]);

  if (reduxIsLoading) {
    return (
      <div className='flex justify-center py-8'>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={className}>
      <ExamsListFilter
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
        isLoading={reduxIsLoading}
      />
      <Table className='mt-4'>
        <TableHeader>
          <TableRow>
            <TableHead>Exam Name</TableHead>
            <TableHead>URL Slug</TableHead>
            <TableHead>Reading Passages</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exams.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className='text-center py-6'>
                No reading exams found at the moment.
              </TableCell>
            </TableRow>
          ) : (
            exams.map((exam) => (
              <TableRow key={exam.reading_exam_id}>
                <TableCell className='font-medium'>{exam.reading_exam_name}</TableCell>
                <TableCell>
                  <Badge variant='outline'>{exam.url_slug}</Badge>
                </TableCell>
                <TableCell>
                  <div className='space-y-1'>
                    <div className='text-sm'>
                      <span className='font-medium'>Part 1:</span>{' '}
                      {exam.reading_passage_id_part1.reading_passage_name}
                    </div>
                    <div className='text-sm'>
                      <span className='font-medium'>Part 2:</span>{' '}
                      {exam.reading_passage_id_part2.reading_passage_name}
                    </div>
                    <div className='text-sm'>
                      <span className='font-medium'>Part 3:</span>{' '}
                      {exam.reading_passage_id_part3.reading_passage_name}
                    </div>
                  </div>
                </TableCell>
                <TableCell className='text-right'>
                  <div className='flex justify-end gap-2'>
                    <Button size='sm' asChild className='bg-tekhelet-600 hover:bg-tekhelet-700'>
                      <Link href={`/exams/preview?examUrl=${exam.url_slug}&examType=reading`}>
                        <Play className='h-4 w-4' />
                        Take Exam
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
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
