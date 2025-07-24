'use client';
import { useSearchParams } from 'next/navigation';
import { ReactNode } from 'react';

const PreviewLayout = ({ children }: { children: ReactNode }) => {
  const searchParams = useSearchParams();
  const examUrl = searchParams.get('examUrl');

  // Basic validation - could redirect if needed
  if (!examUrl) {
    console.warn('No examUrl provided in preview');
  }

  return <>{children}</>;
};

export default PreviewLayout;
