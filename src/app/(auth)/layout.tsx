import AuthProvider from '@/providers/AuthProvider';
import Image from 'next/image';
import React from 'react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider isAuthPage>
      <div className='flex min-h-screen'>
        <Image
          src='/assets/images/auth-banner.png'
          alt='Decorative background'
          width={5000}
          height={5000}
          className='h-screen w-screen object-cover lg:hidden block fixed top-0 left-0 -z-20'
          priority
        />
        <div className='h-screen w-screen object-cover lg:hidden block fixed top-0 left-0 -z-10 bg-black/40'></div>
        <div className='flex-1 min-h-screen grid place-items-center'>
          <div className='size-fit bg-background shadow-2xl lg:shadow-none rounded-4xl m-3'>
            {children}
          </div>
        </div>
        <div className='hidden flex-shrink-0 lg:block lg:w-1/2 relative'>
          <div className='h-screen w-full bg-[#f7fbff] sticky top-0 left-0 right-0'>
            <Image
              src='/assets/images/auth-banner.png'
              alt='Decorative background'
              width={5000}
              height={5000}
              className='h-full w-full object-cover'
              priority
            />
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}
