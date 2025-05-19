'use client';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CustomLink from '@/components/ui/link';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { emailValidation } from '@/constants/validate';
import { useAuth } from '@/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: emailValidation,
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const { forgotPassword } = useAuth();
  const [errors, setErrors] = useState<{
    email?: string;
    general?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  async function handleSubmit(values: ForgotPasswordFormValues) {
    setIsLoading(true);
    setErrors({});

    try {
      const response = await forgotPassword.mutateAsync(values.email);
      toast(response.message);
      setIsLoading(false);
    } catch (error) {
      if (error instanceof AxiosError) {
        const axiosError = error as AxiosError<{ message: string }>;
        setErrors({ general: axiosError.response?.data.message });
      } else {
        setErrors({ general: 'Failed to send verification code. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className='mx-auto max-w-md space-y-6 px-4 py-8'>
      <div className='text-center'>
        <h1 className='text-2xl font-bold text-[#313957]'>Forgot Password</h1>
        <p className='mt-2 text-[#8897ad]'>
          Enter your email address and we&apos;ll send you a verification code to reset your
          password.
        </p>
      </div>
      <Form {...form}>
        <form className='space-y-6' onSubmit={form.handleSubmit(handleSubmit)}>
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

          {errors.general && (
            <div className='rounded-md bg-red-50 p-3'>
              <p className='text-sm text-red-500'>{errors.general}</p>
            </div>
          )}

          <Button type='submit' className='w-full cursor-pointer rounded-md py-2.5 text-white'>
            {isLoading ? <LoadingSpinner /> : 'Send verification code'}
          </Button>

          <div className='text-center'>
            <CustomLink href='/sign-in' text='Back to sign in' />
          </div>
        </form>
      </Form>
    </div>
  );
}
