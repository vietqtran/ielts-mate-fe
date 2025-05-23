'use client';

import instance from '@/lib/axios';
import { setUser } from '@/store/slices/auth-slice';
import { AxiosError } from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppDispatch } from './useStore';

export function useAuth() {
  const dispatch = useAppDispatch();
  const mountedRef = useRef(true);
  const abortControllersRef = useRef(new Map());
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Record<string, Error | null>>({});

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

  const setLoading = useCallback((key: string, value: boolean) => {
    if (mountedRef.current) {
      setIsLoading((prev) => ({ ...prev, [key]: value }));
    }
  }, []);

  const setErrorState = useCallback((key: string, value: Error | null) => {
    if (mountedRef.current) {
      setError((prev) => ({ ...prev, [key]: value }));
    }
  }, []);

  const refetchUser = useCallback(async () => {
    if (!mountedRef.current) return null;

    setLoading('fetchUser', true);
    setErrorState('fetchUser', null);

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
      if (mountedRef.current) {
        setErrorState('fetchUser', error as Error);
        throw error;
      }
      return null;
    } finally {
      setLoading('fetchUser', false);
      abortControllersRef.current.delete('fetchUser');
    }
  }, [dispatch, createAbortController, setLoading, setErrorState]);

  const signIn = useCallback(
    async (credentials: { email: string; password: string }) => {
      setLoading('signIn', true);
      setErrorState('signIn', null);

      const controller = createAbortController('signIn');
      try {
        const { data } = await instance.post('/auth/sign-in', credentials, {
          signal: controller.signal,
        });
        if (mountedRef.current) {
          dispatch(setUser(data.data.user));
        }
        return data;
      } catch (error) {
        if (error instanceof AxiosError && error.name === 'AbortError') {
          console.log('Sign in request was aborted');
          throw new Error('Sign in request was cancelled');
        }
        setErrorState('signIn', error as Error);
        throw error;
      } finally {
        setLoading('signIn', false);
        abortControllersRef.current.delete('signIn');
      }
    },
    [dispatch, createAbortController, setLoading, setErrorState]
  );

  const signOut = useCallback(async () => {
    setLoading('signOut', true);
    setErrorState('signOut', null);

    const controller = createAbortController('signOut');
    try {
      const { data } = await instance.post(
        '/auth/sign-out',
        {},
        {
          signal: controller.signal,
        }
      );
      if (mountedRef.current) {
        dispatch(setUser(null));
      }
      return data;
    } catch (error) {
      if (error instanceof AxiosError && error.name === 'AbortError') {
        console.log('Sign out request was aborted');
        throw new Error('Sign out request was cancelled');
      }
      setErrorState('signOut', error as Error);
      throw error;
    } finally {
      setLoading('signOut', false);
      abortControllersRef.current.delete('signOut');
    }
  }, [dispatch, createAbortController, setLoading, setErrorState]);

  const signUp = useCallback(
    async (credentials: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    }) => {
      setLoading('signUp', true);
      setErrorState('signUp', null);

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
        setErrorState('signUp', error as Error);
        throw error;
      } finally {
        setLoading('signUp', false);
        abortControllersRef.current.delete('signUp');
      }
    },
    [createAbortController, setLoading, setErrorState]
  );

  const sendOtp = useCallback(
    async (email: string) => {
      setLoading('sendOtp', true);
      setErrorState('sendOtp', null);

      const controller = createAbortController('sendOtp');
      try {
        const { data } = await instance.post(
          '/auth/verify-email/send-otp',
          { email },
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
        setErrorState('sendOtp', error as Error);
        throw error;
      } finally {
        setLoading('sendOtp', false);
        abortControllersRef.current.delete('sendOtp');
      }
    },
    [createAbortController, setLoading, setErrorState]
  );

  const verifyOtp = useCallback(
    async (data: { email: string; otp: string }) => {
      setLoading('verifyOtp', true);
      setErrorState('verifyOtp', null);

      const controller = createAbortController('verifyOtp');
      try {
        const { data: response } = await instance.post('/auth/verify-email/verify', data, {
          signal: controller.signal,
        });
        if (mountedRef.current) {
          dispatch(setUser(response.data.user));
        }
        return response;
      } catch (error) {
        if (error instanceof AxiosError && error.name === 'AbortError') {
          console.log('Verify OTP request was aborted');
          throw new Error('Verify OTP request was cancelled');
        }
        setErrorState('verifyOtp', error as Error);
        throw error;
      } finally {
        setLoading('verifyOtp', false);
        abortControllersRef.current.delete('verifyOtp');
      }
    },
    [dispatch, createAbortController, setLoading, setErrorState]
  );

  const googleAuth = useCallback(() => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google/auth`;
  }, []);

  const handleAuthCallback = useCallback(
    async (params: URLSearchParams) => {
      const accessToken = params.get('access_token');

      if (accessToken) {
        setLoading('authCallback', true);
        setErrorState('authCallback', null);

        const controller = createAbortController('authCallback');
        try {
          const { data } = await instance.get('/auth/me', {
            withCredentials: true,
            signal: controller.signal,
          });

          if (data.status === 'success' && mountedRef.current) {
            dispatch(setUser(data.data));
            return true;
          }
        } catch (error) {
          if (error instanceof AxiosError && error.name === 'AbortError') {
            console.log('Auth callback request was aborted');
            return false;
          }
          console.error('Failed to fetch user after OAuth:', error);
          setErrorState('authCallback', error as Error);
        } finally {
          setLoading('authCallback', false);
          abortControllersRef.current.delete('authCallback');
        }
      }
      return false;
    },
    [dispatch, createAbortController, setLoading, setErrorState]
  );

  const forgotPassword = useCallback(
    async (email: string) => {
      setLoading('forgotPassword', true);
      setErrorState('forgotPassword', null);

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
        setErrorState('forgotPassword', error as Error);
        throw error;
      } finally {
        setLoading('forgotPassword', false);
        abortControllersRef.current.delete('forgotPassword');
      }
    },
    [createAbortController, setLoading, setErrorState]
  );

  const verifyResetToken = useCallback(
    async (payload: { email: string; token: string }) => {
      setLoading('verifyResetToken', true);
      setErrorState('verifyResetToken', null);

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
        setErrorState('verifyResetToken', error as Error);
        throw error;
      } finally {
        setLoading('verifyResetToken', false);
        abortControllersRef.current.delete('verifyResetToken');
      }
    },
    [createAbortController, setLoading, setErrorState]
  );

  const resetPassword = useCallback(
    async (data: {
      token: string;
      email: string;
      password: string;
      confirmPassword: string;
    }) => {
      setLoading('resetPassword', true);
      setErrorState('resetPassword', null);

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
        setErrorState('resetPassword', error as Error);
        throw error;
      } finally {
        setLoading('resetPassword', false);
        abortControllersRef.current.delete('resetPassword');
      }
    },
    [createAbortController, setLoading, setErrorState]
  );

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
    isLoading,
    error,
  };
}
