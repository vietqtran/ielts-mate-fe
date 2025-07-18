'use client';

import { clearUserPassageState } from '@/store/slices/reading-filter-slices';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

export function useUserPassageNavigation() {
  const pathname = usePathname();
  const dispatch = useDispatch();

  useEffect(() => {
    // Clear user passage state when navigating away from reading pages
    // Keep state when on reading pages
    if (!pathname.startsWith('/reading')) {
      dispatch(clearUserPassageState());
    }
  }, [pathname, dispatch]);
}
