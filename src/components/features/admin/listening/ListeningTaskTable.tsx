'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useListeningTask } from '@/hooks';
import { formatDate } from '@/lib/utils';
import {
  ListeningTaskFilterParams,
  ListeningTaskResponse,
  ListeningTaskStatus,
} from '@/types/listening/listening.types';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  MoreHorizontal,
  Pencil,
  Play,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ListeningTaskTableProps {
  data: ListeningTaskResponse[];
  isLoading: boolean;
  pagination: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  onPageChange: (page: number) => void;
  onSortChange?: (sortParams: Partial<ListeningTaskFilterParams>) => void;
  currentSort?: {
    sort_by?: string;
    sort_direction?: string;
  };
}

export function ListeningTaskTable({
  data,
  isLoading,
  pagination,
  onPageChange,
  onSortChange,
  currentSort = { sort_by: 'updatedAt', sort_direction: 'desc' },
}: Readonly<ListeningTaskTableProps>) {
  const router = useRouter();
  const { deleteListeningTask } = useListeningTask();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const handleEdit = (taskId: string) => {
    router.push(`/creator/listenings/${taskId}/edit`);
  };

  const handlePreview = (taskId: string) => {
    router.push(`/creator/listenings/${taskId}/preview`);
  };

  const handleDeleteClick = (taskId: string) => {
    setTaskToDelete(taskId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;

    try {
      await deleteListeningTask(taskToDelete);
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
      // Refresh data
      window.location.reload();
    } catch (error) {
      console.error('Failed to delete listening task:', error);
    }
  };

  const handleSort = (column: string) => {
    if (!onSortChange) return;

    const fieldMapping: Record<string, string> = {
      title: 'title',
      type: 'ieltsType',
      part: 'partNumber',
      status: 'status',
      created_by: 'createdBy',
      created_at: 'createdAt',
      updated_at: 'updatedAt',
    };

    const field = fieldMapping[column];
    if (!field) return;

    let direction = 'asc';
    if (currentSort.sort_by === field) {
      direction = currentSort.sort_direction === 'asc' ? 'desc' : 'asc';
    }

    onSortChange({
      sort_by: field,
      sort_direction: direction,
    });
  };

  const getSortIcon = (column: string) => {
    const fieldMapping: Record<string, string> = {
      title: 'title',
      type: 'ieltsType',
      part: 'partNumber',
      status: 'status',
      created_by: 'createdBy',
      created_at: 'createdAt',
      updated_at: 'updatedAt',
    };

    const field = fieldMapping[column];
    if (!field) return <ArrowUpDown className='ml-2 h-4 w-4' />;

    if (currentSort.sort_by === field) {
      return currentSort.sort_direction === 'asc' ? (
        <ArrowUp className='ml-2 h-4 w-4' />
      ) : (
        <ArrowDown className='ml-2 h-4 w-4' />
      );
    }

    return <ArrowUpDown className='ml-2 h-4 w-4' />;
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case ListeningTaskStatus.DRAFT:
        return (
          <span className='px-2 py-1 rounded-full bg-gray-200 text-gray-700 text-xs'>Draft</span>
        );
      case ListeningTaskStatus.PUBLISHED:
        return (
          <span className='px-2 py-1 rounded-full bg-green-200 text-green-700 text-xs'>
            Published
          </span>
        );
      case ListeningTaskStatus.DEACTIVATED:
        return (
          <span className='px-2 py-1 rounded-full bg-red-200 text-red-700 text-xs'>
            Deactivated
          </span>
        );
      case ListeningTaskStatus.TEST:
        return (
          <span className='px-2 py-1 rounded-full bg-blue-200 text-blue-700 text-xs'>Test</span>
        );
      default:
        return (
          <span className='px-2 py-1 rounded-full bg-gray-200 text-gray-700 text-xs'>Unknown</span>
        );
    }
  };

  return (
    <div className='space-y-4'>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className='cursor-pointer hover:bg-gray-50'
                onClick={() => handleSort('title')}
              >
                <div className='flex items-center'>
                  Title
                  {getSortIcon('title')}
                </div>
              </TableHead>
              <TableHead
                className='cursor-pointer hover:bg-gray-50'
                onClick={() => handleSort('type')}
              >
                <div className='flex items-center'>
                  Type
                  {getSortIcon('type')}
                </div>
              </TableHead>
              <TableHead
                className='cursor-pointer hover:bg-gray-50'
                onClick={() => handleSort('part')}
              >
                <div className='flex items-center'>
                  Part
                  {getSortIcon('part')}
                </div>
              </TableHead>
              <TableHead
                className='cursor-pointer hover:bg-gray-50'
                onClick={() => handleSort('status')}
              >
                <div className='flex items-center'>
                  Status
                  {getSortIcon('status')}
                </div>
              </TableHead>
              <TableHead
                className='cursor-pointer hover:bg-gray-50'
                onClick={() => handleSort('created_by')}
              >
                <div className='flex items-center'>
                  Created By
                  {getSortIcon('created_by')}
                </div>
              </TableHead>
              <TableHead
                className='cursor-pointer hover:bg-gray-50'
                onClick={() => handleSort('created_at')}
              >
                <div className='flex items-center'>
                  Created At
                  {getSortIcon('created_at')}
                </div>
              </TableHead>
              <TableHead
                className='cursor-pointer hover:bg-gray-50'
                onClick={() => handleSort('updated_at')}
              >
                <div className='flex items-center'>
                  Updated At
                  {getSortIcon('updated_at')}
                </div>
              </TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className='text-center py-10'>
                  Loading...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className='text-center py-10'>
                  No listening tasks found
                </TableCell>
              </TableRow>
            ) : (
              data.map((task) => (
                <TableRow key={task.task_id}>
                  <TableCell className='font-medium'>{task.title}</TableCell>
                  <TableCell>{task.ielts_type === 1 ? 'Academic' : 'General Training'}</TableCell>
                  <TableCell>{task.part_number + 1}</TableCell>
                  <TableCell>{getStatusBadge(task.status)}</TableCell>
                  <TableCell>
                    {task.created_by.first_name} {task.created_by.last_name}
                  </TableCell>
                  <TableCell>{formatDate(task.created_at)}</TableCell>
                  <TableCell>{formatDate(task.updated_at)}</TableCell>
                  <TableCell className='text-right'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' className='h-8 w-8 p-0'>
                          <span className='sr-only'>Open menu</span>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem onClick={() => handlePreview(task.task_id)}>
                          <Play className='mr-2 h-4 w-4' />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(task.task_id)}>
                          <Pencil className='mr-2 h-4 w-4' />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(task.task_id)}
                          className='text-red-600'
                        >
                          <Trash2 className='mr-2 h-4 w-4' />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className='flex justify-center mt-4'>
          <div className='flex items-center space-x-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPreviousPage}
            >
              Previous
            </Button>
            <div className='flex items-center space-x-1'>
              {Array.from({ length: pagination.totalPages }, (_, i) => i).map((page) => (
                <Button
                  key={page}
                  variant={page === pagination.currentPage - 1 ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => onPageChange(page + 1)}
                  className='w-8 h-8'
                >
                  {page + 1}
                </Button>
              ))}
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this listening task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant='destructive' onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
