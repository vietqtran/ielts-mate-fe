import { Header } from '@/components/layout/Header';
import { NavigationHandler } from '@/components/layout/NavigationHandler';
import { AppSidebar } from '@/components/layout/Sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import AuthProvider from '@/providers/AuthProvider';
import CreatorSSEListener from '@/providers/CreatorSSEListener';
import React from 'react';

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <CreatorSSEListener />
      <NavigationHandler />
      <SidebarProvider>
        <AppSidebar />
        <div className='size-full'>
          <Header />
          {children}
        </div>
      </SidebarProvider>
    </AuthProvider>
  );
};

export default RootLayout;
