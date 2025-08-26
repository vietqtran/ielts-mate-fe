'use client';

import { PaginationCommon } from '@/components/features/user/common';
import ListeningExamAttemptHistoryFilter from '@/components/features/user/history/exam/listening/components/ListeningExamAttemptFilter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useListeningExam } from '@/hooks/apis/listening/useListeningExam';
import {
  ListeningExamAttemptFilters,
  clearFilters,
  setFilters,
  setLoading,
  setPagination,
} from '@/store/slices/listening-exam-attempt-filter-slice';
import { RootState } from '@/types';
import { ListeningExamAttemptsHistoryResponse } from '@/types/listening/listening-exam.types';
import { formatDate, formatDuration } from '@/utils/time';
import { Calendar, Clock, Eye, Headphones, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const ListeningExamHistory = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { getListeningExamAttemptsHistory } = useListeningExam();
  const [attemptHistoryData, setAttemptHistoryData] = useState<
    ListeningExamAttemptsHistoryResponse[]
  >([]);

  const filters = useSelector((state: RootState) => state.listeningExamAttempt.filters);
  const reduxIsLoading = useSelector((state: RootState) => state.listeningExamAttempt.isLoading);
  const pagination = useSelector((state: RootState) => state.listeningExamAttempt.pagination);

  // Load attempts when dependencies change
  const loadAttempts = async () => {
    try {
      dispatch(setLoading(true));
      const response = await getListeningExamAttemptsHistory({
        size: pagination?.pageSize,
        listeningExamName: filters.searchText,
        page: pagination?.currentPage,
        sortBy: filters.sortBy,
        sortDirection: filters.sortDirection,
      });

      if (response?.data) {
        setAttemptHistoryData(response.data || []);
        dispatch(
          setPagination({
            totalPages: response?.pagination?.totalPages || 1,
            pageSize: response?.pagination?.pageSize || 10,
            totalItems: response?.pagination?.totalItems || 0,
            hasNextPage: response?.pagination?.hasNextPage || false,
            hasPreviousPage: response?.pagination?.hasPreviousPage || false,
            currentPage: response?.pagination?.currentPage || 1,
          })
        );
      }
    } catch (err) {
      console.error('Failed to load listening exam attempt history:', err);
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    loadAttempts();
  }, [
    filters.searchText,
    filters.sortBy,
    filters.sortDirection,
    pagination?.pageSize,
    pagination?.currentPage,
  ]);

  const handleFiltersChange = (newFilters: ListeningExamAttemptFilters['filters']) => {
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

  // Check if there are active filters
  const hasActiveFilters = () => {
    return Object.values(filters).some((value) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== undefined && value !== '';
    });
  };

  const handleViewAttempt = (attemptId: string) => {
    router.push(`/history/exams/details?mode=listening&examId=${attemptId}`);
  };

  return (
    <div className='container mx-auto p-6'>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-tekhelet-500'>
              Listening Exam History
            </h1>
            <p className='text-tekhelet-600'>View and manage your listening exam attempts</p>
          </div>
          <div className='flex items-center gap-2'>
            <Badge variant='secondary' className='backdrop-blur-lg text-tekhelet-500'>
              {attemptHistoryData.length} attempt
              {attemptHistoryData.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>

        <ListeningExamAttemptHistoryFilter
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          isLoading={reduxIsLoading}
        />

        {/* Attempts Grid */}
        {reduxIsLoading ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className='bg-white/60 backdrop-blur-lg border rounded-2xl shadow-xl'>
                <CardHeader>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='h-6 w-3/4 bg-tekhelet-700 rounded animate-pulse mb-2' />
                      <div className='flex items-center gap-2 mb-2'>
                        <div className='h-4 w-20 bg-tekhelet-700 rounded animate-pulse' />
                        <div className='h-4 w-16 bg-tekhelet-700 rounded animate-pulse' />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    <div className='h-4 w-full bg-tekhelet-700 rounded animate-pulse' />
                    <div className='h-4 w-full bg-tekhelet-700 rounded animate-pulse' />
                    <div className='h-4 w-2/3 bg-tekhelet-700 rounded animate-pulse' />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : attemptHistoryData.length === 0 && !reduxIsLoading ? (
          <Card>
            <CardContent className='pt-6'>
              <div className='text-center py-12'>
                <Headphones className='h-12 w-12 mx-auto text-tekhelet-400 mb-4' />
                <h3 className='text-lg font-semibold text-tekhelet-700 mb-2'>
                  No exam attempts found
                </h3>
                <p className='text-tekhelet-500 mb-4'>
                  {hasActiveFilters()
                    ? 'Try adjusting your search criteria or filters'
                    : "You haven't started any listening exams yet"}
                </p>
                {hasActiveFilters() ? (
                  <Button
                    variant='outline'
                    onClick={handleClearFilters}
                    className='border-tekhelet-300 text-tekhelet-700 hover:bg-tekhelet-200'
                  >
                    Clear all filters
                  </Button>
                ) : (
                  <Button
                    onClick={() => router.push('/exams/listening')}
                    className='bg-selective-yellow-300 text-tekhelet-900 hover:bg-selective-yellow-400'
                  >
                    Start Exam
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {attemptHistoryData.map((attempt) => (
              <Card
                key={attempt.exam_attempt_id}
                className='bg-white/60 backdrop-blur-lg border rounded-2xl shadow-xl hover:shadow-2xl transition-shadow'
              >
                <CardHeader className='min-w-0'>
                  <CardTitle className='text-lg mb-2 line-clamp-2 text-tekhelet-700 w-full truncate'>
                    {attempt.listening_exam.listening_exam_name || 'Untitled Exam'}
                  </CardTitle>
                  <div className='flex items-center gap-2 mb-2'>
                    <Badge variant={'outline'} className='bg-emerald-100 !text-emerald-800'>
                      Completed
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    {/* Exam Description */}
                    {attempt.listening_exam.listening_exam_description && (
                      <p className='text-sm text-tekhelet-500 line-clamp-2'>
                        {attempt.listening_exam.listening_exam_description}
                      </p>
                    )}

                    {/* Metadata */}
                    <div className='grid grid-cols-2 gap-2 text-sm'>
                      <div className='flex items-center gap-1 text-tekhelet-500'>
                        <Calendar className='h-3 w-3' />
                        <span>Started:</span>
                      </div>
                      <span className='text-right text-tekhelet-700'>
                        {formatDate(attempt.created_at)}
                      </span>

                      <div className='flex items-center gap-1 text-tekhelet-500'>
                        <Clock className='h-3 w-3' />
                        <span>Duration:</span>
                      </div>
                      <span className='text-right text-tekhelet-700'>
                        {formatDuration(attempt.duration)}
                      </span>

                      <div className='flex items-center gap-1 text-tekhelet-500'>
                        <Users className='h-3 w-3' />
                        <span>Questions:</span>
                      </div>
                      <span className='text-right font-semibold text-tekhelet-700'>
                        {attempt.total_question} questions
                      </span>
                    </div>

                    <Separator />

                    {/* Action buttons */}
                    <div className='flex gap-2'>
                      <Button
                        className='flex-1 bg-selective-yellow-300 text-tekhelet-900 hover:bg-selective-yellow-400'
                        size='sm'
                        onClick={() => handleViewAttempt(attempt.exam_attempt_id)}
                      >
                        <Eye className='h-4 w-4 mr-2' />
                        View Results
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        <PaginationCommon
          pagination={pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  );
};

export default ListeningExamHistory;
