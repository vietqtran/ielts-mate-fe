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
import { PassageGetResponse } from '@/types/reading.types';
import { Edit, Eye, MoreHorizontal, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/types/reading.types';
import { useState } from 'react';

interface PassageTableProps {
  passages: PassageGetResponse[];
  isLoading: boolean;
  pagination: Pagination;
  onView: (passage: PassageGetResponse) => void;
  onEdit: (passage: PassageGetResponse) => void;
  onDelete: (passage_id: string) => void;
  onPageChange: (page: number) => void;
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
  onDelete,
  onPageChange,
}: PassageTableProps) {
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

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    );
  }

  return (
    <>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>IELTS Type</TableHead>
              <TableHead>Part</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {passages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className='text-center py-8 text-muted-foreground'>
                  No passages found. Create your first passage to get started.
                </TableCell>
              </TableRow>
            ) : (
              passages.map((passage) => (
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
                  <TableCell>{new Date(passage.created_at).toLocaleDateString()}</TableCell>
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
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {passages.length > 0 && (
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
