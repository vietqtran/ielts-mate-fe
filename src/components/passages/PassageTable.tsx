'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import { Pagination, PassageGetResponse } from '@/types/reading.types';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  Edit,
  Eye,
  Monitor,
  MoreHorizontal,
  Trash2,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import LoadingSpinner from '../ui/loading-spinner';

interface PassageTableProps {
  passages: PassageGetResponse[];
  isLoading: boolean;
  pagination: Pagination;
  onView: (passage: PassageGetResponse) => void;
  onEdit: (passage: PassageGetResponse) => void;
  onPreview: (passage: PassageGetResponse) => void;
  onDelete: (passage_id: string) => void;
  onPageChange: (page: number) => void;
  sortBy?: string;
  sortDirection?: string;
  onSort?: (field: string) => void;
}

const getielts_typeLabel = (type: number): string => {
  switch (type) {
    case 0:
      return 'Academic';
    case 1:
      return 'General Training';
    default:
      return 'Unknown';
  }
};

const getStatusLabel = (status: number): string => {
  switch (status) {
    case 0:
      return 'Draft';
    case 1:
      return 'Published';
    case 2:
      return 'Deactivated';
    case 3:
      return 'Finished';
    case 4:
      return 'Test';
    default:
      return 'Unknown';
  }
};

const getStatusColor = (status: number): string => {
  switch (status) {
    case 0:
      return 'bg-gray-100 text-gray-800';
    case 1:
      return 'bg-green-100 text-green-800';
    case 2:
      return 'bg-red-100 text-red-800';
    case 3:
      return 'bg-blue-100 text-blue-800';
    case 4:
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export function PassageTable({
  passages,
  isLoading,
  pagination,
  onView,
  onEdit,
  onPreview,
  onDelete,
  onPageChange,
  sortBy = 'updatedAt',
  sortDirection = 'desc',
  onSort,
}: Readonly<PassageTableProps>) {
  const [deletepassage_id, setDeletepassage_id] = useState<string | null>(null);

  const handleDeleteClick = (passage_id: string) => {
    setDeletepassage_id(passage_id);
  };

  const handleDeleteConfirm = () => {
    if (deletepassage_id) {
      onDelete(deletepassage_id);
      setDeletepassage_id(null);
    }
  };

  const renderTableBody = () => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={8} className='text-center py-8'>
            <div className='flex items-center justify-center'>
              <LoadingSpinner color='#737373' />
              <span className='ml-2 text-muted-foreground'>Loading...</span>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (passages.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={8} className='text-center py-8 text-muted-foreground'>
            No passages found. Create your first passage to get started.
          </TableCell>
        </TableRow>
      );
    }

    return passages.map((passage) => (
      <TableRow key={passage.passage_id}>
        <TableCell className='font-medium'>{passage.title}</TableCell>
        <TableCell>
          <Badge variant='outline'>{getielts_typeLabel(passage.ielts_type)}</Badge>
        </TableCell>
        <TableCell>Part {passage.part_number}</TableCell>
        <TableCell>
          <Badge className={getStatusColor(passage.passage_status)}>
            {getStatusLabel(passage.passage_status)}
          </Badge>
        </TableCell>
        <TableCell>
          {passage.created_by?.first_name} {passage.created_by?.last_name}
        </TableCell>
        <TableCell>{new Date(passage.created_at).toLocaleString()}</TableCell>
        <TableCell>{new Date(passage.updated_at).toLocaleString()}</TableCell>
        <TableCell className='text-right'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='sm'>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => onView(passage)}>
                <Eye className='h-4 w-4 mr-2' />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPreview(passage)}>
                <Monitor className='h-4 w-4 mr-2' />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(passage)}>
                <Edit className='h-4 w-4 mr-2' />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteClick(passage.passage_id)}
                className='text-red-600'
              >
                <Trash2 className='h-4 w-4 mr-2' />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className='cursor-pointer hover:bg-accent hover:text-accent-foreground'
                onClick={() => onSort?.('title')}
              >
                Title
                {sortBy === 'title' &&
                  (sortDirection === 'asc' ? (
                    <ArrowUpIcon className='inline ml-2 h-4 w-4' />
                  ) : (
                    <ArrowDownIcon className='inline ml-2 h-4 w-4' />
                  ))}
              </TableHead>
              <TableHead
                className='cursor-pointer hover:bg-accent hover:text-accent-foreground'
                onClick={() => onSort?.('ieltsType')}
              >
                IELTS Type
                {sortBy === 'ieltsType' &&
                  (sortDirection === 'asc' ? (
                    <ArrowUpIcon className='inline ml-2 h-4 w-4' />
                  ) : (
                    <ArrowDownIcon className='inline ml-2 h-4 w-4' />
                  ))}
              </TableHead>
              <TableHead
                className='cursor-pointer hover:bg-accent hover:text-accent-foreground'
                onClick={() => onSort?.('partNumber')}
              >
                Part
                {sortBy === 'partNumber' &&
                  (sortDirection === 'asc' ? (
                    <ArrowUpIcon className='inline ml-2 h-4 w-4' />
                  ) : (
                    <ArrowDownIcon className='inline ml-2 h-4 w-4' />
                  ))}
              </TableHead>
              <TableHead
                className='cursor-pointer hover:bg-accent hover:text-accent-foreground'
                onClick={() => onSort?.('passage_status')}
              >
                Status
                {sortBy === 'passage_status' &&
                  (sortDirection === 'asc' ? (
                    <ArrowUpIcon className='inline ml-2 h-4 w-4' />
                  ) : (
                    <ArrowDownIcon className='inline ml-2 h-4 w-4' />
                  ))}
              </TableHead>
              <TableHead
                className='cursor-pointer hover:bg-accent hover:text-accent-foreground'
                onClick={() => onSort?.('createdBy')}
              >
                Created By
                {sortBy === 'createdBy' &&
                  (sortDirection === 'asc' ? (
                    <ArrowUpIcon className='inline ml-2 h-4 w-4' />
                  ) : (
                    <ArrowDownIcon className='inline ml-2 h-4 w-4' />
                  ))}
              </TableHead>
              <TableHead
                className='cursor-pointer hover:bg-accent hover:text-accent-foreground'
                onClick={() => onSort?.('createdAt')}
              >
                Created At
                {sortBy === 'createdAt' &&
                  (sortDirection === 'asc' ? (
                    <ArrowUpIcon className='inline ml-2 h-4 w-4' />
                  ) : (
                    <ArrowDownIcon className='inline ml-2 h-4 w-4' />
                  ))}
              </TableHead>
              <TableHead
                className='cursor-pointer hover:bg-accent hover:text-accent-foreground'
                onClick={() => onSort?.('updatedAt')}
              >
                Updated At
                {sortBy === 'updatedAt' &&
                  (sortDirection === 'asc' ? (
                    <ArrowUpIcon className='inline ml-2 h-4 w-4' />
                  ) : (
                    <ArrowDownIcon className='inline ml-2 h-4 w-4' />
                  ))}
              </TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{renderTableBody()}</TableBody>
        </Table>
      </div>

      {!isLoading && passages.length > 0 && (
        <div className='flex items-center justify-between mt-4'>
          <div className='text-sm text-muted-foreground'>
            Showing {(pagination.currentPage - 1) * pagination.pageSize + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of{' '}
            {pagination.totalItems} entries
          </div>
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
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === pagination.currentPage ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => onPageChange(page)}
                >
                  {page}
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

      <AlertDialog open={!!deletepassage_id} onOpenChange={() => setDeletepassage_id(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the passage and all its
              questions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className='bg-red-600 hover:bg-red-700'
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
