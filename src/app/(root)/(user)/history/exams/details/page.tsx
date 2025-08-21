import ListeningExamDetailsPage from '@/components/features/user/exams/listening/ListeningExamDetailsPage';
import ReadingExamDetailsPage from '@/components/features/user/exams/reading/ReadingExamDetailsPage';
import { notFound } from 'next/navigation';

interface ExamDetailsProps {
  searchParams: Promise<{
    mode?: string;
    examId?: string;
  }>;
}

const ExamDetails = async ({ searchParams }: ExamDetailsProps) => {
  const { mode = 'reading', examId } = await searchParams;

  // If no examId is provided, redirect or show error
  if (!examId) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='backdrop-blur-lg border rounded-2xl p-6 text-center'>
          <h1 className='text-2xl font-bold text-tekhelet-400 mb-2'>Missing Exam ID</h1>
          <p className='text-tekhelet-500'>Please provide a valid exam ID to view details.</p>
        </div>
      </div>
    );
  }

  // Dispatch to appropriate component based on mode
  switch (mode.toLowerCase()) {
    case 'reading':
      return <ReadingExamDetailsPage examId={examId} />;
    case 'listening':
      return <ListeningExamDetailsPage examId={examId} />;
    default:
      return notFound();
  }
};

export default ExamDetails;
