import { useEffect } from 'react';

export const usePageTitle = (title: string) => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.title = `${title} | IELTS Mate`;
    }
  }, [title]);
};
