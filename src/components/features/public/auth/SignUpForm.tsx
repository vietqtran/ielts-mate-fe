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
import { useAppDispatch, useAppSelector, useAuth } from '@/hooks';
import { setIsFirstSendOtp, setUnverifyEmail } from '@/store/slices/common-slice';
import { useEffect, useState } from 'react';

import GoogleSocialButton from '@/components/common/social/GoogleSocialButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { signUpSchema } from '@/schemas/auth.schema';
import { setSignUpForm } from '@/store/slices/auth-form-slice';
import { extractAxiosErrorData } from '@/utils/error';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export function SignUpForm() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const { signUpForm } = useAppSelector((state) => state.authForm);

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleBeforeUnload = () => {
    dispatch(setSignUpForm(form.getValues()));
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentPage = sessionStorage.getItem(CURRENT_PAGE_SESSION_STORAGE_KEY);
      if (signUpForm && currentPage === PAGES.AUTH.SIGN_UP) {
        form.setValue('first_name', signUpForm.first_name);
        form.setValue('last_name', signUpForm.last_name);
        form.setValue('email', signUpForm.email);
        form.setValue('password', signUpForm.password);
        form.setValue('confirmPassword', signUpForm.confirmPassword);
      } else {
        dispatch(setSignUpForm(form.getValues()));
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  async function handleSubmit(values: z.infer<typeof signUpSchema>) {
    if (isLoading) return;
    setIsLoading(true);
    setErrors({});
    try {
      const data = await signUp({
        email: values.email,
        password: values.password,
        first_name: values.first_name,
        last_name: values.last_name,
      });

      if (data.status === 'success') {
        dispatch(setUnverifyEmail(values.email));
        dispatch(setIsFirstSendOtp(true));
        setTimeout(() => {
          router.push('/otp/verify' + `?email=${encodeURIComponent(values.email)}`);
        }, 1000);
      } else {
        setErrors({ general: data.message });
      }
    } catch (error) {
      const { message } = extractAxiosErrorData(error);
      setErrors({ general: message });
    } finally {
      setIsLoading(false);
    }
  }

  const watch = form.watch();

  useEffect(() => {
    setErrors({});
  }, [watch.email, watch.password, watch.first_name, watch.last_name, watch.confirmPassword]);

  return (
    <Form {...form}>
      <form
        className='mt-8 space-y-6'
        onSubmit={form.handleSubmit(handleSubmit)}
        data-cy='sign-up-form'
      >
        <div className='flex items-start gap-2'>
          <FormField
            control={form.control}
            name='first_name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Label htmlFor='first_name' className='block text-sm font-medium'>
                    First name
                  </Label>
                </FormLabel>
                <FormControl>
                  <Input
                    id='first_name'
                    autoFocus
                    type='text'
                    placeholder='John'
                    className={`w-full rounded-md border px-3 py-2`}
                    isError={!!form.formState.errors.first_name}
                    data-cy='first-name-input'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='last_name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Label htmlFor='last_name' className='block text-sm font-medium'>
                    Last name
                  </Label>
                </FormLabel>
                <FormControl>
                  <Input
                    id='last_name'
                    type='text'
                    placeholder='Doe'
                    className={`w-full rounded-md border px-3 py-2`}
                    isError={!!form.formState.errors.last_name}
                    data-cy='last-name-input'
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
                    data-cy='confirm-password-input'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {errors.general && (
          <div className='rounded-md bg-red-50 p-3' data-cy='general-error'>
            <p className='text-sm text-red-500'>{errors.general}</p>
          </div>
        )}

        <Button
          type='submit'
          className='w-full cursor-pointer rounded-md py-2.5 text-white'
          data-cy='sign-up-submit'
        >
          {isLoading ? <LoadingSpinner /> : 'Sign up'}
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
