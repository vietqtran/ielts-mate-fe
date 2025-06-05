'use client';

import { CURRENT_PAGE_SESSION_STORAGE_KEY, PAGES } from '@/constants/pages';
import { Plus, PlusCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import { CreatePassageModal } from '@/components/passages/CreatePassageModal';
import { EditPassageModal } from '@/components/passages/EditPassageModal';
import { PassageTable } from '@/components/passages/PassageTable';
import { ViewPassageModal } from '@/components/passages/ViewPassageModal';
import { Button } from '@/components/ui/button';
import { usePassage } from '@/hooks/usePassage';
import { PassageGetResponse } from '@/types/reading.types';
import { useRouter } from 'next/navigation';

export default function PassagesPage() {
  const router = useRouter();
  const { getPassagesForTeacher, deletePassage, isLoading } = usePassage();
  const [passages, setPassages] = useState<PassageGetResponse[]>([]);
  const [selectedPassage, setSelectedPassage] = useState<PassageGetResponse | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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
      const response = await getPassagesForTeacher({ page, size });
      if (response.data) {
        setPassages(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }
    } catch (error) {
      console.error('Failed to load passages:', error);
    }
  };

  useEffect(() => {
    loadPassages();
  }, []);

  const handleCreatePassage = () => {
    router.push('/passages/create');
  };

  const handleViewPassage = (passage: PassageGetResponse) => {
    setSelectedPassage(passage);
    setIsViewModalOpen(true);
  };

  const handleEditPassage = (passage: PassageGetResponse) => {
    setSelectedPassage(passage);
    setIsEditModalOpen(true);
  };

  const handleDeletePassage = async (passage_id: string) => {
    try {
      await deletePassage(passage_id);
      await loadPassages(pagination.currentPage, pagination.pageSize);
    } catch (error) {
      console.error('Failed to delete passage:', error);
    }
  };

  const handlePassageCreated = () => {
    setIsCreateModalOpen(false);
    loadPassages(pagination.currentPage, pagination.pageSize);
  };

  const handlePassageUpdated = () => {
    setIsEditModalOpen(false);
    loadPassages(pagination.currentPage, pagination.pageSize);
  };

  const handlePageChange = (page: number) => {
    loadPassages(page, pagination.pageSize);
  };

  return (
    <div className='container mx-auto py-6'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-3xl font-bold'>Reading Passages</h1>
          <p className='text-muted-foreground'>Manage your IELTS reading passages and questions</p>
        </div>
        <div className='flex gap-2'>
          <Button onClick={handleCreatePassage} className='gap-2'>
            <PlusCircle className='h-4 w-4' />
            Create New Passage
          </Button>
          <Button variant='outline' onClick={() => setIsCreateModalOpen(true)} className='gap-2'>
            <Plus className='h-4 w-4' />
            Quick Create
          </Button>
        </div>
      </div>

      <PassageTable
        passages={passages}
        isLoading={isLoading.getPassagesForTeacher}
        pagination={pagination}
        onView={handleViewPassage}
        onEdit={handleEditPassage}
        onDelete={handleDeletePassage}
        onPageChange={handlePageChange}
      />

      <CreatePassageModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handlePassageCreated}
      />

      {selectedPassage && (
        <>
          <ViewPassageModal
            passage={selectedPassage}
            isOpen={isViewModalOpen}
            onClose={() => {
              setIsViewModalOpen(false);
              setSelectedPassage(null);
            }}
            onEdit={() => {
              setIsViewModalOpen(false);
              setIsEditModalOpen(true);
            }}
            onDelete={() => handleDeletePassage(selectedPassage.passage_id)}
          />

          <EditPassageModal
            passage={selectedPassage}
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedPassage(null);
            }}
            onSuccess={handlePassageUpdated}
          />
        </>
      )}
    </div>
  );
}
