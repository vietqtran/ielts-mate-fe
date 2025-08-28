import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Exams',
};

const ExamDispatcher = async () => {
  return redirect('/exams/reading');
};

export default ExamDispatcher;
