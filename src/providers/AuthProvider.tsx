'use client';

import { useAppDispatch, useAppSelector, useAuth } from '@/hooks';
import React, { useEffect, useRef } from 'react';

import { setFullPageLoading } from '@/store/slices/common-slice';
import { usePathname, useRouter } from 'next/navigation';

type Props = {
  children: React.ReactNode;
  isAuthPage?: boolean;
};

const AuthProvider = ({ children, isAuthPage = false }: Props) => {
  const { refetchUser } = useAuth();
  const { user } = useAppSelector((state) => state.auth);
  const { replace } = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const fetchedRef = useRef(false);

  // Reset fetchedRef when user becomes null (logout)
  useEffect(() => {
    if (!user) {
      fetchedRef.current = false;
    }
  }, [user]);
  const isCreator = user?.roles?.some((role) => role.toLowerCase() === 'creator');

  // Decide where an authenticated user should land based on their roles
  const resolveHomePath = () => {
    if (isCreator) return '/creator';
    return '/dashboard'; // default user area
  };

  // Smart user verification: only call /me API when necessary
  // - Skip for auth pages when user not authenticated
  // - Skip for auth pages even when user is authenticated (wait for protected pages)
  // - Only verify on protected pages to avoid unnecessary API calls
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      dispatch(setFullPageLoading(true));
      try {
        // Skip refetchUser for auth pages when user is not authenticated to avoid unnecessary API calls
        // This prevents automatic redirect to sign-in when accessing auth pages
        // Also skip for reset page regardless of authentication status
        if ((isAuthPage && !user) || pathname === '/reset') {
          dispatch(setFullPageLoading(false));
          return;
        }

        // If we have user from sign-in but are still on auth pages, don't call /me yet
        // Wait until user navigates to protected pages to verify authentication
        if (user && isAuthPage) {
          dispatch(setFullPageLoading(false));
          return;
        }

        // Skip refetchUser if we already have a user and have verified recently
        // This prevents double API calls after successful authentication
        if (user && fetchedRef.current) {
          dispatch(setFullPageLoading(false));
          return;
        }

        // Only fetch user when we don't have one OR when we have user but are on protected pages and haven't verified yet
        if (!user || (!isAuthPage && !fetchedRef.current)) {
          fetchedRef.current = true;
          await refetchUser();
        }
      } finally {
        if (!cancelled) {
          // Slight delay can smoothen UI transitions but keep it short.
          setTimeout(() => dispatch(setFullPageLoading(false)), 300);
        }
      }
    };
    init();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Redirect logic reacting to user & path changes (after user state known)
  useEffect(() => {
    // If we don't yet know (still loading), skip.
    // We rely on global loading overlay; here we just guard early.
    if (typeof window === 'undefined') return;

    // When user is authenticated
    if (user) {
      const targetHome = resolveHomePath();

      // Prevent access to auth pages & landing page when logged in
      // But allow access to reset page even when authenticated (for password reset)
      if ((isAuthPage && pathname !== '/reset') || pathname === '/') {
        if (pathname !== targetHome) replace(targetHome);
        return;
      }

      // Layout access rules:
      // - Creator: can access both /creator* and /dashboard* freely (no redirect)
      // - Non-creator: cannot access /creator* (redirect to /dashboard)
      if (!isCreator && pathname.startsWith('/creator')) {
        replace(targetHome);
      }
      return; // authenticated cases handled
    }

    // Unauthenticated user on a protected (non-auth) page -> send to landing or sign-in
    // But allow access to reset page for unauthenticated users
    if (!user && !isAuthPage && pathname !== '/reset') {
      // Keep existing behavior of sending to root landing (could be marketing page)
      if (pathname !== '/') replace('/');
    }
  }, [user, pathname, isAuthPage, replace]);

  return children;
};

export default AuthProvider;
