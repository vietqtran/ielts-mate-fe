'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  BarChart3,
  BookOpen,
  FileText,
  Home,
  LogOut,
  PlusCircle,
  Settings,
  User2,
  Users,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { authAPI } from '@/lib/api/auth';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Call logout API
      await authAPI.logout();

      // Clear local storage and session storage
      localStorage.clear();
      sessionStorage.clear();

      toast.success('Logged out successfully');
      router.push('/sign-in');
    } catch (error) {
      console.error('Logout error:', error);

      // Even if API call fails, still clear local storage and redirect
      localStorage.clear();
      sessionStorage.clear();
      toast.error('Logout API failed, but you have been logged out locally');
      router.push('/sign-in');
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className='px-4 h-14'>
        <div className='flex items-center justify-start h-full gap-2'>
          <Image src={'/logo.svg'} height={36} width={36} alt='' />
          <span className='font-bold text-lg'>IELTS Mate Admin</span>
        </div>
      </SidebarHeader>
      <SidebarSeparator className='mx-0' />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin'}>
                  <Link href='/admin'>
                    <Home className='h-4 w-4' />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/reading-passage')}>
                  <Link href='/admin/reading-passage'>
                    <BookOpen className='h-4 w-4' />
                    <span>Reading Passages</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href='/admin/reading-passage/create'>
                    <PlusCircle className='h-4 w-4' />
                    <span>Create Passage</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href='/admin/users'>
                    <Users className='h-4 w-4' />
                    <span>Users</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href='/admin/reports'>
                    <BarChart3 className='h-4 w-4' />
                    <span>Reports</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href='/admin/content'>
                    <FileText className='h-4 w-4' />
                    <span>Content Management</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator className='mx-0' />
      <SidebarFooter className='p-4'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='w-full justify-start gap-2'>
              <Avatar className='h-6 w-6'>
                <AvatarImage src='/image.png?height=32&width=32' />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <span>Admin User</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-56'>
            <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href='/admin/profile'>
                <User2 className='mr-2 h-4 w-4' />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href='/admin/settings'>
                <Settings className='mr-2 h-4 w-4' />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className='text-red-600 hover:text-red-700'>
              <LogOut className='mr-2 h-4 w-4' />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
