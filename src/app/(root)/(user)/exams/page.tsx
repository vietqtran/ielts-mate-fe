import { redirect } from 'next/navigation';

const ExamDispatcher = async () => {
  return redirect('/exams/all');
};

export default ExamDispatcher;
