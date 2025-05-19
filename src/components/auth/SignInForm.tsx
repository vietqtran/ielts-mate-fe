'use client';

import { emailValidation, passwordSignInValidation } from '@/constants/validate';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ERROR_CODE } from '@/constants/error_code';
import { useAuth } from '@/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import GithubSocialButton from '../common/social/GithubSocialButton';
import GoogleSocialButton from '../common/social/GoogleSocialButton';
import CustomLink from '../ui/link';
import LoadingSpinner from '../ui/loading-spinner';

const signInSchema = z.object({
  email: emailValidation,
  password: passwordSignInValidation,
});

const COOKIE_SETUP_DELAY = 800;

export function SignInForm() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function handleSubmit(values: z.infer<typeof signInSchema>) {
    if (isLoading) return;
    setIsLoading(true);
    setErrors({});
    try {
      const data = await signIn.mutateAsync({
        email: values.email,
        password: values.password,
      });
      if (data.status === 'success') {
        await new Promise((resolve) => setTimeout(resolve, COOKIE_SETUP_DELAY));
        router.replace('/');
      } else {
        setErrors({ general: data.message });
        setIsLoading(false);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        const axiosError = error as AxiosError<{ message: string; error_code: string }>;
        if (axiosError.response?.data.error_code === ERROR_CODE.EMAIL_UNVERIFIED) {
          localStorage.setItem('unverify_email', values.email);
          localStorage.setItem('is_first_send_otp', 'true');
          router.push('/otp/verify' + `?email=${values.email}`);
          return;
        }
        setErrors({ general: axiosError.response?.data.message });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form className='mt-8 space-y-6' onSubmit={form.handleSubmit(handleSubmit)}>
        <div className='space-y-2'>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Label htmlFor='email' className='block text-sm font-medium'>
                    Email
                  </Label>
                </FormLabel>
                <FormControl>
                  <Input
                    id='email'
                    type='text'
                    autoFocus
                    placeholder='example@email.com'
                    className={`w-full rounded-md border px-3 py-2`}
                    isError={!!form.formState.errors.email}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='flex justify-end mt-2'>
            <CustomLink href='/forgot' text='Forgot password?' />
          </div>
        </div>

        {errors.general && (
          <div className='rounded-md bg-red-50 p-3'>
            <p className='text-sm text-red-500'>{errors.general}</p>
          </div>
        )}

        <Button type='submit' className='w-full cursor-pointer rounded-md py-2.5 text-white'>
          {isLoading ? <LoadingSpinner /> : 'Sign in'}
        </Button>

        <div className='relative'>
          <div className='absolute inset-0 flex items-center'>
            <div className='w-full border-t border-[#d4d7e3]'></div>
          </div>
          <div className='relative flex justify-center text-sm'>
            <span className='bg-white px-4 text-[#8897ad]'>Or</span>
          </div>
        </div>

        <div className='space-y-3'>
          <GoogleSocialButton />
          <GithubSocialButton />
        </div>
      </form>
    </Form>
  );
}
