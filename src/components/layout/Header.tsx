'use client';

import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Bell } from 'lucide-react';

export function Header() {
  return (
    <header className='border-b border-[#60a3d9]/30 bg-white/90 backdrop-blur-xl shadow-lg'>
      <div className='flex h-16 items-center px-6'>
        <SidebarTrigger className='mr-3 cursor-pointer text-[#0074b7] hover:text-[#003b73] rounded-lg p-2 hover:bg-[#60a3d9]/10 transition-all duration-200' />
        {/* <div className='flex items-center gap-2 md:w-[300px]'>
          <Search className='h-4 w-4 text-muted-foreground' />
          <Input type='search' placeholder='Search...' className='h-9 md:flex' />
        </div> */}
        <div className='ml-auto flex items-center gap-3'>
          <Button
            variant='ghost'
            size='icon'
            className='relative text-[#0074b7] hover:text-[#003b73] hover:bg-[#60a3d9]/10 rounded-xl transition-all duration-200'
          >
            <Bell className='h-5 w-5' />
            <span className='absolute right-1 top-1 h-2 w-2 rounded-full bg-gradient-to-r from-[#0074b7] to-[#60a3d9]' />
            <span className='sr-only'>Notifications</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
