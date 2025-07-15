'use client';

import { clearPassageState } from '@/store/slices/passage-slice';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

export function usePassageNavigation() {
  const pathname = usePathname();
  const dispatch = useDispatch();

  useEffect(() => {
    // Clear passage state when navigating away from passages pages
    // Keep state when on passages list, create, or edit pages
    if (!pathname.startsWith('/creator/passages')) {
      dispatch(clearPassageState());
    }
  }, [pathname, dispatch]);
}
