import { ListeningExamsTable, ReadingExamsTable } from '@/components/features/user/exams';
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
