'use client';

import { ReactNode } from 'react';
import { UserHeader } from './UserHeader';

interface UserLayoutProps {
  children: ReactNode;
}

export function UserLayout({ children }: UserLayoutProps) {
  return (
    <div className='min-h-screen bg-gray-50'>
      <UserHeader />
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>{children}</main>
    </div>
  );
}
