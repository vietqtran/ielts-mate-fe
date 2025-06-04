'use client';

import { useAppSelector } from '@/hooks';
import { RootState } from '@/types';
import LoadingSpinner from '../ui/loading-spinner';

export const FullPageLoading = () => {
  const { isFullPageLoading } = useAppSelector((state: RootState) => state.common);
  return isFullPageLoading ? (
    <div className='w-screen h-screen fixed inset-0 z-[999999] bg-white'>
      <div className='grid size-full place-items-center'>
        <LoadingSpinner color='black' />
      </div>
    </div>
  ) : null;
};
