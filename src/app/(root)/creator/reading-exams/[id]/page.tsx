'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Separator } from '@/components/ui/separator';
import { useReadingExam } from '@/hooks/useReadingExam';
import { ReadingExamResponse } from '@/types/reading-exam';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function ReadingExamDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;

  const { getExamById, deleteExam, isLoading } = useReadingExam();
  const [exam, setExam] = useState<ReadingExamResponse['data'] | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await getExamById(examId);
        if (response && response.data) {
          setExam(response.data);
        }
      } catch (error) {
        toast.error('Failed to fetch reading exam details');
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchExam();
  }, [examId]);

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this reading exam?')) {
      try {
        await deleteExam(examId);
        toast.success('Reading exam deleted successfully');
        router.push('/creator/reading-exams');
      } catch (error) {
        toast.error('Failed to delete reading exam');
      }
    }
  };

  if (isPageLoading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <LoadingSpinner color='black' />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className='container mx-auto p-6'>
        <div className='mb-6'>
          <Button variant='ghost' asChild className='mb-6'>
            <Link href='/creator/reading-exams'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Reading Exams
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className='py-10'>
            <div className='text-center'>
              <h2 className='text-xl font-semibold'>Reading Exam Not Found</h2>
              <p className='text-muted-foreground mt-2'>
                The requested reading exam could not be found.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6'>
      <div className='mb-6'>
        <Button variant='ghost' asChild className='mb-6'>
          <Link href='/creator/reading-exams'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back to Reading Exams
          </Link>
        </Button>
        <div className='flex justify-between items-center'>
          <h1 className='text-3xl font-bold'>{exam.reading_exam_name}</h1>
          <div className='flex space-x-2'>
            <Button variant='outline' asChild>
              <Link href={`/reading-exams/${examId}/edit`}>
                <Pencil className='mr-2 h-4 w-4' />
                Edit
              </Link>
            </Button>
            <Button variant='destructive' onClick={handleDelete} disabled={isLoading['deleteExam']}>
              {isLoading['deleteExam'] ? (
                <>
                  <LoadingSpinner color='white' />
                  <span className='ml-2'>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className='mr-2 h-4 w-4' />
                  Delete
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Reading Exam Details</CardTitle>
            <CardDescription>Information about the selected reading exam</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div>
                <h3 className='font-medium text-sm text-muted-foreground'>Exam Name</h3>
                <p className='mt-1'>{exam.reading_exam_name}</p>
              </div>

              <div>
                <h3 className='font-medium text-sm text-muted-foreground'>Description</h3>
                <p className='mt-1'>{exam.reading_exam_description}</p>
              </div>

              <div>
                <h3 className='font-medium text-sm text-muted-foreground'>URL Slug</h3>
                <p className='mt-1'>{exam.url_slug}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reading Passages</CardTitle>
            <CardDescription>The reading passages included in this exam</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-6'>
              <div className='border rounded-lg p-4'>
                <h3 className='font-semibold text-lg'>
                  Part 1: {exam.reading_passage_id_part1.reading_passage_name}
                </h3>
                <Separator className='my-2' />
                <div className='mt-2 prose prose-sm max-w-none'>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: exam.reading_passage_id_part1.reading_passage_content,
                    }}
                  />
                </div>
              </div>

              <div className='border rounded-lg p-4'>
                <h3 className='font-semibold text-lg'>
                  Part 2: {exam.reading_passage_id_part2.reading_passage_name}
                </h3>
                <Separator className='my-2' />
                <div className='mt-2 prose prose-sm max-w-none'>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: exam.reading_passage_id_part2.reading_passage_content,
                    }}
                  />
                </div>
              </div>

              <div className='border rounded-lg p-4'>
                <h3 className='font-semibold text-lg'>
                  Part 3: {exam.reading_passage_id_part3.reading_passage_name}
                </h3>
                <Separator className='my-2' />
                <div className='mt-2 prose prose-sm max-w-none'>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: exam.reading_passage_id_part3.reading_passage_content,
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
