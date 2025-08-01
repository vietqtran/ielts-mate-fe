import ListeningExamHistory from '@/components/features/user/history/exam/listening/ListeningExamHistory';
import ReadingExamHistory from '@/components/features/user/history/exam/reading/ReadingExamHistory';

interface ExamsTabControllerProps {
  params: Promise<{ tabs: string }>;
}

const ExamsTabController = async ({ params }: ExamsTabControllerProps) => {
  const { tabs } = await params;

  switch (tabs) {
    case 'reading':
      return <ReadingExamHistory />;
    case 'listening':
      return <ListeningExamHistory />;
    default:
      return <div>Exams History</div>;
  }
};

export default ExamsTabController;
