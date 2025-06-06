'use client';

import { useAppDispatch, useAppSelector, useAuth } from '@/hooks';
import React, { useEffect } from 'react';

import { setFullPageLoading } from '@/store/slices/common-slice';
import { useRouter } from 'next/navigation';

type Props = {
  children: React.ReactNode;
  isAuthPage?: boolean;
};

const AuthProvider = ({ children, isAuthPage = false }: Props) => {
  const { refetchUser } = useAuth();
  const { user } = useAppSelector((state) => state.auth);
  const { replace } = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setFullPageLoading(true));
    const checkAuth = async () => {
      if (isAuthPage) {
        if (user) {
          replace('/');
        }
      } else {
        await refetchUser();

        if (!user) {
          replace('/sign-in');
        }
      }

      setTimeout(() => {
        dispatch(setFullPageLoading(false));
      }, 2000);
    };

    checkAuth();
  }, []);

  return children;
};

export default AuthProvider;
