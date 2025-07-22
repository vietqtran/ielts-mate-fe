'use client';

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
import { useReadingExam } from '@/hooks/apis/admin/useReadingExam';
import { ReadingExamResponse } from '@/types/reading-exam.types';
import { Eye, Pencil, PlusCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function ReadingExamsPage() {
  const { getAllExams, deleteExam, isLoading, error } = useReadingExam();
  const [exams, setExams] = useState<ReadingExamResponse['data'][]>([]);

  const fetchExams = async () => {
    try {
      const response = await getAllExams();
      if (response) {
        setExams(response.data);
      }
    } catch (error) {
      toast.error('Failed to fetch reading exams');
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this reading exam?')) {
      try {
        await deleteExam(id);
        toast.success('Reading exam deleted successfully');
        fetchExams();
      } catch (error) {
        toast.error('Failed to delete reading exam');
      }
    }
  };

  return (
    <div className='container mx-auto p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold'>Reading Exams</h1>
        <Button asChild>
          <Link href='/creator/reading-exams/create'>
            <PlusCircle className='mr-2 h-4 w-4' />
            Create Exam
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Reading Exams</CardTitle>
          <CardDescription>Manage IELTS reading exams for student practice</CardDescription>
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
                  <TableHead>Reading Passages</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className='text-center py-6'>
                      No reading exams found. Create your first one.
                    </TableCell>
                  </TableRow>
                ) : (
                  exams.map((exam) => (
                    <TableRow key={exam.reading_exam_id}>
                      <TableCell className='font-medium'>{exam.reading_exam_name}</TableCell>
                      <TableCell>{exam.url_slug}</TableCell>
                      <TableCell>
                        <div>Part 1: {exam.reading_passage_id_part1.reading_passage_name}</div>
                        <div>Part 2: {exam.reading_passage_id_part2.reading_passage_name}</div>
                        <div>Part 3: {exam.reading_passage_id_part3.reading_passage_name}</div>
                      </TableCell>
                      <TableCell className='text-right'>
                        <div className='flex justify-end gap-2'>
                          <Button variant='outline' size='icon' asChild>
                            <Link href={`/reading-exams/${exam.reading_exam_id}`}>
                              <Eye className='h-4 w-4' />
                            </Link>
                          </Button>
                          <Button variant='outline' size='icon' asChild>
                            <Link href={`/reading-exams/${exam.reading_exam_id}/edit`}>
                              <Pencil className='h-4 w-4' />
                            </Link>
                          </Button>
                          <Button
                            variant='outline'
                            size='icon'
                            onClick={() => handleDelete(exam.reading_exam_id)}
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
