'use client';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { CURRENT_PAGE_SESSION_STORAGE_KEY, PAGES } from '@/constants/pages';
import { emailValidation, passwordSignInValidation } from '@/constants/validate';
import { useAppDispatch, useAppSelector, useAuth } from '@/hooks';
import { setIsFirstSendOtp, setUnverifyEmail } from '@/store/slices/common-slice';
import { useEffect, useState } from 'react';

import GoogleSocialButton from '@/components/common/social/GoogleSocialButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CustomLink from '@/components/ui/link';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { ERROR_CODE } from '@/constants/error_code';
import { setSignInForm } from '@/store/slices/auth-form-slice';
import { extractAxiosErrorData } from '@/utils/error';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const signInSchema = z.object({
  email: emailValidation,
  password: passwordSignInValidation,
});

const COOKIE_SETUP_DELAY = 800;

export function SignInForm() {
  const router = useRouter();
  const { signIn } = useAuth();
  const dispatch = useAppDispatch();

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const { signInForm } = useAppSelector((state) => state.authForm);

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleBeforeUnload = () => {
    dispatch(setSignInForm(form.getValues()));
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentPage = sessionStorage.getItem(CURRENT_PAGE_SESSION_STORAGE_KEY);
      if (signInForm && currentPage === PAGES.AUTH.SIGN_IN) {
        form.setValue('email', signInForm.email);
        form.setValue('password', signInForm.password);
      } else {
        dispatch(setSignInForm(form.getValues()));
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const watch = form.watch();

  useEffect(() => {
    setErrors({});
  }, [watch.email, watch.password]);

  async function handleSubmit(values: z.infer<typeof signInSchema>) {
    if (isLoading) return;
    setIsLoading(true);
    setErrors({});
    try {
      const data = await signIn({
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
      const { message, error_code } = extractAxiosErrorData(error);
      if (error_code === ERROR_CODE.EMAIL_UNVERIFIED) {
        dispatch(setUnverifyEmail(values.email));
        dispatch(setIsFirstSendOtp(true));
        router.push('/otp/verify' + `?email=${encodeURIComponent(values.email)}`);
        return;
      }
      setErrors({ general: message });
      setTimeout(() => {
        const emailInput = document.getElementById('email') as HTMLInputElement | null;
        if (emailInput) {
          emailInput.focus();
        }
      }, 200);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        className='mt-8 space-y-6'
        onSubmit={form.handleSubmit(handleSubmit)}
        data-cy='sign-in-form'
      >
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
                    data-cy='email-input'
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
                    data-cy='password-input'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='flex justify-end mt-2'>
            <CustomLink href='/forgot' text='Forgot password?' data-cy='forgot-link' />
          </div>
        </div>

        {errors.general && (
          <div className='rounded-md bg-red-50 p-3' data-cy='general-error'>
            <p className='text-sm text-red-500'>{errors.general}</p>
          </div>
        )}

        <Button
          type='submit'
          className='w-full cursor-pointer rounded-md py-2.5 text-white'
          data-cy='sign-in-submit'
        >
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
        </div>
      </form>
    </Form>
  );
}
