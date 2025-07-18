'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useReadingExam } from '@/hooks/apis/admin/useReadingExam';
import { ReadingExamResponse } from '@/types/reading-exam.types';
import { ArrowLeft, BookOpen, Timer } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function ReadingExamDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { getExamById, isLoading, error } = useReadingExam();
  const [exam, setExam] = useState<ReadingExamResponse['data'] | null>(null);

  const examId = params.id as string;

  const fetchExam = async () => {
    try {
      const response = await getExamById(examId);
      if (response?.data) {
        setExam(response.data);
      }
    } catch (error) {
      toast.error('Failed to fetch reading exam details');
    }
  };

  useEffect(() => {
    if (examId) {
      fetchExam();
    }
  }, [examId]);

  const handleStartExam = () => {
    // In a real implementation, this would navigate to the exam attempt page
    // router.push(`/reading-exams/${examId}/attempt`);
    toast.info('Starting exam...');
  };

  if (isLoading['getExamById']) {
    return (
      <div className='container mx-auto p-6 flex justify-center items-center min-h-[60vh]'>
        <LoadingSpinner />
      </div>
    );
  }

  if (error['getExamById']) {
    return (
      <div className='container mx-auto p-6'>
        <Card className='border-red-200'>
          <CardContent className='pt-6'>
            <div className='text-center text-red-600'>
              <p className='text-lg font-semibold'>Error loading exam details</p>
              <p className='text-sm mt-1'>{error['getExamById'].message}</p>
              <Button variant='outline' className='mt-4' onClick={() => router.back()}>
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className='container mx-auto p-6'>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center py-12'>
              <BookOpen className='h-12 w-12 mx-auto text-gray-400 mb-4' />
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>Exam not found</h3>
              <p className='text-gray-600 mb-4'>
                The reading exam you're looking for could not be found.
              </p>
              <Button variant='outline' onClick={() => router.back()}>
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6'>
      <Button variant='ghost' className='mb-6' onClick={() => router.back()}>
        <ArrowLeft className='mr-2 h-4 w-4' />
        Back to Exams
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className='text-2xl'>{exam.reading_exam_name}</CardTitle>
          <CardDescription>IELTS Reading Exam</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            <div>
              <h3 className='text-lg font-semibold mb-2'>Exam Overview</h3>
              <p className='text-gray-600'>
                This reading exam consists of 3 passages with various question types. You will have
                60 minutes to complete the entire exam.
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-md'>Passage 1</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='font-medium'>
                    {exam.reading_passage_id_part1.reading_passage_name}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-md'>Passage 2</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='font-medium'>
                    {exam.reading_passage_id_part2.reading_passage_name}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-md'>Passage 3</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='font-medium'>
                    {exam.reading_passage_id_part3.reading_passage_name}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className='flex flex-col space-y-2'>
              <div className='flex items-center text-orange-600'>
                <Timer className='h-5 w-5 mr-2' />
                <span className='font-medium'>Time Limit: 60 minutes</span>
              </div>
              <div className='flex items-center'>
                <BookOpen className='h-5 w-5 mr-2' />
                <span>3 Passages with Multiple Question Types</span>
              </div>
            </div>

            <div className='pt-4'>
              <Button size='lg' className='w-full md:w-auto' onClick={handleStartExam}>
                <BookOpen className='mr-2 h-5 w-5' />
                Start Exam
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
