'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { useAppSelector, useAuth } from '@/hooks';
import { cn } from '@/lib/utils';
import {
  Album,
  BellRing,
  BookOpen,
  Headphones,
  History,
  Home,
  LayoutDashboard,
  LogOut,
  Settings,
  SquareCheck,
  Target,
  Trophy,
  User,
  User2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const navigationGroups = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    name: 'Practice',
    icon: Album,
    items: [
      {
        name: 'Reading',
        href: '/reading',
        icon: BookOpen,
      },
      {
        name: 'Listening',
        href: '/listening',
        icon: Headphones,
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
    icon: History,
    items: [
      {
        name: 'Practice',
        href: '/history/practices/reading',
        icon: BookOpen,
      },
      {
        name: 'Exams',
        href: '/history/exams/reading',
        icon: Headphones,
      },
    ],
  },
  {
    name: 'Vocabulary',
    href: '/personalized',
    icon: User,
  },
  {
    name: 'AI Suggestions',
    href: '/suggestion',
    icon: Target,
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
        replace('/');
      }, 500);
    } catch (error) {}
  };

  const isActiveRoute = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
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
            <NavigationMenu viewport={false}>
              <NavigationMenuList>
                {navigationGroups.map((group) => {
                  if (group.items) {
                    // Group with sub-items
                    const hasActiveChild = group.items.some((item) => isActiveRoute(item.href));

                    return (
                      <NavigationMenuItem key={group.name} className='z-20'>
                        <NavigationMenuTrigger
                          className={cn(
                            'flex items-center gap-2 text-sm font-medium',
                            hasActiveChild
                              ? 'text-[#60a3d9]'
                              : 'text-[#003b73] hover:text-[#60a3d9]'
                          )}
                        >
                          {group.icon && <group.icon className='h-4 w-4' />}
                          {group.name}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <div className='grid w-[200px] gap-2 p-2'>
                            {group.items.map((item) => {
                              const Icon = item.icon;
                              const isActive = isActiveRoute(item.href);

                              return (
                                <NavigationMenuLink key={item.name} asChild>
                                  <Link
                                    href={item.href}
                                    className={cn(
                                      'flex flex-row items-center gap-2 rounded-md p-2 text-sm font-medium hover:bg-accent',
                                      isActive
                                        ? 'text-[#0074b7] font-semibold'
                                        : 'text-[#003b73] hover:text-[#60a3d9]'
                                    )}
                                  >
                                    <Icon className='h-4 w-4' />
                                    <p>{item.name}</p>
                                  </Link>
                                </NavigationMenuLink>
                              );
                            })}
                          </div>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    );
                  } else {
                    // Single navigation item
                    const Icon = group.icon!;
                    const isActive = isActiveRoute(group.href!);

                    return (
                      <NavigationMenuItem key={group.name}>
                        <Link
                          href={group.href!}
                          className={cn(
                            'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100',
                            isActive
                              ? 'text-[#0074b7] font-semibold'
                              : 'text-[#003b73] hover:text-[#60a3d9]'
                          )}
                        >
                          <Icon className='h-4 w-4' />
                          <span>{group.name}</span>
                        </Link>
                      </NavigationMenuItem>
                    );
                  }
                })}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* User Menu */}
          <div className='flex items-center' data-cy='user-menu'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  className='relative h-8 w-8 rounded-full'
                  data-cy='avatar-button'
                >
                  <Avatar className='h-8 w-8'>
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
                {user?.roles.includes('USER') && user?.roles.includes('CREATOR') && (
                  <DropdownMenuItem asChild>
                    <Link
                      href='/creator/passages'
                      className='flex items-center w-full cursor-pointer'
                    >
                      <LayoutDashboard className='mr-2 h-4 w-4' />
                      <span>Creator view</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href='/settings' className='flex items-center w-full cursor-pointer'>
                    <Settings className='mr-2 h-4 w-4' />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href='/reminder' className='flex items-center w-full cursor-pointer'>
                    <BellRing className='mr-2 h-4 w-4' />
                    <span>Reminder</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href='/streak' className='flex items-center w-full cursor-pointer'>
                    <Trophy className='mr-2 h-4 w-4' />
                    <span>Streak</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href='/target' className='flex items-center w-full cursor-pointer'>
                    <Target className='mr-2 h-4 w-4' />
                    <span>Target</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href='/markup' className='flex items-center w-full cursor-pointer'>
                    <SquareCheck className='mr-2 h-4 w-4' />
                    <span>Markup</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} data-cy='logout-button'>
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
