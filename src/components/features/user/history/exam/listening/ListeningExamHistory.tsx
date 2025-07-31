'use client';

import { PaginationCommon } from '@/components/features/user/common';
import ListeningAttemptFilterToolbar from '@/components/features/user/history/practice/listening/ListeningAttemptFilterToolbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useListeningExam } from '@/hooks/apis/listening/useListeningExam';
import { ListeningAttemptFilters } from '@/store/slices/listening-attempt-filter-slice';
import { ListeningExamAttemptsHistoryResponse } from '@/types/listening/listening-exam.types';
import { Calendar, Clock, Eye, Headphones, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const ListeningExamHistory = () => {
  const router = useRouter();
  const { getListeningExamAttemptsHistory } = useListeningExam();
  const [attemptHistoryData, setAttemptHistoryData] = useState<
    ListeningExamAttemptsHistoryResponse[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Local filter state (not using Redux slices as requested)
  const [filters, setFilters] = useState<ListeningAttemptFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const pageSize = 12;

  // Load attempts when dependencies change
  useEffect(() => {
    const loadAttempts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getListeningExamAttemptsHistory({
          attempt_id: '',
        }); // API doesn't seem to use this param based on the hook

        if (response?.data) {
          setAttemptHistoryData(response.data || []);
        }
      } catch (err) {
        console.error('Failed to load listening exam attempt history:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAttempts();
  }, []);

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

  const handleFiltersChange = (newFilters: ListeningAttemptFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const handleSortByChange = (field: string) => {
    setSortBy(field);
  };

  const handleSortDirectionChange = (direction: 'asc' | 'desc') => {
    setSortDirection(direction);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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

  // Filter and sort data locally since the API doesn't support these operations
  const getFilteredAndSortedData = () => {
    let filteredData = [...attemptHistoryData];

    // Apply title filter
    if (filters.title) {
      filteredData = filteredData.filter((attempt) =>
        attempt.listening_exam.listening_exam_name
          .toLowerCase()
          .includes(filters.title!.toLowerCase())
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
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    return filteredData.slice(startIndex, endIndex);
  };

  const filteredAndSortedData = getFilteredAndSortedData();
  const totalPages = Math.ceil(attemptHistoryData.length / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  if (error) {
    return (
      <div className='container mx-auto p-6'>
        <Card className='bg-white/60 backdrop-blur-lg border rounded-2xl shadow-xl'>
          <CardContent className='pt-6'>
            <div className='text-center py-12'>
              <Headphones className='h-12 w-12 mx-auto text-persimmon-300 mb-4' />
              <h3 className='text-lg font-semibold text-tekhelet-700 mb-2'>
                Failed to load exam history
              </h3>
              <p className='text-tekhelet-500 mb-4'>
                There was an error loading your listening exam attempts. Please try again.
              </p>
              <Button
                onClick={() => window.location.reload()}
                className='bg-selective-yellow-300 text-tekhelet-900 hover:bg-selective-yellow-400'
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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

        <ListeningAttemptFilterToolbar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSortByChange={handleSortByChange}
          onSortDirectionChange={handleSortDirectionChange}
          isLoading={isLoading}
        />

        {/* Attempts Grid */}
        {isLoading ? (
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
        ) : filteredAndSortedData.length === 0 ? (
          <Card className='bg-white/60 backdrop-blur-lg border rounded-2xl shadow-xl'>
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
            {filteredAndSortedData.map((attempt) => (
              <Card
                key={attempt.exam_attempt_id}
                className='bg-white/60 backdrop-blur-lg border rounded-2xl shadow-xl hover:shadow-2xl transition-shadow'
              >
                <CardHeader>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <CardTitle className='text-lg mb-2 line-clamp-2 text-tekhelet-700'>
                        {attempt.listening_exam.listening_exam_name || 'Untitled Exam'}
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

                    <Separator className='bg-tekhelet-200' />

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
          pagination={{
            currentPage,
            totalPages,
            pageSize,
            totalItems: attemptHistoryData.length,
            hasNextPage,
            hasPreviousPage,
          }}
          onPageChange={handlePageChange}
          onPageSizeChange={() => {}}
        />
      </div>
    </div>
  );
};

export default ListeningExamHistory;
