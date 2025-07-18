'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import LoadingSpinner from '@/components/ui/loading-spinner';
import { useAuth } from '@/hooks';

export function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleAuthCallback } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function processCallback() {
      try {
        const success = await handleAuthCallback(searchParams);
        if (success) {
          router.replace('/');
        } else {
          setError('Authentication failed. Please try again.');
        }
      } catch (err) {
        setError('An error occurred during authentication.');
      } finally {
        setIsProcessing(false);
      }
    }

    processCallback();
  }, [handleAuthCallback, router, searchParams]);

  if (isProcessing) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen'>
        <LoadingSpinner />
        <p className='mt-4 text-gray-600'>Completing authentication...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen'>
        <div className='rounded-md bg-red-50 p-4 max-w-md'>
          <p className='text-sm text-red-700'>{error}</p>
        </div>
        <button
          onClick={() => router.replace('/sign-in')}
          className='mt-4 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'
        >
          Back to Sign In
        </button>
      </div>
    );
  }

  return null;
}
