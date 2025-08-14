'use client';

import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to monitoring if available; avoid exposing details to users
    // eslint-disable-next-line no-console
    console.error('Global UI error captured', { name: error.name, digest: error.digest });
  }, [error]);

  return (
    <html>
      <body>
        <div className='min-h-screen flex items-center justify-center bg-white'>
          <div className='text-center p-6 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-tekhelet-900/20'>
            <h2 className='text-tekhelet-500 text-xl font-semibold mb-2'>Something went wrong</h2>
            <p className='text-tekhelet-400 mb-6'>
              Please try again. If the problem persists, come back later.
            </p>
            <div className='flex items-center justify-center gap-3'>
              <Button onClick={() => reset()} className='bg-selective-yellow-300 text-white'>
                Try again
              </Button>
              <Button onClick={() => (window.location.href = '/')} variant='outline'>
                Go home
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
