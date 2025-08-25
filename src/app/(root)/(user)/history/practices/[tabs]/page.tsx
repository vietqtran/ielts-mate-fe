import ListeningHistory from '@/components/features/user/history/practice/listening/ListeningHistory';
import ReadingHistory from '@/components/features/user/history/practice/reading/ReadingHistory';

interface AttemptPracticeProps {
  params: Promise<{ tabs: string }>;
}

const AttemptPractice = async ({ params }: AttemptPracticeProps) => {
  const { tabs } = await params;

  switch (tabs) {
    case 'reading':
      return <ReadingHistory />; // reading exams component
    case 'listening':
      return <ListeningHistory />; // listening exams component
    default:
      return null;
  }
};

export default AttemptPractice;
