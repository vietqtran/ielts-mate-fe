import NotFound from '@/app/not-found';
import ListeningExamDetailsPage from '@/components/features/user/exams/listening/ListeningExamDetailsPage';
import ReadingExamDetailsPage from '@/components/features/user/exams/reading/ReadingExamDetailsPage';

export const metadata = {
  title: 'Exam Details',
};

interface ExamDetailsProps {
  searchParams: Promise<{
    mode?: string;
    examId?: string;
  }>;
}

const ExamDetails = async ({ searchParams }: ExamDetailsProps) => {
  const { mode, examId } = await searchParams;

  const lowercaseMode = mode?.toLowerCase();
  const lowercaseExamId = examId?.toLowerCase();

  if (lowercaseMode !== 'reading' && lowercaseMode !== 'listening' && !lowercaseExamId) {
    return <NotFound />;
  }

  // Dispatch to appropriate component based on mode
  switch (lowercaseMode) {
    case 'reading':
      return <ReadingExamDetailsPage examId={lowercaseExamId!} />;
    case 'listening':
      return <ListeningExamDetailsPage examId={lowercaseExamId!} />;
    default:
      return <NotFound />;
  }
};

export default ExamDetails;
