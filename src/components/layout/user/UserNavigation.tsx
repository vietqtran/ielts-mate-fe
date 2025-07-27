'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppSelector, useAuth } from '@/hooks';
import { cn } from '@/lib/utils';
import { BookOpen, History, Home, LogOut, Settings, User, User2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/',
    icon: Home,
  },
  {
    name: 'Reading',
    href: '/reading',
    icon: BookOpen,
  },
  {
    name: 'Listening',
    href: '/listening',
    icon: BookOpen,
  },
  {
    name: 'Practice Tests',
    href: '/practice-tests',
    icon: BookOpen,
  },
  {
    name: 'History',
    href: '/history',
    icon: History,
  },
  {
    name: 'Personalized',
    href: '/personalized',
    icon: User,
  },
];

export function UserNavigation() {
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
    <nav className='border-b bg-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo */}
          <div className='flex items-center gap-2'>
            <Image src='/logo.svg' height={32} width={32} alt='IELTS Mate' />
            <span className='font-bold text-lg'>IELTS Mate</span>
          </div>

          {/* Navigation Links */}
          <div className='hidden md:flex items-center space-x-8'>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  )}
                >
                  <Icon className='h-4 w-4' />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className='flex items-center'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
                  <Avatar className='h-8 w-8'>
                    <AvatarImage src='/image.png?height=32&width=32' />
                    <AvatarFallback>
                      {user?.firstName?.charAt(0)}
                      {user?.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-56'>
                <DropdownMenuLabel>
                  <div className='flex flex-col space-y-1'>
                    <p className='text-sm font-medium leading-none'>
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className='text-xs leading-none text-muted-foreground'>{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href='/profile' className='flex items-center w-full cursor-pointer'>
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
          </div>
        </div>
      </div>
    </nav>
  );
}
