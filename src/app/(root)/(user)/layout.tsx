import { UserLayout } from '@/components/layout/user';
import AuthProvider from '@/providers/AuthProvider';
import React from 'react';

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <UserLayout>{children}</UserLayout>
    </AuthProvider>
  );
};

export default RootLayout;
