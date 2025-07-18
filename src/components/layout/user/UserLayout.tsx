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
      <main className='mx-auto '>{children}</main>
    </div>
  );
}
