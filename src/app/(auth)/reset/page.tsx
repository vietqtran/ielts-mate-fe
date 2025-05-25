'use client';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { CURRENT_PAGE_SESSION_STORAGE_KEY, PAGES } from '@/constants/pages';
import { confirmPasswordValidation, passwordValidation } from '@/constants/validate';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useAuth } from '@/hooks';
import { extractAxiosErrorData } from '@/utils/error';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const resetPasswordSchema = z
  .object({
    password: passwordValidation,
    confirmPassword: confirmPasswordValidation,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordForm() {
  const router = useRouter();
  const { resetPassword, verifyResetToken } = useAuth();
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);

  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (window != undefined) {
      sessionStorage.setItem(CURRENT_PAGE_SESSION_STORAGE_KEY, PAGES.AUTH.RESET);
    }
  }, []);

  useEffect(() => {
    const checkToken = async () => {
      const token = (searchParams.get('token') ?? '').replace(/ /g, '+');
      const email = (searchParams.get('email') ?? '').replace(/ /g, '+');
      if (!token || !email) {
        router.replace('/sign-in');
      } else {
        try {
          await verifyResetToken({ otp: token, email });
        } catch (error) {
          const { message } = extractAxiosErrorData(error, 'Failed to send OTP. Please try again.');
          toast.error(message);
          router.replace('/sign-in');
          return;
        } finally {
          setIsVerifying(false);
        }
      }
    };
    checkToken();
  }, []);

  async function handleSubmit(values: ResetPasswordFormValues) {
    setIsLoading(true);
    setErrors({});
    const token = (searchParams.get('token') ?? '').replace(/ /g, '+');
    const email = (searchParams.get('email') ?? '').replace(/ /g, '+');
    if (!token || !email) {
      router.replace('/sign-in');
    }
    try {
      const response = await resetPassword({
        token,
        email,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });
      if (response.status === 'success') {
        toast.success(response.message);
        router.replace('/sign-in');
      }
    } catch (error) {
      const { message } = extractAxiosErrorData(error);
      setErrors({ general: message });
    } finally {
      setIsLoading(false);
    }
  }

  return isVerifying ? (
    <div className='w-screen h-screen flex justify-center items-center'>
      <LoadingSpinner color='black' />
    </div>
  ) : (
    <div className='mx-auto max-w-md space-y-6 px-4 py-8'>
      <div className='text-center'>
        <h1 className='text-2xl font-bold text-[#313957]'>Reset Your Password</h1>
        <p className='mt-2 text-[#8897ad]'>Create a new secure password for your account</p>
      </div>
      <Form {...form}>
        <form className='space-y-6' onSubmit={form.handleSubmit(handleSubmit)}>
          <div className='space-y-2'>
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Label htmlFor='password' className='block text-sm font-medium'>
                      Password
                    </Label>
                  </FormLabel>
                  <FormControl>
                    <Input
                      id='password'
                      type='password'
                      placeholder='••••••••'
                      className={`w-full rounded-md border px-3 py-2`}
                      isError={!!form.formState.errors.password}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Password must be at least 8 characters with one uppercase letter and one number.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className='space-y-2'>
            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Label htmlFor='confirmPassword' className='block text-sm font-medium'>
                      Confirm Password
                    </Label>
                  </FormLabel>
                  <FormControl>
                    <Input
                      id='confirmPassword'
                      type='password'
                      placeholder='••••••••'
                      className={`w-full rounded-md border px-3 py-2`}
                      isError={!!form.formState.errors.confirmPassword}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {errors.general && (
            <div className='rounded-md bg-red-50 p-3'>
              <p className='text-sm text-red-500'>{errors.general}</p>
            </div>
          )}

          <Button type='submit' className='w-full cursor-pointer rounded-md py-2.5 text-white'>
            {isLoading ? <LoadingSpinner /> : 'Reset password'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
