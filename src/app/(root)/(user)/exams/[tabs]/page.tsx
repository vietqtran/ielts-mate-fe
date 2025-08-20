import { ListeningExamsTable, ReadingExamsTable } from '@/components/features/user/exams';
import { notFound } from 'next/navigation';
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
      return notFound();
  }
};

export default ExamHomepage;
