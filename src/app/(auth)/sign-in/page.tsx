'use client';

import { CURRENT_PAGE_SESSION_STORAGE_KEY, PAGES } from '@/constants/pages';

import { SignInForm } from '@/components/auth/SignInForm';
import CustomLink from '@/components/ui/link';
import { useEffect } from 'react';

export default function SignInPage() {
  useEffect(() => {
    if (window != undefined) {
      sessionStorage.setItem(CURRENT_PAGE_SESSION_STORAGE_KEY, PAGES.AUTH.SIGN_IN);
    }
  }, []);

  return (
    <div className='flex flex-1 flex-col justify-center px-8 py-12 sm:px-16 lg:px-24'>
      <div className='mx-auto w-full max-w-sm'>
        <h1 className='text-3xl font-bold tracking-tight text-[#0c1421]'>
          Welcome Back <span className='inline-block'>👋</span>
        </h1>
        <p className='mt-3 text-muted-foreground'>
          Today is a new day. It&apos;s your day. You shape it.
          <br />
          Sign in to start deploying your projects.
        </p>

        <SignInForm />

        <p className='mt-8 text-center text-sm text-muted-foreground'>
          Don&apos;t you have an account? <CustomLink href='/sign-up' text='Sign up' />
        </p>

        <p className='mt-10 text-center text-xs text-muted-foreground'>
          © 2025 ALL RIGHTS RESERVED
        </p>
      </div>
    </div>
  );
}
