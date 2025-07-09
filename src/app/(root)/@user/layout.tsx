import { Header } from '@/components/layout/Header';
import { AppSidebar } from '@/components/layout/Sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import AuthProvider from '@/providers/AuthProvider';
import React from 'react';

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <SidebarProvider>
        <AppSidebar />
        <div className='size-full'>
          <Header />
          <div className='p-6'>{children}</div>
        </div>
      </SidebarProvider>
    </AuthProvider>
  );
};

export default RootLayout;
