import './globals.css';
import 'ldrs/react/Ring.css';

import React, { Suspense } from 'react';

import FullPageLoading from '@/components/common/loader/FullPageLoading';
import { Toaster } from '@/components/ui/sonner';
import StoreProvider from '@/providers/StoreProvider';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'IELTS Mate',
    template: '%s | IELTS Mate',
  },
  description: 'Your site description goes here',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ielts-mate.com',
    siteName: 'IELTS Mate',
    images: [
      {
        url: 'https://ielts-mate/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Og Image Alt',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@yoursite',
    creator: '@yourhandle',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className='antialiased bg-background text-foreground relative'>
        <StoreProvider>
          <Suspense fallback={null}>
            {children}
            <FullPageLoading />
            <Toaster theme='light' richColors />
          </Suspense>
        </StoreProvider>
      </body>
    </html>
  );
}
