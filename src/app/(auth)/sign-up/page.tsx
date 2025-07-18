'use client';

import { CURRENT_PAGE_SESSION_STORAGE_KEY, PAGES } from '@/constants/pages';

import { SignUpForm } from '@/components/features/public/auth/SignUpForm';
import CustomLink from '@/components/ui/link';
import { useEffect } from 'react';

export default function SignUpPage() {
  useEffect(() => {
    if (window != undefined) {
      sessionStorage.setItem(CURRENT_PAGE_SESSION_STORAGE_KEY, PAGES.AUTH.SIGN_UP);
    }
  }, []);

  return (
    <div className='flex flex-1 flex-col justify-center px-8 py-12 sm:px-16 lg:px-24'>
      <div className='mx-auto w-full max-w-sm'>
        <h1 className='text-3xl font-bold tracking-tight text-[#0c1421]'>
          Create Account <span className='inline-block'>✨</span>
        </h1>
        <p className='mt-3 text-muted-foreground'>
          Join us today and start your journey.
          <br />
          Sign up to access all features and benefits.
        </p>

        <SignUpForm />

        <p className='mt-8 text-center text-sm text-muted-foreground'>
          Already have an account? <CustomLink href='/sign-in' text='Sign in' />
        </p>

        <p className='mt-10 text-center text-xs text-muted-foreground'>
          © 2025 ALL RIGHTS RESERVED
        </p>
      </div>
    </div>
  );
}
