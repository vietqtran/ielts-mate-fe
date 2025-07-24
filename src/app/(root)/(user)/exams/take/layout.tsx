'use client';
import { redirect, useSearchParams } from 'next/navigation';
import { ReactNode } from 'react';

const TakeLayout = ({ children }: { children: ReactNode }) => {
  const searchParams = useSearchParams();
  const examType = searchParams.get('examType');
  const examUrl = searchParams.get('examUrl');

  if (!examType || !examUrl) {
    redirect('/exams');
  }
  return <>{children}</>;
};

export default TakeLayout;
