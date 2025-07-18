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
import { Eye } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function ReadingExamsPage() {
  const { getAllExams, isLoading, error } = useReadingExam();
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

  return (
    <div className='container mx-auto p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold'>Reading Exams</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Reading Exams</CardTitle>
          <CardDescription>
            Practice with IELTS reading exams to improve your skills
          </CardDescription>
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
                      No reading exams found at the moment.
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
