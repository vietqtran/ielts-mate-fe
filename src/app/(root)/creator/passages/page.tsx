'use client';

import { CURRENT_PAGE_SESSION_STORAGE_KEY, PAGES } from '@/constants/pages';
import {
  PassageFilters,
  clearFilters,
  setFilters,
  setSortBy,
  setSortDirection,
} from '@/store/slices/passage-slice';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { NavigationHandler } from '@/components/layout/NavigationHandler';

import { CreatePassageModal } from '@/components/features/admin/reading/CreatePassageModal';
import { PassageFilterToolbar } from '@/components/features/admin/reading/PassageFilterToolbar';
import { PassageTable } from '@/components/features/admin/reading/PassageTable';
import { ViewPassageModal } from '@/components/features/admin/reading/ViewPassageModal';
import { Button } from '@/components/ui/button';
import { usePassage } from '@/hooks/apis/reading/usePassage';
import { PassageGetResponse } from '@/types/reading/reading.types';
import { RootState } from '@/types/store.types';
import { PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PassagesPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { getPassagesForTeacher, deletePassage, isLoading } = usePassage();

  // Get state from Redux
  const passageState = useSelector((state: RootState) => state.passage);
  const { filters, sortBy, sortDirection } = passageState;

  // Migrate old data on component mount only
  useEffect(() => {
    const migratedFilters = { ...filters };
    let needsMigration = false;

    if (migratedFilters.ieltsType !== undefined && !Array.isArray(migratedFilters.ieltsType)) {
      needsMigration = true;
    }
    if (migratedFilters.status !== undefined && !Array.isArray(migratedFilters.status)) {
      needsMigration = true;
    }
    if (migratedFilters.partNumber !== undefined && !Array.isArray(migratedFilters.partNumber)) {
      needsMigration = true;
    }

    if (needsMigration) {
      dispatch(setFilters(migratedFilters));
    }
  }, []);

  const [passages, setPassages] = useState<PassageGetResponse[]>([]);
  const [selectedPassage, setSelectedPassage] = useState<PassageGetResponse | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalItems: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(CURRENT_PAGE_SESSION_STORAGE_KEY, PAGES.PASSAGES.LIST);
    }
  }, []);

  const loadPassages = async (page = 1, size = 10) => {
    try {
      const response = await getPassagesForTeacher({
        page,
        size,
        sortBy,
        sortDirection,
        ielts_type: filters.ieltsType,
        status: filters.status,
        part_number: filters.partNumber,
        questionCategory: filters.questionCategory,
        title: filters.title,
        createdBy: filters.createdBy,
      });
      if (response?.data) {
        setPassages(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadPassages(1, pagination.pageSize);

    return () => {
      setPassages([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        pageSize: 10,
        totalItems: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      });
      setSelectedPassage(null);
      setIsCreateModalOpen(false);
      setIsViewModalOpen(false);
    };
  }, [filters, sortBy, sortDirection]);

  const handleCreatePassage = () => {
    router.push('/creator/passages/create');
  };

  const handleViewPassage = (passage: PassageGetResponse) => {
    setSelectedPassage(passage);
    setIsViewModalOpen(true);
  };

  const handleEditPassage = (passage: PassageGetResponse) => {
    router.push(`/creator/passages/${passage.passage_id}/edit`);
  };

  const handlePreviewPassage = (passage: PassageGetResponse) => {
    router.push(`/creator/passages/${passage.passage_id}/preview`);
  };

  const handleDeletePassage = async (passage_id: string) => {
    try {
      await deletePassage(passage_id);
      await loadPassages(pagination.currentPage, pagination.pageSize);
    } catch (error) {
      console.log(error);
    }
  };

  const handlePassageCreated = () => {
    setIsCreateModalOpen(false);
    loadPassages(pagination.currentPage, pagination.pageSize);
  };

  const handlePageChange = (page: number) => {
    loadPassages(page, pagination.pageSize);
  };

  const handleSort = (field: string) => {
    if (field === sortBy) {
      dispatch(setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'));
    } else {
      dispatch(setSortBy(field));
      dispatch(setSortDirection('desc'));
    }
  };

  const handleFiltersChange = (newFilters: PassageFilters) => {
    dispatch(setFilters(newFilters));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  return (
    <>
      <NavigationHandler />
      <div className='container mx-auto p-6'>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='text-3xl font-bold'>Reading Tasks</h1>
            <p className='text-muted-foreground'>
              Manage your IELTS reading passages and questions
            </p>
          </div>
          <div className='flex gap-2'>
            <Button onClick={handleCreatePassage} className='gap-2'>
              <PlusCircle className='h-4 w-4' />
              Create New Task
            </Button>
          </div>
        </div>

        <PassageFilterToolbar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />

        <PassageTable
          passages={passages}
          isLoading={isLoading.getPassagesForTeacher}
          pagination={pagination}
          onView={handleViewPassage}
          onEdit={handleEditPassage}
          onPreview={handlePreviewPassage}
          onDelete={handleDeletePassage}
          onPageChange={handlePageChange}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={handleSort}
        />

        <CreatePassageModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handlePassageCreated}
        />

        {selectedPassage && (
          <ViewPassageModal
            passage={selectedPassage}
            isOpen={isViewModalOpen}
            onClose={() => {
              setIsViewModalOpen(false);
              setSelectedPassage(null);
            }}
            onEdit={() => {
              setIsViewModalOpen(false);
              if (selectedPassage) {
                router.push(`/creator/passages/${selectedPassage.passage_id}/edit`);
              }
            }}
            onDelete={() => handleDeletePassage(selectedPassage.passage_id)}
          />
        )}
      </div>
    </>
  );
}
