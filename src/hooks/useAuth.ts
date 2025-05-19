'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';

import instance from '@/lib/axios';
import { setUser } from '@/store/slices/auth-slice';
import { AxiosError } from 'axios';
import { useAppDispatch } from './useStore';

export function useAuth() {
  const dispatch = useAppDispatch();
  const mountedRef = useRef(true);
  const abortControllersRef = useRef(new Map());

  const createAbortController = useCallback((key: string) => {
    if (abortControllersRef.current.has(key)) {
      abortControllersRef.current.get(key).abort();
    }

    const controller = new AbortController();
    abortControllersRef.current.set(key, controller);
    return controller;
  }, []);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      abortControllersRef.current.forEach((controller) => {
        controller.abort();
      });
    };
  }, []);

  const { refetch: refetchUserQuery } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const controller = createAbortController('fetchUser');
      try {
        const { data } = await instance.get('/auth/me', {
          withCredentials: true,
          signal: controller.signal,
        });
        if (data.status === 'success' && mountedRef.current) {
          dispatch(setUser(data.data));
        }
        return data;
      } catch (error) {
        if (error instanceof AxiosError && error.name === 'AbortError') {
          console.log('Fetch user request was aborted');
          return null;
        }
        if (mountedRef.current) throw error;
        return null;
      } finally {
        abortControllersRef.current.delete('fetchUser');
      }
    },
    enabled: false,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const refetchUser = useCallback(async () => {
    if (!mountedRef.current) return null;
    try {
      const result = await refetchUserQuery();
      return result;
    } catch (error) {
      if (mountedRef.current) {
        console.error('Failed to fetch user:', error);
      }
      throw error;
    }
  }, [refetchUserQuery]);

  const signIn = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const controller = createAbortController('signIn');
      try {
        const { data } = await instance.post('/auth/sign-in', credentials, {
          signal: controller.signal,
        });
        if (mountedRef.current) {
          dispatch(setUser(data.data.user));
          localStorage.setItem('session_id', data.data.session_id);
        }
        return data;
      } catch (error) {
        if (error instanceof AxiosError && error.name === 'AbortError') {
          console.log('Sign in request was aborted');
          throw new Error('Sign in request was cancelled');
        }
        throw error;
      } finally {
        abortControllersRef.current.delete('signIn');
      }
    },
  });

  const signOut = useMutation({
    mutationFn: async () => {
      const controller = createAbortController('signOut');
      try {
        const { data } = await instance.post(
          '/auth/sign-out',
          {},
          {
            signal: controller.signal,
          }
        );
        return data;
      } catch (error) {
        if (error instanceof AxiosError && error.name === 'AbortError') {
          console.log('Sign out request was aborted');
          throw new Error('Sign out request was cancelled');
        }
        throw error;
      } finally {
        abortControllersRef.current.delete('signOut');
      }
    },
    onSuccess: () => {
      if (mountedRef.current) {
        localStorage.removeItem('session_id');
        dispatch(setUser(null));
      }
    },
  });

  const signUp = useMutation({
    mutationFn: async (credentials: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    }) => {
      const controller = createAbortController('signUp');
      try {
        const { data } = await instance.post('/auth/sign-up', credentials, {
          signal: controller.signal,
        });
        return data;
      } catch (error) {
        if (error instanceof AxiosError && error.name === 'AbortError') {
          console.log('Sign up request was aborted');
          throw new Error('Sign up request was cancelled');
        }
        throw error;
      } finally {
        abortControllersRef.current.delete('signUp');
      }
    },
  });

  const sendOtp = useMutation({
    mutationFn: async (email: string) => {
      const controller = createAbortController('sendOtp');
      try {
        const { data } = await instance.post(
          '/auth/verify-email/send-otp',
          {
            email,
          },
          {
            signal: controller.signal,
          }
        );
        return data;
      } catch (error) {
        if (error instanceof AxiosError && error.name === 'AbortError') {
          console.log('Send OTP request was aborted');
          throw new Error('Send OTP request was cancelled');
        }
        throw error;
      } finally {
        abortControllersRef.current.delete('sendOtp');
      }
    },
  });

  const verifyOtp = useMutation({
    mutationFn: async (data: { email: string; otp: string }) => {
      const controller = createAbortController('verifyOtp');
      try {
        const { data: response } = await instance.post('/auth/verify-email/verify', data, {
          signal: controller.signal,
        });
        if (mountedRef.current) {
          dispatch(setUser(response.data.user));
          localStorage.setItem('session_id', response.data.session_id);
        }
        return response;
      } catch (error) {
        if (error instanceof AxiosError && error.name === 'AbortError') {
          console.log('Verify OTP request was aborted');
          throw new Error('Verify OTP request was cancelled');
        }
        throw error;
      } finally {
        abortControllersRef.current.delete('verifyOtp');
      }
    },
  });

  const googleAuth = useCallback(() => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google/auth`;
  }, []);

  const handleAuthCallback = useCallback(
    async (params: URLSearchParams) => {
      const accessToken = params.get('access_token');
      const sessionId = params.get('session_id');

      if (accessToken && sessionId) {
        const controller = createAbortController('authCallback');
        try {
          const { data } = await instance.get('/auth/me', {
            withCredentials: true,
            signal: controller.signal,
          });

          if (data.status === 'success' && mountedRef.current) {
            dispatch(setUser(data.data));
            localStorage.setItem('session_id', sessionId);
            return true;
          }
        } catch (error) {
          if (error instanceof AxiosError && error.name === 'AbortError') {
            console.log('Auth callback request was aborted');
            return false;
          }
          console.error('Failed to fetch user after OAuth:', error);
        } finally {
          abortControllersRef.current.delete('authCallback');
        }
      }
      return false;
    },
    [dispatch, createAbortController]
  );

  const forgotPassword = useMutation({
    mutationFn: async (email: string) => {
      const controller = createAbortController('forgotPassword');
      try {
        const { data } = await instance.post(
          '/auth/forgot-password',
          { email },
          {
            signal: controller.signal,
          }
        );
        return data;
      } catch (error) {
        if (error instanceof AxiosError && error.name === 'AbortError') {
          console.log('Forgot password request was aborted');
          throw new Error('Forgot password request was cancelled');
        }
        throw error;
      } finally {
        abortControllersRef.current.delete('forgotPassword');
      }
    },
  });

  const verifyResetToken = useMutation({
    mutationFn: async (payload: { email: string; token: string }) => {
      const controller = createAbortController('verifyResetToken');
      try {
        const { data } = await instance.post('/auth/verify-reset-token', payload, {
          signal: controller.signal,
        });
        return data;
      } catch (error) {
        if (error instanceof AxiosError && error.name === 'AbortError') {
          console.log('Verify reset token request was aborted');
          throw new Error('Verify reset token request was cancelled');
        }
        throw error;
      } finally {
        abortControllersRef.current.delete('verifyResetToken');
      }
    },
  });

  const resetPassword = useMutation({
    mutationFn: async (data: {
      token: string;
      email: string;
      password: string;
      confirmPassword: string;
    }) => {
      const controller = createAbortController('resetPassword');
      try {
        const { data: response } = await instance.post('/auth/reset-password', data, {
          signal: controller.signal,
        });
        return response;
      } catch (error) {
        if (error instanceof AxiosError && error.name === 'AbortError') {
          console.log('Reset password request was aborted');
          throw new Error('Reset password request was cancelled');
        }
        throw error;
      } finally {
        abortControllersRef.current.delete('resetPassword');
      }
    },
  });

  return {
    signIn,
    signUp,
    signOut,
    sendOtp,
    verifyOtp,
    forgotPassword,
    verifyResetToken,
    resetPassword,
    refetchUser,
    googleAuth,
    handleAuthCallback,
  };
}
