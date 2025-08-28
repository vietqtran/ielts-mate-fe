'use client';

import PaginationCommon from '@/components/features/user/common/PaginationCommon';
import { UserListeningTasksFilterToolbar } from '@/components/features/user/listening/UserListeningTasksFilterToolbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { useListeningTask } from '@/hooks';
import { usePageTitle } from '@/hooks/usePageTitle';
import {
  clearFilters,
  setFilters,
  setLoading,
  setPagination,
} from '@/store/slices/listening-filter-slice';
import { UserPassageFilters } from '@/store/slices/reading-filter-slices';
import { ListeningTaskResponse } from '@/types/listening/listening.types';
import { BaseResponse } from '@/types/reading/reading.types';
import { RootState } from '@/types/store.types';
import { buildCreatedByList } from '@/utils/filter';
import { BookOpen, Calendar, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const Listening = () => {
  usePageTitle('Listening');

  const dispatch = useDispatch();
  const router = useRouter();
  const { getListeningTasks, isLoading, error } = useListeningTask();
  const [listenings, setListenings] = useState<ListeningTaskResponse[]>([]);

  // Get state from Redux - using separate selectors to prevent unnecessary re-renders
  const filters = useSelector((state: RootState) => state.listeningTasks.filters);
  const reduxIsLoading = useSelector((state: RootState) => state.listeningTasks.isLoading);
  const pagination = useSelector((state: RootState) => state.listeningTasks.pagination);

  const createdByArray = useMemo(() => {
    return listenings.map((p) => p.created_by);
  }, [listenings]);

  const createdByOptions = useMemo(() => {
    return buildCreatedByList(createdByArray);
  }, [createdByArray]);

  // Pagination states
  const isGridLoading = reduxIsLoading || isLoading.getListeningTasks;

  useEffect(() => {
    const loadPassages = async () => {
      try {
        dispatch(setLoading(true));
        //@ts-ignore
        const response: BaseResponse<ListeningTaskResponse[]> = await getListeningTasks({
          page: pagination?.currentPage,
          size: pagination?.pageSize,
          ielts_type: filters.ieltsType,
          part_number: filters.partNumber,
          title: filters.title,
          created_by: filters.createdBy,
          sort_by: filters.sortBy,
          sort_direction: filters.sortDirection,
          question_category: filters.questionCategory,
          status: filters.status,
        });
        setListenings(response.data || []);

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
      } catch (err) {
        console.error('Failed to load listenings:', err);
      } finally {
        dispatch(setLoading(false));
      }
    };

    loadPassages();
  }, [
    JSON.stringify(filters.ieltsType),
    JSON.stringify(filters.partNumber),
    filters.title,
    filters.createdBy,
    filters.sortBy,
    filters.sortDirection,
    filters.questionCategory,
    filters.status,
    pagination?.pageSize,
    pagination?.currentPage,
  ]);

  const getIeltsTypeLabel = (type: number): string => {
    switch (type) {
      case 0: // ACADEMIC
        return 'Academic';
      case 1: // GENERAL_TRAINING
        return 'General Training';
      default:
        return 'Unknown';
    }
  };

  const getIeltsTypeBadgeColor = (type: number): string => {
    switch (type) {
      case 0: // ACADEMIC
        return 'bg-blue-100 text-blue-800';
      case 1: // GENERAL_TRAINING
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPartNumberLabel = (partNumber: number): string => {
    switch (partNumber) {
      case 0: // PART_1
        return 'Part 1';
      case 1: // PART_2
        return 'Part 2';
      case 2: // PART_3
        return 'Part 3';
      case 3: // PART_4
        return 'Part 4';
      default:
        return `Part ${partNumber + 1}`;
    }
  };

  const handleFiltersChange = (newFilters: UserPassageFilters) => {
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

  if (error.getActiveListenings) {
    return (
      <div className='container mx-auto p-6'>
        <Card className='border-red-200'>
          <CardContent className='pt-6'>
            <div className='text-center text-red-600'>
              <p className='text-lg font-semibold'>Error loading listening task</p>
              <p className='text-sm mt-1'>{error.getActiveListenings.message}</p>
              <Button variant='outline' className='mt-4' onClick={() => window.location.reload()}>
                Try Again
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
            <h1 className='text-2xl font-bold tracking-tight text-tekhelet-400'>Listening Tasks</h1>
            <p className='text-muted-foreground'>
              Practice with IELTS listening tasks and improve your skills
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Badge variant='outline' className='text-tekhelet-600 backdrop-blur-md'>
              {pagination?.totalItems || 0} task
              {(pagination?.totalItems || 0) !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>

        <UserListeningTasksFilterToolbar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          isLoading={reduxIsLoading || isLoading.getActivePassages}
          createdByOptions={createdByOptions}
        />
        {/* Listening Tasks Grid */}
        {isGridLoading ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <CardTitle className='h-6 w-3/4 bg-tekhelet-800 rounded animate-pulse mb-2' />
                      <div className='flex items-center gap-2 mb-2'>
                        <div className='h-4 w-20 bg-tekhelet-800 rounded animate-pulse' />
                        <div className='h-4 w-16 bg-tekhelet-800 rounded animate-pulse' />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    <div className='h-4 w-full bg-tekhelet-800 rounded animate-pulse' />
                    <div className='h-4 w-full bg-tekhelet-800 rounded animate-pulse' />
                    <div className='h-4 w-2/3 bg-tekhelet-800 rounded animate-pulse' />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : listenings.length === 0 ? (
          <Card>
            <CardContent className='pt-6'>
              <div className='text-center py-12'>
                <BookOpen className='h-12 w-12 mx-auto text-gray-400 mb-4' />
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                  No listening tasks found
                </h3>
                <p className='text-gray-600 mb-4'>
                  {hasActiveFilters()
                    ? 'Try adjusting your search criteria or filters'
                    : 'There are no active listening tasks available at the moment'}
                </p>
                {hasActiveFilters() && (
                  <Button variant='outline' onClick={handleClearFilters}>
                    Clear all filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {listenings.map((listening) => (
              <Card key={listening.task_id} className='hover:shadow-md transition-shadow'>
                <CardHeader className='min-w-0'>
                  <CardTitle
                    className='text-lg leading-tight mb-2 text-tekhelet-500 w-full truncate'
                    title={listening.title}
                  >
                    {listening.title}
                  </CardTitle>
                  <div className='flex items-center gap-2 mb-2'>
                    <Badge
                      className={getIeltsTypeBadgeColor(listening.ielts_type)}
                      variant='outline'
                      title={`IELTS Type: ${getIeltsTypeLabel(listening.ielts_type)}`}
                    >
                      {getIeltsTypeLabel(listening.ielts_type)}
                    </Badge>
                    <Badge
                      variant='outline'
                      title={`Part: ${getPartNumberLabel(listening.part_number)}`}
                    >
                      {getPartNumberLabel(listening.part_number)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between text-xs text-muted-foreground'>
                      <div
                        className='flex items-center gap-1'
                        title={`Created by: ${listening.created_by.first_name} ${listening.created_by.last_name}`}
                      >
                        <User className='h-3 w-3' />
                        <span className='truncate'>
                          {listening.created_by.first_name} {listening.created_by.last_name}
                        </span>
                      </div>
                      <div
                        className='flex items-center gap-1'
                        title={`Created at: ${new Date(listening.created_at).toLocaleString()}`}
                      >
                        <Calendar className='h-3 w-3' />
                        <span>{new Date(listening.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      className='w-full bg-selective-yellow-300 hover:bg-selective-yellow-400'
                      size='sm'
                      onClick={() => router.push(`/listening/${listening.task_id}/practice`)}
                    >
                      <BookOpen className='h-4 w-4 mr-2' />
                      Start Listening
                    </Button>
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

export default Listening;
