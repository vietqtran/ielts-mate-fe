'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/loading-spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import instance from '@/lib/axios';
import { Eye } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function ListeningExamsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [exams, setExams] = useState<any[]>([]);

  const fetchExams = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch active listening exams
      const { data } = await instance.get('/listening/exams/activate');

      if (data && data.data) {
        setExams(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch listening exams:', err);
      setError(err as Error);
      toast.error('Failed to fetch listening exams');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const getPartLabel = (partNumber: number): string => {
    return `Part ${partNumber + 1}`;
  };

  return (
    <div className='container mx-auto p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold'>Listening Exams</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Listening Exams</CardTitle>
          <CardDescription>
            Practice with IELTS listening exams to improve your skills
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='flex justify-center py-8'>
              <LoadingSpinner />
            </div>
          ) : (
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
                      <TableCell className='font-medium'>
                        {exam.title || 'Listening Exam'}
                      </TableCell>
                      <TableCell>
                        <div className='space-y-1'>
                          <Badge variant='outline' className='mr-1'>
                            Part 1
                          </Badge>
                          <Badge variant='outline' className='mr-1'>
                            Part 2
                          </Badge>
                          <Badge variant='outline' className='mr-1'>
                            Part 3
                          </Badge>
                          <Badge variant='outline'>Part 4</Badge>
                        </div>
                      </TableCell>
                      <TableCell>30 minutes</TableCell>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
