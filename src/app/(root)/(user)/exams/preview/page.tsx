'use client';

import ExamPreview from '@/components/features/user/exams/ExamPreview';
import { Button } from '@/components/ui/button';
import useReadingExamAttempt from '@/hooks/apis/reading/useReadingExamAttempt';
import { ReadingExamResponse } from '@/types/reading/reading-exam.types';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const ExamPreviewPage = () => {
  const searchParams = useSearchParams();
  const examUrl = searchParams.get('examUrl');
  const router = useRouter();

  const [examData, setExamData] = useState<ReadingExamResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { getAllAvailableExams } = useReadingExamAttempt();

  const fetchExamData = async () => {
    if (!examUrl) return;

    try {
      setIsLoading(true);
      const response = await getAllAvailableExams();
      if (response && response.data) {
        // Find the exam with matching url_slug
        const exam = response.data.find(
          (exam: ReadingExamResponse['data']) => exam.url_slug === examUrl
        );

        if (exam) {
          setExamData(exam);
        } else {
          console.error('Exam not found');
        }
      }
    } catch (error) {
      console.error('Error fetching exam data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartExam = () => {
    if (examUrl) {
      router.push(`/exams/take?examUrl=${examUrl}&examType=reading`);
    }
  };

  const handleBack = () => {
    router.push('/exams/reading');
  };

  useEffect(() => {
    if (examUrl) {
      fetchExamData();
    } else {
      router.push('/exams/reading');
    }
  }, [examUrl]);

  if (isLoading) {
    return (
      <div className='h-screen flex items-center justify-center bg-medium-slate-blue-900'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-tekhelet-600 mx-auto'></div>
          <p className='mt-4 text-white font-medium'>Loading exam details...</p>
        </div>
      </div>
    );
  }

  if (!examData) {
    return (
      <div className='h-screen flex items-center justify-center bg-medium-slate-blue-900'>
        <div className='text-center p-6 bg-white rounded-lg shadow-lg border border-persimmon-300 max-w-md'>
          <p className='text-persimmon-600 text-lg font-medium mb-4'>
            Exam not found or failed to load.
          </p>
          <div className='space-x-2'>
            <Button
              onClick={handleBack}
              variant='outline'
              className='border-tekhelet-300 text-tekhelet-600 hover:bg-tekhelet-50'
            >
              Back to Exams
            </Button>
            <Button
              onClick={() => window.location.reload()}
              className='bg-tekhelet-600 hover:bg-tekhelet-700'
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <ExamPreview examData={examData} onStartExam={handleStartExam} onBack={handleBack} />;
};

export default ExamPreviewPage;
