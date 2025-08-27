'use client';

import ListeningExamPreview from '@/components/features/user/exams/listening/take/ListeningExamPreview';
import ReadingExamPreview from '@/components/features/user/exams/reading/ReadingExamPreview';
import { Button } from '@/components/ui/button';
import { useListeningExam } from '@/hooks/apis/listening/useListeningExam';
import useReadingExamAttempt from '@/hooks/apis/reading/useReadingExamAttempt';
import { ListActiveListeningExamsResponse } from '@/types/listening/listening-exam.types';
import { ReadingExamResponse } from '@/types/reading/reading-exam.types';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const ExamPreviewPage = ({
  examUrl,
  examType,
}: {
  examUrl: string;
  examType: string;
}) => {
  const router = useRouter();

  const [readingExamData, setReadingExamData] = useState<ReadingExamResponse['data'] | null>(null);
  const [listeningExamData, setListeningExamData] =
    useState<ListActiveListeningExamsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [listeningExams, setListeningExams] = useState<ListActiveListeningExamsResponse[]>([]);

  const { getAllAvailableExams } = useReadingExamAttempt();
  const { fetchListeningExamsList } = useListeningExam();

  const fetchExamData = async () => {
    if (!examUrl || !examType) return;

    try {
      setIsLoading(true);

      if (examType === 'reading') {
        const response = await getAllAvailableExams({
          page: 1,
          size: 1000,
        });
        if (response && response.data) {
          // Find the exam with matching url_slug
          const exam = response.data.find(
            (exam: ReadingExamResponse['data']) =>
              exam.url_slug.toLocaleLowerCase() === examUrl.toLocaleLowerCase()
          );

          if (exam) {
            setReadingExamData(exam);
          } else {
            console.error('Reading exam not found');
          }
        }
      } else if (examType === 'listening') {
        const res = await fetchListeningExamsList({
          page: 1,
          size: 1000,
        });

        setListeningExams(res?.data || []);
        // Find the listening exam with matching url_slug
        const exam = res?.data.find(
          (exam: ListActiveListeningExamsResponse) => exam.url_slug === examUrl
        );

        if (exam) {
          setListeningExamData(exam);
        } else {
          console.error('Listening exam not found');
        }
      }
    } catch (error) {
      console.error('Error fetching exam data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartExam = () => {
    if (examUrl && examType) {
      router.push(`/exams/take?examUrl=${examUrl}&examType=${examType}`);
    }
  };

  const handleBack = () => {
    if (examType === 'reading') {
      router.push('/exams/reading');
    } else if (examType === 'listening') {
      router.push('/exams/listening');
    } else {
      router.push('/exams');
    }
  };

  useEffect(() => {
    if (examUrl && examType) {
      fetchExamData();
    } else {
      // Redirect based on examType or to general exams page
      if (examType === 'reading') {
        router.push('/exams/reading');
      } else if (examType === 'listening') {
        router.push('/exams/listening');
      } else {
        router.push('/exams');
      }
    }
  }, [examUrl, examType]);

  // Additional useEffect to handle listening exams data when it's available
  useEffect(() => {
    if (examType === 'listening' && listeningExams && listeningExams.length > 0 && examUrl) {
      const exam = listeningExams.find(
        (exam: ListActiveListeningExamsResponse) => exam.url_slug === examUrl
      );
      if (exam) {
        setListeningExamData(exam);
        setIsLoading(false);
      }
    }
  }, [listeningExams, examUrl, examType]);

  if (isLoading) {
    return (
      <div className='h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-tekhelet-600 mx-auto'></div>
          <p className='mt-4 font-medium'>Loading exam details...</p>
        </div>
      </div>
    );
  }

  if (!readingExamData && !listeningExamData && !isLoading) {
    return (
      <div className='h-screen flex items-center justify-center'>
        <div className='text-center p-6 border rounded-2xl shadow-sm max-w-md'>
          <p className='text-persimmon-400 text-lg font-medium mb-4'>
            Exam not found or failed to load.
          </p>
          <div className='space-x-2'>
            <Button
              onClick={handleBack}
              variant='outline'
              className='border-tekhelet-300 text-tekhelet-600 hover:bg-tekhelet-50 bg-white/60 backdrop-blur-md'
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

  // Render the appropriate preview component based on examType
  if (examType === 'reading' && readingExamData) {
    return (
      <ReadingExamPreview
        examData={readingExamData}
        onStartExam={handleStartExam}
        onBack={handleBack}
      />
    );
  }

  if (examType === 'listening' && listeningExamData) {
    return (
      <ListeningExamPreview
        examData={listeningExamData}
        onStartExam={handleStartExam}
        onBack={handleBack}
      />
    );
  }

  // Loading state or waiting for data
  return null;
};

export default ExamPreviewPage;
