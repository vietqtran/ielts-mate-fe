'use client';

import ReadingAttemptFilterToolbar from '@/components/features/user/history/practice/reading/ReadingAttemptFilterToolbar';
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
import useReadingExamAttempt from '@/hooks/apis/reading/useReadingExamAttempt';
import { ReadingAttemptFilters } from '@/store/slices/reading-attempt-filter-slice';
import {
  clearReadingExamAttemptFilters,
  setReadingExamAttemptCurrentPage,
  setReadingExamAttemptFilters,
  setReadingExamAttemptLoading,
  setReadingExamAttemptPagination,
  setReadingExamAttemptSortBy,
  setReadingExamAttemptSortDirection,
} from '@/store/slices/reading-exam-attempt-filter-slice';
import { ReadingExamAttempt } from '@/types/reading/reading-exam-attempt.types';
import { RootState } from '@/types/store.types';
import { BookOpen, Calendar, Clock, Eye, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const ReadingExamHistory = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { getExamAttemptHistory } = useReadingExamAttempt();
  const [attemptHistoryData, setAttemptHistoryData] = useState<ReadingExamAttempt[]>([]);

  // Get state from Redux
  const filters = useSelector((state: RootState) => state.readingExamAttempt.filters);
  const currentPage = useSelector((state: RootState) => state.readingExamAttempt.currentPage);
  const sortBy = useSelector((state: RootState) => state.readingExamAttempt.sortBy);
  const sortDirection = useSelector((state: RootState) => state.readingExamAttempt.sortDirection);
  const reduxIsLoading = useSelector((state: RootState) => state.readingExamAttempt.isLoading);
  const pagination = useSelector((state: RootState) => state.readingExamAttempt.pagination);

  // Load attempts when dependencies change
  useEffect(() => {
    const loadAttempts = async () => {
      try {
        dispatch(setReadingExamAttemptLoading(true));
        const response = await getExamAttemptHistory();

        if (response) {
          setAttemptHistoryData(response || []);

          // Update pagination state from response length (since API doesn't provide pagination)
          dispatch(
            setReadingExamAttemptPagination({
              totalPages: Math.ceil((response?.length || 0) / (pagination?.pageSize || 12)),
              pageSize: pagination?.pageSize || 12,
              totalItems: response?.length || 0,
              hasNextPage:
                currentPage < Math.ceil((response?.length || 0) / (pagination?.pageSize || 12)),
              hasPreviousPage: currentPage > 1,
            })
          );
        }
      } catch (err) {
        console.error('Failed to load reading exam attempt history:', err);
      } finally {
        dispatch(setReadingExamAttemptLoading(false));
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
    currentPage,
    pagination?.pageSize,
  ]);

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
    dispatch(setReadingExamAttemptFilters(newFilters));
    dispatch(setReadingExamAttemptCurrentPage(1));
  };

  const handleClearFilters = () => {
    dispatch(clearReadingExamAttemptFilters());
  };

  const handleSortByChange = (field: string) => {
    dispatch(setReadingExamAttemptSortBy(field));
  };

  const handleSortDirectionChange = (direction: 'asc' | 'desc') => {
    dispatch(setReadingExamAttemptSortDirection(direction));
  };

  const handlePageChange = (page: number) => {
    dispatch(setReadingExamAttemptCurrentPage(page));
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
    router.push(`/history/exams/details?mode=reading&examId=${attemptId}`);
  };

  // Filter and sort data locally since the API doesn't support these operations
  const getFilteredAndSortedData = () => {
    let filteredData = [...attemptHistoryData];

    // Apply title filter
    if (filters.title) {
      filteredData = filteredData.filter((attempt) =>
        attempt.reading_exam.reading_exam_name.toLowerCase().includes(filters.title!.toLowerCase())
      );
    }

    // Apply sorting
    filteredData.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'finishedAt':
        case 'createdAt':
          aValue = new Date(a.created_at || 0);
          bValue = new Date(b.created_at || 0);
          break;
        case 'duration':
          aValue = a.duration || 0;
          bValue = b.duration || 0;
          break;
        case 'totalPoints':
          // Exam attempts don't have total points, so we'll sort by total questions
          aValue = a.total_question || 0;
          bValue = b.total_question || 0;
          break;
        default:
          aValue = new Date(a.created_at || 0);
          bValue = new Date(b.created_at || 0);
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Apply pagination
    const startIndex = (currentPage - 1) * (pagination?.pageSize || 12);
    const endIndex = startIndex + (pagination?.pageSize || 12);

    return filteredData.slice(startIndex, endIndex);
  };

  const filteredAndSortedData = getFilteredAndSortedData();

  return (
    <div className='container mx-auto p-6'>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-tekhelet-500'>
              Reading Exam History
            </h1>
            <p className='text-tekhelet-600'>View and manage your reading exam attempts</p>
          </div>
          <div className='flex items-center gap-2'>
            <Badge variant='secondary' className='backdrop-blur-lg text-tekhelet-500'>
              {attemptHistoryData.length} attempt
              {attemptHistoryData.length !== 1 ? 's' : ''}
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
              <Card key={i} className='bg-white backdrop-blur-lg border rounded-2xl shadow-xl'>
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
        ) : filteredAndSortedData.length === 0 ? (
          <Card className='backdrop-blur-lg rounded-2xl shadow-xl'>
            <CardContent className='pt-6'>
              <div className='text-center py-12'>
                <BookOpen className='h-12 w-12 mx-auto text-tekhelet-400 mb-4' />
                <h3 className='text-lg font-semibold text-tekhelet-700 mb-2'>
                  No exam attempts found
                </h3>
                <p className='text-tekhelet-500 mb-4'>
                  {hasActiveFilters()
                    ? 'Try adjusting your search criteria or filters'
                    : "You haven't started any reading exams yet"}
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
                    onClick={() => router.push('/exams/reading')}
                    className='bg-[var(--color-selective-yellow-500)] text-[var(--color-tekhelet-900)] hover:bg-[var(--color-selective-yellow-400)]'
                  >
                    Start Exam
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredAndSortedData.map((attempt) => (
              <Card
                key={attempt.exam_attempt_id}
                className='bg-white backdrop-blur-lg rounded-2xl shadow-xl hover:shadow-2xl transition-shadow'
              >
                <CardHeader>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <CardTitle className='text-lg mb-2 line-clamp-2 text-tekhelet-700'>
                        {attempt.reading_exam.reading_exam_name || 'Untitled Exam'}
                      </CardTitle>
                      <div className='flex items-center gap-2 mb-2'>
                        <Badge variant={'outline'} className='bg-emerald-100 !text-emerald-800'>
                          Completed
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    {/* Exam Description */}
                    {attempt.reading_exam.reading_exam_description && (
                      <p className='text-sm text-tekhelet-500 line-clamp-2'>
                        {attempt.reading_exam.reading_exam_description}
                      </p>
                    )}

                    {/* Metadata */}
                    <div className='grid grid-cols-2 gap-2 text-sm'>
                      <div className='flex items-center gap-1 text-[var(--color-tekhelet-500)]'>
                        <Calendar className='h-3 w-3' />
                        <span>Started:</span>
                      </div>
                      <span className='text-right text-[var(--color-tekhelet-700)]'>
                        {formatDate(attempt.created_at)}
                      </span>

                      <div className='flex items-center gap-1 text-[var(--color-tekhelet-500)]'>
                        <Clock className='h-3 w-3' />
                        <span>Duration:</span>
                      </div>
                      <span className='text-right text-[var(--color-tekhelet-700)]'>
                        {formatDuration(attempt.duration)}
                      </span>

                      <div className='flex items-center gap-1 text-[var(--color-tekhelet-500)]'>
                        <Users className='h-3 w-3' />
                        <span>Questions:</span>
                      </div>
                      <span className='text-right font-semibold text-[var(--color-tekhelet-700)]'>
                        {attempt.total_question} questions
                      </span>
                    </div>

                    <Separator className='bg-[var(--color-tekhelet-200)]' />

                    {/* Action buttons */}
                    <div className='flex gap-2'>
                      <Button
                        className='flex-1 bg-selective-yellow-300 text-white hover:bg-selective-yellow-400'
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
        {!reduxIsLoading &&
          filteredAndSortedData.length > 0 &&
          (pagination?.totalPages || 0) > 1 && (
            <div className='flex items-center justify-between mt-8'>
              <div className='text-sm text-[var(--color-tekhelet-500)]'>
                Showing {(currentPage - 1) * (pagination?.pageSize || 12) + 1} to{' '}
                {Math.min(currentPage * (pagination?.pageSize || 12), attemptHistoryData.length)} of{' '}
                {attemptHistoryData.length} entries
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
                      className={
                        !pagination?.hasPreviousPage
                          ? 'pointer-events-none opacity-50'
                          : 'text-tekhelet-700 hover:bg-tekhelet-200'
                      }
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
                      className={
                        !pagination?.hasNextPage
                          ? 'pointer-events-none opacity-50'
                          : 'text-tekhelet-700 hover:bg-tekhelet-200'
                      }
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

export default ReadingExamHistory;
