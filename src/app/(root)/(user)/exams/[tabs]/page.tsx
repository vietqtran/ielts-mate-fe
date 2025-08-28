import { ListeningExamsTable, ReadingExamsTable } from '@/components/features/user/exams';

export const metadata = {
  title: 'Exams',
};

interface ExamHomepageProps {
  params: Promise<{ tabs: string }>;
}
const ExamHomepage = async ({ params }: ExamHomepageProps) => {
  const { tabs } = await params;
  switch (tabs) {
    case 'reading':
      return <ReadingExamsTable />;
    case 'listening':
      return <ListeningExamsTable />;
    default:
      return null;
  }
};

export default ExamHomepage;
