import ListeningExamDetailsPage from '@/components/features/user/exams/listening/ListeningExamDetailsPage';
import ReadingExamDetailsPage from '@/components/features/user/exams/reading/ReadingExamDetailsPage';

interface ExamDetailsProps {
  searchParams: {
    mode?: string;
    examId?: string;
  };
}

const ExamDetails = ({ searchParams }: ExamDetailsProps) => {
  const { mode = 'reading', examId } = searchParams;

  // If no examId is provided, redirect or show error
  if (!examId) {
    return (
      <div className='min-h-screen bg-medium-slate-blue-900 flex items-center justify-center'>
        <div className='bg-white/70 backdrop-blur-lg border border-tekhelet-200 rounded-2xl shadow-xl p-6 text-center'>
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
      return (
        <div className='min-h-screen bg-medium-slate-blue-900 flex items-center justify-center'>
          <div className='bg-white/70 backdrop-blur-lg border border-tekhelet-200 rounded-2xl shadow-xl p-6 text-center'>
            <h1 className='text-2xl font-bold text-tekhelet-400 mb-2'>Invalid Mode</h1>
            <p className='text-tekhelet-500'>Supported modes are: reading, listening</p>
          </div>
        </div>
      );
  }
};

export default ExamDetails;
