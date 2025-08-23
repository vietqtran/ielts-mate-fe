'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { useAppSelector, useAuth } from '@/hooks';
import {
  ClipboardCheck,
  Ear,
  FileText,
  Headphones,
  LayoutDashboard,
  LogOut,
  Settings,
  User2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const sidebarNavItems = [
  {
    title: 'Dashboard',
    href: '/creator',
    icon: <LayoutDashboard className='h-4 w-4' />,
  },
  {
    title: 'Reading Tasks',
    href: '/creator/passages',
    icon: <FileText className='h-4 w-4' />,
  },
  {
    title: 'Reading Exams',
    href: '/creator/reading-exams',
    icon: <ClipboardCheck className='h-4 w-4' />,
  },
  {
    title: 'Listening Tasks',
    href: '/creator/listenings',
    icon: <Headphones className='h-4 w-4' />,
  },
  {
    title: 'Listening Exams',
    href: '/creator/listening-exams',
    icon: <Ear className='h-4 w-4' />,
  },
];

export function AppSidebar() {
  const { signOut } = useAuth();
  const { replace } = useRouter();
  const pathname = usePathname();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await signOut();
      setTimeout(() => {
        replace('/sign-in');
      }, 500);
    } catch (error) {}
  };

  return (
    <Sidebar>
      <SidebarHeader className='px-4 h-14'>
        <div className='flex items-center justify-start h-full gap-2'>
          <Image src={'/logo.svg'} height={36} width={36} alt='' />
          <span className='font-bold text-lg'>IELTS Mate</span>
        </div>
      </SidebarHeader>
      <SidebarSeparator className='mx-0' />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    className={
                      pathname === item.href ||
                      (item.href !== '/creator' && pathname.startsWith(item.href))
                        ? 'bg-blue-500 text-white'
                        : undefined
                    }
                  >
                    <Link href={item.href}>
                      {item.icon}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator className='mx-0' />
      <SidebarFooter className='p-4 flex flex-col gap-2'>
        {/* Role Switcher - Only show if user has both roles */}
        {user?.roles.includes('USER') && user?.roles.includes('CREATOR') && (
          <Button
            variant='outline'
            size='sm'
            className='w-full text-sm'
            onClick={() => {
              // Determine the current view based on URL
              const isCreatorView = pathname.startsWith('/creator');
              // Navigate to the opposite view
              if (isCreatorView) {
                replace('/dashboard');
              } else {
                replace('/creator');
              }
            }}
          >
            {pathname.startsWith('/creator') ? 'Switch to User View' : 'Switch to Creator View'}
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='w-full p-0 flex items-center justify-start gap-2'>
              <Avatar className='h-7 w-7'>
                <AvatarFallback>
                  {user?.firstName?.charAt(0)}
                  {user?.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className='text-md'>
                {user?.firstName} {user?.lastName}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-56'>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link
                href={user?.roles.includes('CREATOR') ? '/creator/profile' : '/profile'}
                className='flex items-center w-full justify-start cursor-pointer'
              >
                <User2 className='mr-2 h-4 w-4' />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className='mr-2 h-4 w-4' />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
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
