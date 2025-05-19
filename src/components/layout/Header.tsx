'use client';

import { Bell, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function Header() {
  return (
    <header className='border-b'>
      <div className='flex h-14 items-center px-4'>
        <SidebarTrigger className='mr-2 cursor-pointer' />
        <div className='flex items-center gap-2 md:w-[300px]'>
          <Search className='h-4 w-4 text-muted-foreground' />
          <Input type='search' placeholder='Search...' className='h-9 md:flex' />
        </div>
        <div className='ml-auto flex items-center gap-2'>
          <Button variant='ghost' size='icon' className='relative'>
            <Bell className='h-5 w-5' />
            <span className='absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive' />
            <span className='sr-only'>Notifications</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
