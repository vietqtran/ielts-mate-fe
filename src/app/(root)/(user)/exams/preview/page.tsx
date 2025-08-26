import NotFound from '@/app/not-found';
import ExamPreviewPage from '@/components/features/preview/ExamPreviewPage';

const ExamPreview = async ({
  searchParams,
}: {
  searchParams: Promise<{ examUrl: string; examType: string }>;
}) => {
  const { examUrl, examType } = await searchParams;

  const lowercaseExamUrl = examUrl?.toLowerCase();
  const lowercaseExamType = examType?.toLowerCase();

  if (
    !lowercaseExamUrl ||
    !lowercaseExamType ||
    (lowercaseExamType !== 'reading' && lowercaseExamType !== 'listening')
  ) {
    return <NotFound />;
  }
  return <ExamPreviewPage examUrl={lowercaseExamUrl} examType={lowercaseExamType} />;
};

export default ExamPreview;
