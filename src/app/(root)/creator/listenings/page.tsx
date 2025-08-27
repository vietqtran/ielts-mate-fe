'use client';

import { ListeningTaskFilterToolbar } from '@/components/features/admin/listening/ListeningTaskFilterToolbar';
import { ListeningTaskTable } from '@/components/features/admin/listening/ListeningTaskTable';
import { Button } from '@/components/ui/button';
import { useListeningTask } from '@/hooks';
import { ListeningTaskFilterParamsCamelCase } from '@/types/listening/listening.types';
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
  const [filters, setFilters] = useState<ListeningTaskFilterParamsCamelCase>({
    page: 1,
    size: 10,
    sortBy: 'updatedAt',
    sortDirection: 'desc',
  });

  const fetchListeningTasks = async () => {
    try {
      // Filter out null/empty values before sending to API
      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        // Skip empty strings, empty arrays, null, undefined
        if (
          value === '' ||
          value === null ||
          value === undefined ||
          (Array.isArray(value) && value.length === 0)
        ) {
          return acc;
        }

        acc[key] = value;
        return acc;
      }, {} as any);

      const response = await getListeningTasksByCreator(cleanFilters);
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

  const handleFilterChange = (newFilters: Partial<ListeningTaskFilterParamsCamelCase>) => {
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
          sortBy: filters.sortBy,
          sortDirection: filters.sortDirection,
        }}
      />
    </div>
  );
}
