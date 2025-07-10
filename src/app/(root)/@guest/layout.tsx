import AuthProvider from '@/providers/AuthProvider';
import React from 'react';

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return <AuthProvider>{children}</AuthProvider>;
};

export default RootLayout;
