import { redirect } from 'next/navigation';

const ExamDispatcher = async () => {
  return redirect('/exams/reading');
};

export default ExamDispatcher;
