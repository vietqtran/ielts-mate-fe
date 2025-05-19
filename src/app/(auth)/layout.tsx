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
        <div className='flex-1 min-h-screen grid place-items-center'>{children}</div>
        <div className='hidden flex-shrink-0 lg:block lg:w-1/2 relative'>
          <div className='h-screen w-full bg-[#f7fbff] sticky top-0 left-0 right-0'>
            <Image
              src='/image.png'
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
