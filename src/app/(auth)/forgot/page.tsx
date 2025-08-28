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
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CustomLink from '@/components/ui/link';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { emailValidation } from '@/constants/validate';
import { useAuth } from '@/hooks';
import { usePageTitle } from '@/hooks/usePageTitle';
import { extractAxiosErrorData } from '@/utils/error';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: emailValidation,
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
  usePageTitle('Forgot Password');

  const { forgotPassword } = useAuth();
  const [errors, setErrors] = useState<{
    email?: string;
    general?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (window != undefined) {
      sessionStorage.setItem(CURRENT_PAGE_SESSION_STORAGE_KEY, PAGES.AUTH.FORGOT);
    }
  }, []);

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const watch = form.watch();
  useEffect(() => {
    setErrors({});
  }, [watch.email]);

  async function handleSubmit(values: ForgotPasswordFormValues) {
    if (isLoading) return;
    setIsLoading(true);
    setErrors({});

    try {
      const response = await forgotPassword(values.email);
      toast(response.message);
      setIsLoading(false);
    } catch (error) {
      const { message } = extractAxiosErrorData(error);
      setErrors({ general: message });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className='mx-auto max-w-md space-y-6 p-8' data-cy='forgot-page'>
      <div className='text-center'>
        <h1 className='text-2xl font-bold text-[#313957]'>Forgot Password</h1>
        <p className='mt-2 text-[#8897ad]'>
          Enter your email address and we&apos;ll send you a verification code to reset your
          password.
        </p>
      </div>
      <Form {...form}>
        <form
          className='space-y-6'
          onSubmit={form.handleSubmit(handleSubmit)}
          data-cy='forgot-form'
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

          {errors.general && (
            <div className='rounded-md bg-red-50 p-3' data-cy='general-error'>
              <p className='text-sm text-red-500'>{errors.general}</p>
            </div>
          )}

          <Button
            type='submit'
            className='w-full cursor-pointer rounded-md py-2.5 text-white'
            data-cy='submit-button'
          >
            {isLoading ? <LoadingSpinner /> : 'Send verification code'}
          </Button>

          <div className='text-center'>
            <CustomLink href='/sign-in' text='Back to sign in' data-cy='back-to-sign-in' />
          </div>
        </form>
      </Form>
    </div>
  );
}
