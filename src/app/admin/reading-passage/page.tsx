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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getIeltsTypeLabel, getPassageStatusLabel } from '@/utils/reading-passage';
import { Edit, Eye, Loader2, MoreVertical, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { readingPassageAPI } from '@/lib/api/reading-passages';
import { ReadingPassage } from '@/types';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ReadingPassagesPage() {
  const [passages, setPassages] = useState<ReadingPassage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [passageToDelete, setPassageToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);

  const getStatusBadgeClass = (status: number): string => {
    if (status === 2) return 'bg-blue-100 text-blue-800';
    if (status === 3) return 'bg-gray-100 text-gray-800';
    return 'bg-yellow-100 text-yellow-800';
  };
  useEffect(() => {
    fetchPassages();
  }, [currentPage, pageSize]);

  const fetchPassages = async () => {
    try {
      setLoading(true);
      const response = await readingPassageAPI.getPassages({
        page: currentPage,
        size: pageSize,
      });

      setPassages(response.data);

      if (response.pagination) {
        setTotalPages(response.pagination.total_pages);
      }
    } catch (error) {
      console.error('Failed to fetch reading passages:', error);
      toast.error('Failed to fetch reading passages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setPassageToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (passageToDelete) {
      try {
        setLoading(true);
        await readingPassageAPI.deletePassage(passageToDelete);
        toast.success('Reading passage deleted successfully.');
        fetchPassages(); // Refresh the list
      } catch (error) {
        console.error('Failed to delete passage:', error);
        toast.error('Failed to delete reading passage. Please try again.');
      } finally {
        setLoading(false);
        setPassageToDelete(null);
        setDeleteDialogOpen(false);
      }
    }
  };

  const filteredPassages = passages.filter(
    (passage) =>
      passage.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getIeltsTypeLabel(passage.ietls_type).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto px-4 py-8'>
        {' '}
        {/* Header */}
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>Reading Passages</h1>
            <p className='text-gray-600'>Manage your IELTS reading materials</p>
          </div>
          <Link href='/admin/reading-passage/create'>
            <Button>
              <Plus className='h-4 w-4 mr-2' />
              Add New Passage
            </Button>
          </Link>
        </div>
        {/* Search and Filters */}
        <div className='mb-6'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
            <Input
              placeholder='Search passages by title or type...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-10'
            />
          </div>
        </div>
        {/* Loading State */}
        {loading && (
          <div className='flex justify-center items-center py-12'>
            <Loader2 className='h-8 w-8 animate-spin text-blue-500' />
          </div>
        )}
        {/* Passages Grid */}
        {!loading && (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredPassages.map((passage) => (
              <Card key={passage.passage_id} className='hover:shadow-lg transition-shadow'>
                <CardHeader className='pb-3'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <CardTitle className='text-lg mb-2 line-clamp-2'>
                        {passage.title ?? 'Untitled Passage'}
                      </CardTitle>
                      <CardDescription className='text-sm'>
                        Type: {getIeltsTypeLabel(passage.ietls_type)}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='sm'>
                          <MoreVertical className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>{' '}
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/reading-passage/${passage.passage_id}`}>
                            <Eye className='h-4 w-4 mr-2' />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/reading-passage/${passage.passage_id}/edit`}>
                            <Edit className='h-4 w-4 mr-2' />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(passage.passage_id)}
                          className='text-red-600'
                        >
                          <Trash2 className='h-4 w-4 mr-2' />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>{' '}
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    {' '}
                    <div className='flex gap-2'>
                      <Badge variant='outline'>Part {passage.part_number}</Badge>
                      <Badge className={getStatusBadgeClass(passage.passage_status)}>
                        {getPassageStatusLabel(passage.passage_status)}
                      </Badge>
                    </div>
                    <div className='grid grid-cols-2 gap-4 text-sm text-gray-600'>
                      <div>
                        <span className='font-medium'>Created:</span>{' '}
                        {new Date(passage.created_at).toLocaleDateString()}
                      </div>
                      <div>
                        <span className='font-medium'>By:</span> {passage.created_by.first_name}{' '}
                        {passage.created_by.last_name}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}{' '}
        {!loading && filteredPassages.length === 0 && (
          <div className='text-center py-12'>
            <div className='text-gray-500 mb-4'>No passages found</div>
            <Link href='/admin/reading-passage/create'>
              <Button>
                <Plus className='h-4 w-4 mr-2' />
                Create Your First Passage
              </Button>
            </Link>
          </div>
        )}
        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className='flex justify-center mt-8'>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className='text-sm'>
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the reading passage and
                all associated questions.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className='bg-red-600 hover:bg-red-700'>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
