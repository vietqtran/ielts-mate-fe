'use client';

import { PaginationCommon } from '@/components/features/user/common';
import {
  getStatusColor,
  getStatusIcon,
  getStatusLabel,
} from '@/components/features/user/history/practice/common/cardUtils';
import { ListeningAttemptFilterToolbar } from '@/components/features/user/history/practice/listening/ListeningAttemptFilterToolbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import useListeningAttempt from '@/hooks/apis/listening/useListeningAttempt';
import {
  ListeningAttemptFilters,
  clearFilters,
  setFilters,
  setLoading,
  setPagination,
} from '@/store/slices/listening-attempt-filter-slice';
import { AttemptStatusEnumIndex, ListeningAttemptHistoryResponse } from '@/types/attempt.types';
import { RootState } from '@/types/store.types';
import { formatDate, formatDuration } from '@/utils/time';
import { BookOpen, Calendar, CheckCircle, Clock, Eye, PlayCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const ListeningHistory = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { getAllListeningAttemptHistory } = useListeningAttempt();
  const [attemptHistoryData, setAttemptHistoryData] = useState<ListeningAttemptHistoryResponse[]>(
    []
  );

  // Get state from Redux
  const filters = useSelector((state: RootState) => state.listeningAttempt.filters);
  const reduxIsLoading = useSelector((state: RootState) => state.listeningAttempt.isLoading);
  const pagination = useSelector((state: RootState) => state.listeningAttempt.pagination);

  // Load attempts when dependencies change
  useEffect(() => {
    const loadAttempts = async () => {
      try {
        dispatch(setLoading(true));
        const response = await getAllListeningAttemptHistory({
          page: pagination?.currentPage,
          size: pagination?.pageSize,
          ieltsType: filters.ieltsType,
          partNumber: filters.partNumber,
          status: filters.status,
          title: filters.title,
          listeningTaskId: filters.listeningTaskId,
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
        console.error('Failed to load listening attempt history:', err);
      } finally {
        dispatch(setLoading(false));
      }
    };

    loadAttempts();
  }, [
    filters.ieltsType,
    filters.partNumber,
    filters.status,
    filters.title,
    pagination?.pageSize,
    filters.questionCategory,
    pagination?.currentPage,
    filters.listeningTaskId,
    filters.questionCategory,
    filters.sortBy,
    filters.sortDirection,
  ]);

  const handleFiltersChange = (newFilters: ListeningAttemptFilters) => {
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
    router.push(`/history/practices/details?mode=listening&attemptId=${attemptId}`);
  };

  const handleContinueAttempt = (attemptId: string, passageId: string) => {
    router.push(`/listening/${passageId}/practice?attempt=${attemptId}`);
  };

  return (
    <div className='container mx-auto p-6'>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-tekhelet-500'>
              Listening Practice History
            </h1>
            <p className='text-muted-foreground'>
              View and manage your listening practice attempts
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Badge variant='outline' className='text-selective-yellow-200'>
              {pagination?.totalItems || 0} attempt
              {(pagination?.totalItems || 0) !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>

        <ListeningAttemptFilterToolbar
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
                          <span className='text-right font-semibold'>{attempt.total_points}</span>
                        </>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div>
                      <Separator className='mb-4' />
                      <div className='flex gap-2'>
                        {attempt.status === AttemptStatusEnumIndex.IN_PROGRESS ? (
                          <Button
                            className='flex-1 bg-selective-yellow-300 hover:bg-selective-yellow-400 text-white'
                            size='sm'
                            onClick={() =>
                              handleContinueAttempt(attempt.attempt_id, attempt.listening_task_id)
                            }
                          >
                            <PlayCircle className='h-4 w-4' />
                            Continue
                          </Button>
                        ) : (
                          <Button
                            className='flex-1 bg-tekhelet-400 hover:bg-tekhelet-500 text-white'
                            variant='outline'
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

export default ListeningHistory;
