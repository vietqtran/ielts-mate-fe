'use client';

import DeleteMarkupModal from '@/components/features/markup/components/DeleteMarkupModal';
import PaginationCommon from '@/components/features/user/common/PaginationCommon';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useDeleteMarkup, useGetMarkupTask } from '@/hooks/apis/markup/useMarkup';
import {
  MarkupFilters,
  clearMarkupFilters,
  setMarkupFilters,
  setMarkupLoading,
  setMarkupPagination,
} from '@/store/slices/markup-slice';
import { GetTaskMarkupParams } from '@/types/markup/markup.types';
import { RootState } from '@/types/store.types';
import { Bookmark, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import MarkupItem from './MarkupItem';
import MarkupFilterToolbar from './components/MarkupFilterToolbar';

export default function MarkupList() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { filters, isLoading, pagination } = useSelector((state: RootState) => state.markupTasks);
  const { deleteMarkupTask } = useDeleteMarkup();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Build API params from filters and pagination
  const apiParams: GetTaskMarkupParams = useMemo(() => {
    const params: any = {
      page: pagination.currentPage.toString(),
      size: pagination.pageSize.toString(),
    };

    // Only add parameters if arrays have values, and join them with commas
    if (filters.markUpType && filters.markUpType.length > 0) {
      params.markupType = filters.markUpType.join(',');
    }
    if (filters.taskType && filters.taskType.length > 0) {
      params.taskType = filters.taskType.join(',');
    }
    if (filters.practiceType && filters.practiceType.length > 0) {
      params.practiceType = filters.practiceType.join(',');
    }

    return params;
  }, [filters, pagination]);

  const { data, error, isLoading: isFetching, mutate } = useGetMarkupTask(apiParams);

  // Update loading state
  useEffect(() => {
    dispatch(setMarkupLoading(isFetching));
  }, [isFetching, dispatch]);

  // Update pagination when data changes
  useEffect(() => {
    if (data?.pagination) {
      dispatch(
        setMarkupPagination({
          totalPages: data.pagination.totalPages,
          pageSize: data.pagination.pageSize,
          totalItems: data.pagination.totalItems,
          hasNextPage: data.pagination.hasNextPage,
          hasPreviousPage: data.pagination.hasPreviousPage,
          currentPage: data.pagination.currentPage,
        })
      );
    }
  }, [data?.pagination, dispatch]);

  // Handle filter changes
  const handleFiltersChange = (newFilters: MarkupFilters) => {
    dispatch(setMarkupFilters(newFilters));
    // Reset to first page when filters change
    dispatch(
      setMarkupPagination({
        ...pagination,
        currentPage: 1,
      })
    );
  };

  // Handle clear filters
  const handleClearFilters = () => {
    dispatch(clearMarkupFilters());
    dispatch(
      setMarkupPagination({
        ...pagination,
        currentPage: 1,
      })
    );
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    dispatch(
      setMarkupPagination({
        ...pagination,
        currentPage: page,
      })
    );
  };

  const handlePageSizeChange = (size: string) => {
    dispatch(
      setMarkupPagination({
        ...pagination,
        pageSize: Number(size),
        currentPage: 1,
      })
    );
  };

  // Handle item deletion
  const handleDelete = async () => {
    try {
      await deleteMarkupTask(deletingId!);
      toast.success('Markup removed successfully');
      mutate();
    } catch (error) {
      toast.error('Failed to remove markup');
      console.error('Error deleting markup:', error);
    }
  };

  // Show error state
  if (error) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-tekhelet-400 mb-2'>My Markup</h1>
          <p className='text-medium-slate-blue-500'>Manage your bookmarked and favorite tasks</p>
        </div>

        <Card className='bg-white/60 backdrop-blur-lg border border-persimmon-200 rounded-2xl shadow-xl'>
          <CardContent className='p-8 text-center'>
            <div className='text-persimmon-600 mb-4'>
              <Heart className='h-12 w-12 mx-auto mb-4' />
              <h3 className='text-lg font-semibold mb-2'>Error Loading Markup</h3>
              <p className='text-sm text-persimmon-500 mb-4'>
                Something went wrong while loading your markup list. Please try again.
              </p>
              <Button
                onClick={() => window.location.reload()}
                className='bg-tekhelet-500 hover:bg-tekhelet-600 text-white'
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
    <>
      <DeleteMarkupModal
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        isOpen={isDeleteModalOpen}
        setIsOpen={setIsDeleteModalOpen}
        title='Delete Markup'
        description='Are you sure you want to remove this markup? This action cannot be undone.'
      />
      <div className='container mx-auto px-4 py-8 space-y-6'>
        {/* Header */}
        <div className='flex justify-between items-center mb-8'>
          <div>
            <h1 className='text-3xl font-bold text-tekhelet-400 mb-2'>My Markup</h1>
            <p className='text-medium-slate-blue-500'>Manage your bookmarked and favorite tasks</p>
          </div>
          <Button
            className='bg-tekhelet-500 hover:bg-tekhelet-600 text-white'
            onClick={() => router.push('/markup/add')}
          >
            <Bookmark className='h-4 w-4' />
            Add Markup
          </Button>
        </div>

        {/* Filter Toolbar */}
        <MarkupFilterToolbar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          isLoading={isLoading}
        />

        {/* Content */}
        {isLoading ? (
          <Card className='backdrop-blur-lg border rounded-2xl'>
            <CardContent className='p-12 text-center'>
              <LoadingSpinner />
              <p className='text-tekhelet-500 mt-4'>Loading your markup...</p>
            </CardContent>
          </Card>
        ) : data?.data && data.data.length > 0 ? (
          <>
            {/* Markup Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {data.data.map((item) => (
                <MarkupItem
                  key={item.markup_id}
                  item={item}
                  onDelete={(markupId) => {
                    setDeletingId(markupId);
                    setIsDeleteModalOpen(true);
                  }}
                />
              ))}
            </div>

            {/* Pagination */}
            <PaginationCommon
              pagination={pagination}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              className='mt-8'
            />
          </>
        ) : (
          // Empty state
          <Card className='backdrop-blur-lg border rounded-2xl'>
            <CardContent className='p-12 text-center'>
              <div className='text-tekhelet-400 mb-4'>
                <Bookmark className='h-16 w-16 mx-auto mb-4' />
                <h3 className='text-xl font-semibold mb-2'>No Markup Found</h3>
                <p className='text-medium-slate-blue-500 max-w-md mx-auto'>
                  You haven't bookmarked or favorited any tasks yet. Start exploring tasks and save
                  the ones you want to practice later.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
