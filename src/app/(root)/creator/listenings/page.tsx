'use client';

import { ListeningTaskFilterToolbar } from '@/components/features/admin/listening/ListeningTaskFilterToolbar';
import { ListeningTaskTable } from '@/components/features/admin/listening/ListeningTaskTable';
import { Button } from '@/components/ui/button';
import { useListeningTask } from '@/hooks';
import { ListeningTaskFilterParams } from '@/types/listening/listening.types';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ListeningsPage() {
  const router = useRouter();
  const { getListeningTasksByCreator, isLoading } = useListeningTask();
  const [listeningTasks, setListeningTasks] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 10,
    pageSize: 10,
    totalItems: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [filters, setFilters] = useState<ListeningTaskFilterParams>({
    page: 1,
    size: 10,
    sort_by: 'updatedAt',
    sort_direction: 'desc',
  });

  const fetchListeningTasks = async () => {
    try {
      const response = await getListeningTasksByCreator(filters);
      if (response) {
        setListeningTasks(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }
    } catch (error) {
      console.error('Failed to fetch listening tasks:', error);
    }
  };

  useEffect(() => {
    fetchListeningTasks();
  }, [filters]);

  const handleFilterChange = (newFilters: Partial<ListeningTaskFilterParams>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  };

  const handleAddNew = () => {
    router.push('/creator/listenings/create');
  };

  const handleRefresh = () => {
    fetchListeningTasks();
  };

  return (
    <div className='container mx-auto p-4 space-y-6'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold'>Listening Tasks</h1>
        <div className='flex gap-2'>
          <Button
            onClick={handleRefresh}
            variant='outline'
            disabled={isLoading['getListeningTasks']}
          >
            Refresh
          </Button>
          <Button onClick={handleAddNew}>Add New</Button>
        </div>
      </div>

      <ListeningTaskFilterToolbar filters={filters} onFilterChange={handleFilterChange} />

      <ListeningTaskTable
        data={listeningTasks}
        isLoading={isLoading['getListeningTasks']}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSortChange={handleFilterChange}
        currentSort={{
          sort_by: filters.sort_by,
          sort_direction: filters.sort_direction,
        }}
      />
    </div>
  );
}
