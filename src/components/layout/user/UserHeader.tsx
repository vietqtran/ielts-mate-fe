'use client';

import Image from 'next/image';
import { MobileNavigation } from './MobileNavigation';
import { UserNavigation } from './UserNavigation';

export function UserHeader() {
  return (
    <header className='bg-white/90 backdrop-blur-xl border-b border-[#60a3d9]/30 shadow-lg sticky top-0 z-50'>
      {/* Desktop Navigation */}
      <div className='hidden md:block'>
        <UserNavigation />
      </div>

      {/* Mobile Navigation */}
      <div className='md:hidden'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            {/* Logo - visible on mobile */}
            <div className='flex items-center gap-2'>
              <Image
                src='/logo.svg'
                height={32}
                width={32}
                alt='IELTS Mate'
                className='rounded-lg'
              />
              <span className='font-bold text-lg text-[#003b73]'>IELTS Mate</span>
            </div>

            {/* Mobile Menu Button */}
            <MobileNavigation />
          </div>
        </div>
      </div>
    </header>
  );
}
