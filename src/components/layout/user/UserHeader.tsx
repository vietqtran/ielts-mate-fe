'use client';

import Image from 'next/image';
import { MobileNavigation } from './MobileNavigation';
import { UserNavigation } from './UserNavigation';

export function UserHeader() {
  return (
    <header className='bg-white border-b'>
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
              <Image src='/logo.svg' height={32} width={32} alt='IELTS Mate' />
              <span className='font-bold text-lg'>IELTS Mate</span>
            </div>

            {/* Mobile Menu Button */}
            <MobileNavigation />
          </div>
        </div>
      </div>
    </header>
  );
}
