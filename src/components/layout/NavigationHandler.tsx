'use client';

import { usePassageNavigation } from '@/hooks/apis/reading/usePassageNavigation';

export function NavigationHandler() {
  usePassageNavigation();
  return null;
}
