'use client';

import { cn } from '@/lib/utils';
import React from 'react';

export interface PracticeShellProps {
  header: React.ReactNode;
  children: React.ReactNode; // the main content area below header
  className?: string;
}

export const PracticeShell: React.FC<PracticeShellProps> = ({ header, children, className }) => {
  return (
    <div
      className={cn(
        'h-screen w-full grid grid-rows-[auto_1fr] bg-medium-slate-blue-900',
        className
      )}
    >
      {header}
      <div className='h-full overflow-hidden'>{children}</div>
    </div>
  );
};

export default PracticeShell;
