'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/loading-spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useListeningExam } from '@/hooks/apis/listening/useListeningExam';
import { Eye } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface ListeningExamsTableProps {
  className?: string;
}

export default function ListeningExamsTable({ className }: ListeningExamsTableProps) {
  const { fetchExams, isLoading, error, exams } = useListeningExam();

  useEffect(() => {
    const loadExams = async () => {
      try {
        await fetchExams();
      } catch (error) {
        toast.error('Failed to fetch listening exams');
      }
    };

    loadExams();
  }, [fetchExams]);

  if (isLoading) {
    return (
      <div className='flex justify-center py-8'>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={className}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Exam Name</TableHead>
            <TableHead>Listening Tasks</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exams.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className='text-center py-6'>
                No listening exams found at the moment.
              </TableCell>
            </TableRow>
          ) : (
            exams.map((exam) => (
              <TableRow key={exam.id}>
                <TableCell className='font-medium'>{exam.title || 'Listening Exam'}</TableCell>
                <TableCell>
                  <div className='flex flex-wrap gap-1'>
                    <Badge variant='outline' className='text-xs'>
                      Part 1
                    </Badge>
                    <Badge variant='outline' className='text-xs'>
                      Part 2
                    </Badge>
                    <Badge variant='outline' className='text-xs'>
                      Part 3
                    </Badge>
                    <Badge variant='outline' className='text-xs'>
                      Part 4
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant='secondary'>30 minutes</Badge>
                </TableCell>
                <TableCell className='text-right'>
                  <div className='flex justify-end gap-2'>
                    <Button variant='outline' size='icon' asChild>
                      <Link href={`/listening-exams/${exam.id}`}>
                        <Eye className='h-4 w-4' />
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
