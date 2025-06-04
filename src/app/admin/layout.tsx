import { AdminSidebar } from '@/components/layout';
import { SidebarProvider } from '@/components/ui/sidebar';
import AuthProvider from '@/providers/AuthProvider';
import React from 'react';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <SidebarProvider>
        <AdminSidebar />
        <div className='flex-1 flex flex-col min-h-screen'>
          <main className='flex-1'>{children}</main>
        </div>
      </SidebarProvider>
    </AuthProvider>
  );
};

export default AdminLayout;
