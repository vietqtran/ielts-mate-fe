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
import { useListeningExam } from '@/hooks/apis/admin/useListeningExam';
import { Eye, Pencil, PlusCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function ListeningExamsPage() {
  const { getAllExams, deleteExam, isLoading } = useListeningExam();
  const [exams, setExams] = useState<any[]>([]);

  const fetchExams = async () => {
    try {
      const response = await getAllExams();
      setExams(response || []);
    } catch (error) {
      console.log(error);
      toast.error('Failed to fetch listening exams');
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this listening exam?')) {
      try {
        await deleteExam(id);
        toast.success('Listening exam deleted successfully');
        fetchExams();
      } catch (error) {
        toast.error('Failed to delete listening exam');
      }
    }
  };

  return (
    <div className='container mx-auto p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold'>Listening Exams</h1>
        <Button asChild>
          <Link href='/creator/listening-exams/create'>
            <PlusCircle className='mr-2 h-4 w-4' />
            Create Exam
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Listening Exams</CardTitle>
          <CardDescription>Manage IELTS listening exams for student practice</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading['getAllExams'] ? (
            <div className='flex justify-center py-8'>
              <LoadingSpinner />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam Name</TableHead>
                  <TableHead>URL Slug</TableHead>
                  <TableHead>Listening Parts</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className='text-center py-6'>
                      No listening exams found. Create your first one.
                    </TableCell>
                  </TableRow>
                ) : (
                  exams.map((exam) => (
                    <TableRow key={exam.listening_exam_id}>
                      <TableCell className='font-medium'>{exam.exam_name}</TableCell>
                      <TableCell>{exam.url_slug}</TableCell>
                      <TableCell>
                        <div>
                          {['part1', 'part2', 'part3', 'part4'].map((part, idx) =>
                            exam[part] && exam[part].title ? (
                              <div key={part}>
                                <Badge variant='outline'>
                                  Part {idx + 1}: {exam[part].title}
                                </Badge>
                              </div>
                            ) : null
                          )}
                        </div>
                      </TableCell>
                      <TableCell className='text-right'>
                        <div className='flex justify-end gap-2'>
                          <Button variant='outline' size='icon' asChild>
                            <Link
                              href={`/creator/listening-exams/${exam.listening_exam_id}/preview`}
                            >
                              <Eye className='h-4 w-4' />
                            </Link>
                          </Button>
                          <Button variant='outline' size='icon' asChild>
                            <Link href={`/creator/listening-exams/${exam.listening_exam_id}/edit`}>
                              <Pencil className='h-4 w-4' />
                            </Link>
                          </Button>
                          <Button
                            variant='outline'
                            size='icon'
                            onClick={() => handleDelete(exam.listening_exam_id)}
                          >
                            <Trash2 className='h-4 w-4' />
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
