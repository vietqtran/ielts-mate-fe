'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Separator } from '@/components/ui/separator';
import useReadingAttempt from '@/hooks/apis/reading/useReadingAttempt';
import {
  ReadingAttemptFilters,
  clearReadingAttemptFilters,
  setReadingAttemptCurrentPage,
  setReadingAttemptFilters,
  setReadingAttemptLoading,
  setReadingAttemptPagination,
  setReadingAttemptSortBy,
  setReadingAttemptSortDirection,
} from '@/store/slices/reading-attempt-filter-slice';
import { AttemptStatusEnumIndex, ReadingAttemptHistoryResponse } from '@/types/attempt.types';
import { RootState } from '@/types/store.types';
import { BookOpen, Calendar, CheckCircle, Clock, Eye, PlayCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReadingAttemptFilterToolbar from './ReadingAttemptFilterToolbar';

const ReadingHistory = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { getAllReadingAttemptHistory } = useReadingAttempt();
  const [attemptHistoryData, setAttemptHistoryData] = useState<ReadingAttemptHistoryResponse[]>([]);

  // Get state from Redux
  const filters = useSelector((state: RootState) => state.readingAttempt.filters);
  const currentPage = useSelector((state: RootState) => state.readingAttempt.currentPage);
  const sortBy = useSelector((state: RootState) => state.readingAttempt.sortBy);
  const sortDirection = useSelector((state: RootState) => state.readingAttempt.sortDirection);
  const reduxIsLoading = useSelector((state: RootState) => state.readingAttempt.isLoading);
  const pagination = useSelector((state: RootState) => state.readingAttempt.pagination);

  // Load attempts when dependencies change
  useEffect(() => {
    const loadAttempts = async () => {
      try {
        dispatch(setReadingAttemptLoading(true));
        const response = await getAllReadingAttemptHistory({
          page: currentPage,
          size: pagination?.pageSize || 12,
          ieltsType: filters.ieltsType,
          partNumber: filters.partNumber,
          status: filters.status,
          title: filters.title,
          sortBy,
          sortDirection,
        });

        if (response) {
          setAttemptHistoryData(response.data || []);

          // Update pagination state from response
          if (response.pagination) {
            dispatch(
              setReadingAttemptPagination({
                totalPages: response.pagination.totalPages,
                pageSize: response.pagination.pageSize,
                totalItems: response.pagination.totalItems,
                hasNextPage: response.pagination.hasNextPage,
                hasPreviousPage: response.pagination.hasPreviousPage,
              })
            );
          }
        }
      } catch (err) {
        console.error('Failed to load reading attempt history:', err);
      } finally {
        dispatch(setReadingAttemptLoading(false));
      }
    };

    loadAttempts();
  }, [
    filters.ieltsType,
    filters.partNumber,
    filters.status,
    filters.title,
    sortBy,
    sortDirection,
    pagination?.pageSize,
  ]);

  // Load attempts when page changes (pagination)
  useEffect(() => {
    const loadAttempts = async () => {
      try {
        dispatch(setReadingAttemptLoading(true));
        const response = await getAllReadingAttemptHistory({
          page: currentPage,
          size: pagination?.pageSize || 12,
          ieltsType: filters.ieltsType,
          partNumber: filters.partNumber,
          status: filters.status,
          title: filters.title,
          sortBy,
          sortDirection,
        });

        if (response) {
          setAttemptHistoryData(response.data || []);

          // Update pagination state from response
          if (response.pagination) {
            dispatch(
              setReadingAttemptPagination({
                totalPages: response.pagination.totalPages,
                pageSize: response.pagination.pageSize,
                totalItems: response.pagination.totalItems,
                hasNextPage: response.pagination.hasNextPage,
                hasPreviousPage: response.pagination.hasPreviousPage,
              })
            );
          }
        }
      } catch (err) {
        console.error('Failed to load reading attempt history:', err);
      } finally {
        dispatch(setReadingAttemptLoading(false));
      }
    };

    loadAttempts();
  }, [currentPage]);

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

  const formatDuration = (duration: number | null): string => {
    if (!duration) return 'N/A';
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleFiltersChange = (newFilters: ReadingAttemptFilters) => {
    dispatch(setReadingAttemptFilters(newFilters));
    dispatch(setReadingAttemptCurrentPage(1));
  };

  const handleClearFilters = () => {
    dispatch(clearReadingAttemptFilters());
  };

  const handleSortByChange = (field: string) => {
    dispatch(setReadingAttemptSortBy(field));
  };

  const handleSortDirectionChange = (direction: 'asc' | 'desc') => {
    dispatch(setReadingAttemptSortDirection(direction));
  };

  const handlePageChange = (page: number) => {
    dispatch(setReadingAttemptCurrentPage(page));
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
    router.push(`/history/practices/reading/${attemptId}`);
  };

  const handleContinueAttempt = (attemptId: string, passageId: string) => {
    router.push(`/reading/${passageId}/practice?attempt=${attemptId}`);
  };

  return (
    <div className='container mx-auto p-6'>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Reading Practice History</h1>
            <p className='text-muted-foreground'>View and manage your reading practice attempts</p>
          </div>
          <div className='flex items-center gap-2'>
            <Badge variant='secondary'>
              {pagination?.totalItems || 0} attempt
              {(pagination?.totalItems || 0) !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>

        <ReadingAttemptFilterToolbar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSortByChange={handleSortByChange}
          onSortDirectionChange={handleSortDirectionChange}
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
                      <CardTitle className='h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-2' />
                      <div className='flex items-center gap-2 mb-2'>
                        <div className='h-4 w-20 bg-gray-200 rounded animate-pulse' />
                        <div className='h-4 w-16 bg-gray-200 rounded animate-pulse' />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    <div className='h-4 w-full bg-gray-200 rounded animate-pulse' />
                    <div className='h-4 w-full bg-gray-200 rounded animate-pulse' />
                    <div className='h-4 w-2/3 bg-gray-200 rounded animate-pulse' />
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
                <CardHeader>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <CardTitle className='text-lg mb-2 line-clamp-2'>
                        {attempt.title || 'Untitled Passage'}
                      </CardTitle>
                      <div className='flex items-center gap-2 mb-2'>
                        <Badge variant='secondary' className={getStatusColor(attempt.status)}>
                          {getStatusIcon(attempt.status)}
                          <span className='ml-1'>{getStatusLabel(attempt.status)}</span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
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

                    <Separator />

                    {/* Action buttons */}
                    <div className='flex gap-2'>
                      {attempt.status === AttemptStatusEnumIndex.IN_PROGRESS ? (
                        <Button
                          className='flex-1'
                          size='sm'
                          onClick={() =>
                            handleContinueAttempt(attempt.attempt_id, attempt.reading_passage_id)
                          }
                        >
                          <PlayCircle className='h-4 w-4 mr-2' />
                          Continue
                        </Button>
                      ) : (
                        <Button
                          className='flex-1'
                          variant='outline'
                          size='sm'
                          onClick={() => handleViewAttempt(attempt.attempt_id)}
                        >
                          <Eye className='h-4 w-4 mr-2' />
                          View Results
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!reduxIsLoading && attemptHistoryData.length > 0 && (pagination?.totalPages || 0) > 1 && (
          <div className='flex items-center justify-between mt-8'>
            <div className='text-sm text-muted-foreground'>
              Showing {(currentPage - 1) * (pagination?.pageSize || 12) + 1} to{' '}
              {Math.min(currentPage * (pagination?.pageSize || 12), pagination?.totalItems || 0)} of{' '}
              {pagination?.totalItems || 0} entries
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href='#'
                    onClick={(e) => {
                      e.preventDefault();
                      if (pagination?.hasPreviousPage) {
                        handlePageChange(currentPage - 1);
                      }
                    }}
                    className={!pagination?.hasPreviousPage ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>

                <PaginationItem>
                  <PaginationNext
                    href='#'
                    onClick={(e) => {
                      e.preventDefault();
                      if (pagination?.hasNextPage) {
                        handlePageChange(currentPage + 1);
                      }
                    }}
                    className={!pagination?.hasNextPage ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadingHistory;
