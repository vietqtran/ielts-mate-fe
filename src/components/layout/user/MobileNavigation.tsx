'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAppSelector, useAuth } from '@/hooks';
import { cn } from '@/lib/utils';
import { BookOpen, History, Home, LogOut, Menu, Settings, User, User2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const navigationGroups = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    name: 'Practice',
    items: [
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
    ],
  },
  {
    name: 'Exams',
    href: '/exams',
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

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { signOut } = useAuth();
  const { replace } = useRouter();
  const pathname = usePathname();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await signOut();
      setTimeout(() => {
        replace('/');
      }, 500);
    } catch (error) {}
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };
  const isActiveRoute = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <div className='md:hidden'>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant='ghost' size='icon' className='md:hidden'>
            <Menu className='h-5 w-5' />
            <span className='sr-only'>Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side='left' className='w-64'>
          <SheetHeader>
            <SheetTitle>
              <div className='flex items-center gap-2'>
                <Image src='/logo.svg' height={24} width={24} alt='IELTS Mate' />
                <span className='font-bold text-lg'>IELTS Mate</span>
              </div>
            </SheetTitle>
          </SheetHeader>

          <div className='flex flex-col space-y-4 mt-6'>
            {/* User Profile Section */}
            <div className='flex items-center space-x-3 p-3 rounded-lg bg-gray-50'>
              <Avatar className='h-10 w-10'>
                <AvatarImage src='/image.png?height=40&width=40' />
                <AvatarFallback>
                  {user?.firstName?.charAt(0)}
                  {user?.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-gray-900 truncate'>
                  {user?.firstName} {user?.lastName}
                </p>
                <p className='text-xs text-gray-500 truncate'>{user?.email}</p>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className='flex flex-col space-y-2'>
              {navigationGroups.map((group) => {
                if (group.items) {
                  // Group with sub-items (Practice)
                  return (
                    <div key={group.name} className='space-y-1'>
                      <div className='px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                        {group.name}
                      </div>
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = isActiveRoute(item.href);

                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={handleLinkClick}
                            className={cn(
                              'flex items-center gap-3 px-3 py-2 ml-4 rounded-lg text-sm font-medium transition-colors',
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
                  );
                } else {
                  // Single navigation item
                  const Icon = group.icon!;
                  const isActive = isActiveRoute(group.href!);

                  return (
                    <Link
                      key={group.name}
                      href={group.href!}
                      onClick={handleLinkClick}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                      )}
                    >
                      <Icon className='h-4 w-4' />
                      <span>{group.name}</span>
                    </Link>
                  );
                }
              })}
            </nav>

            {/* User Actions */}
            <div className='flex flex-col space-y-2 pt-4 border-t'>
              <Link
                href='/profile'
                onClick={handleLinkClick}
                className='flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg'
              >
                <User2 className='h-4 w-4' />
                <span>Profile</span>
              </Link>
              <button className='flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg text-left'>
                <Settings className='h-4 w-4' />
                <span>Settings</span>
              </button>
              <button
                onClick={handleLogout}
                className='flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg text-left'
              >
                <LogOut className='h-4 w-4' />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
