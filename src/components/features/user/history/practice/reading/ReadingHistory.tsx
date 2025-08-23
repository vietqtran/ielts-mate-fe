'use client';

import { PaginationCommon } from '@/components/features/user/common';
import { ReadingAttemptFilterToolbar } from '@/components/features/user/history/practice/reading/ReadingAttemptFilterToolbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import useReadingAttempt from '@/hooks/apis/reading/useReadingAttempt';
import {
  ReadingAttemptFilters,
  clearFilters,
  setFilters,
  setLoading,
  setPagination,
} from '@/store/slices/reading-attempt-filter-slice';
import { AttemptStatusEnumIndex, ReadingAttemptHistoryResponse } from '@/types/attempt.types';
import { RootState } from '@/types/store.types';
import { formatDate, formatDuration } from '@/utils/time';
import { BookOpen, Calendar, CheckCircle, Clock, Eye, PlayCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const ReadingHistory = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { getAllReadingAttemptHistory } = useReadingAttempt();
  const [attemptHistoryData, setAttemptHistoryData] = useState<ReadingAttemptHistoryResponse[]>([]);

  // Get state from Redux
  const filters = useSelector((state: RootState) => state.readingAttempt.filters);
  const reduxIsLoading = useSelector((state: RootState) => state.readingAttempt.isLoading);
  const pagination = useSelector((state: RootState) => state.readingAttempt.pagination);

  // Load attempts when dependencies change
  useEffect(() => {
    const loadAttempts = async () => {
      try {
        dispatch(setLoading(true));
        const response = await getAllReadingAttemptHistory({
          page: pagination?.currentPage,
          size: pagination?.pageSize,
          ieltsType: filters.ieltsType,
          partNumber: filters.partNumber,
          status: filters.status,
          title: filters.searchText,
          passageId: filters.passageId,
          sortBy: filters.sortBy,
          sortDirection: filters.sortDirection,
          questionCategory: filters.questionCategory,
        });

        if (response) {
          setAttemptHistoryData(response.data || []);

          // Update pagination state from response
          if (response.pagination) {
            dispatch(
              setPagination({
                totalPages: response.pagination.totalPages,
                pageSize: response.pagination.pageSize,
                totalItems: response.pagination.totalItems,
                hasNextPage: response.pagination.hasNextPage,
                hasPreviousPage: response.pagination.hasPreviousPage,
                currentPage: response.pagination.currentPage,
              })
            );
          }
        }
      } catch (err) {
        console.error('Failed to load reading attempt history:', err);
      } finally {
        dispatch(setLoading(false));
      }
    };

    loadAttempts();
  }, [
    filters.ieltsType,
    filters.partNumber,
    filters.status,
    filters.searchText,
    pagination?.pageSize,
    pagination?.currentPage,
    filters.passageId,
    filters.sortBy,
    filters.sortDirection,
    filters.questionCategory,
  ]);

  const getStatusLabel = (status: number | null): string => {
    if (status === null) return 'Unknown';
    switch (status) {
      case AttemptStatusEnumIndex.IN_PROGRESS:
        return 'In Progress';
      case AttemptStatusEnumIndex.COMPLETED:
        return 'Completed';
      case AttemptStatusEnumIndex.ABANDONED:
        return 'Abandoned';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: number | null): string => {
    if (status === null) return 'bg-gray-100 text-gray-800';
    switch (status) {
      case AttemptStatusEnumIndex.IN_PROGRESS:
        return 'bg-amber-100 text-amber-800';
      case AttemptStatusEnumIndex.COMPLETED:
        return 'bg-emerald-100 text-emerald-800';
      case AttemptStatusEnumIndex.ABANDONED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: number | null) => {
    if (status === null) return <XCircle className='h-4 w-4' />;
    switch (status) {
      case AttemptStatusEnumIndex.IN_PROGRESS:
        return <PlayCircle className='h-4 w-4' />;
      case AttemptStatusEnumIndex.COMPLETED:
        return <CheckCircle className='h-4 w-4' />;
      case AttemptStatusEnumIndex.ABANDONED:
        return <XCircle className='h-4 w-4' />;
      default:
        return <XCircle className='h-4 w-4' />;
    }
  };

  const handleFiltersChange = (newFilters: ReadingAttemptFilters) => {
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
    router.push(`/history/practices/details?mode=reading&attemptId=${attemptId}`);
  };

  const handleContinueAttempt = (attemptId: string, passageId: string) => {
    router.push(`/reading/${passageId}/practice?attempt=${attemptId}`);
  };

  console.log();

  return (
    <div className='container mx-auto p-6'>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-tekhelet-500'>
              Reading Practice History
            </h1>
            <p className='text-muted-foreground'>View and manage your reading practice attempts</p>
          </div>
          <div className='flex items-center gap-2'>
            <Badge variant='outline' className='text-selective-yellow-200'>
              {pagination.totalItems} attempt
              {pagination.totalItems !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>

        <ReadingAttemptFilterToolbar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          isLoading={reduxIsLoading}
        />

        {/* Attempts Grid */}
        {reduxIsLoading ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <CardTitle className='h-6 w-3/4 bg-tekhelet-700 rounded animate-pulse mb-2' />
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
        ) : attemptHistoryData.length === 0 ? (
          <Card>
            <CardContent className='pt-6'>
              <div className='text-center py-12'>
                <BookOpen className='h-12 w-12 mx-auto text-gray-400 mb-4' />
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>No attempts found</h3>
                <p className='text-gray-600 mb-4'>
                  {hasActiveFilters()
                    ? 'Try adjusting your search criteria or filters'
                    : "You haven't started any reading practice yet"}
                </p>
                {hasActiveFilters() ? (
                  <Button variant='outline' onClick={handleClearFilters}>
                    Clear all filters
                  </Button>
                ) : (
                  <Button onClick={() => router.push('/reading')}>Start Practice</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {attemptHistoryData.map((attempt) => (
              <Card key={attempt.attempt_id} className='hover:shadow-md transition-shadow'>
                <CardHeader className='min-w-0'>
                  <CardTitle
                    className='text-lg mb-2 w-full truncate text-tekhelet-500'
                    title={attempt.title || 'Untitled Passage'}
                  >
                    {attempt.title || 'Untitled Passage'}
                  </CardTitle>
                  <div className='flex items-center gap-2 mb-2'>
                    <Badge variant='outline' className={getStatusColor(attempt.status)}>
                      {getStatusIcon(attempt.status)}
                      <span className='ml-1'>{getStatusLabel(attempt.status)}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className='h-full'>
                  <div className='space-y-3 flex flex-col justify-between h-full'>
                    {/* Metadata */}
                    <div className='grid grid-cols-2 gap-2 text-sm'>
                      <div className='flex items-center gap-1 text-muted-foreground'>
                        <Calendar className='h-3 w-3' />
                        <span>Started:</span>
                      </div>
                      <span className='text-right'>{formatDate(attempt.start_at)}</span>

                      {attempt.finished_at && (
                        <>
                          <div className='flex items-center gap-1 text-muted-foreground'>
                            <CheckCircle className='h-3 w-3' />
                            <span>Finished:</span>
                          </div>
                          <span className='text-right'>{formatDate(attempt.finished_at)}</span>
                        </>
                      )}

                      <div className='flex items-center gap-1 text-muted-foreground'>
                        <Clock className='h-3 w-3' />
                        <span>Duration:</span>
                      </div>
                      <span className='text-right'>{formatDuration(attempt.duration)}</span>

                      {attempt.total_points !== null && (
                        <>
                          <div className='flex items-center gap-1 text-muted-foreground'>
                            <span>Score:</span>
                          </div>
                          <span className='text-right font-semibold'>
                            {attempt.total_points} points
                          </span>
                        </>
                      )}
                    </div>
                    <div>
                      <Separator className='mb-4' />
                      <div className='flex gap-2'>
                        {attempt.status === AttemptStatusEnumIndex.IN_PROGRESS ? (
                          <Button
                            className='flex-1 bg-selective-yellow-300 hover:bg-selective-yellow-400 text-white'
                            size='sm'
                            onClick={() =>
                              handleContinueAttempt(attempt.attempt_id, attempt.reading_passage_id)
                            }
                          >
                            <PlayCircle className='h-4 w-4' />
                            Continue
                          </Button>
                        ) : (
                          <Button
                            className='flex-1 bg-tekhelet-400 hover:bg-tekhelet-500 text-white'
                            size='sm'
                            onClick={() => handleViewAttempt(attempt.attempt_id)}
                          >
                            <Eye className='h-4 w-4' />
                            View Results
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <PaginationCommon
          pagination={pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  );
};

export default ReadingHistory;
