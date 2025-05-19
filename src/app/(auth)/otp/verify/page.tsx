'use client';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { otpValidation } from '@/constants/validate';
import { useAuth } from '@/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const otpVerificationSchema = z.object({
  otp: otpValidation,
});

export default function OtpVerificationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const { sendOtp, verifyOtp } = useAuth();

  const [errors, setErrors] = useState<{
    otp?: string;
    general?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [resendDisabled, setResendDisabled] = useState(true);

  const form = useForm<z.infer<typeof otpVerificationSchema>>({
    resolver: zodResolver(otpVerificationSchema),
    defaultValues: {
      otp: '',
    },
  });

  const handleSendOtp = async () => {
    try {
      await sendOtp.mutateAsync(email);
    } catch (error) {
      if (error instanceof AxiosError) {
        const axiosError = error as AxiosError<{
          message: string;
        }>;
        toast.error(axiosError.response?.data.message);
        return;
      }
      toast.error('An unexpected error occurred. Please try again.');
    }
  };

  useEffect(() => {
    const unVerifyEmail = localStorage.getItem('unverify_email');
    const isFirstSendOtp = localStorage.getItem('is_first_send_otp');
    if (!unVerifyEmail) {
      router.replace('/sign-in');
      return;
    } else {
      if (isFirstSendOtp) {
        handleSendOtp();
        localStorage.removeItem('is_first_send_otp');
      }
    }

    return () => {
      localStorage.removeItem('unverify_email');
      localStorage.removeItem('is_first_send_otp');
    };
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      setResendDisabled(false);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  async function handleSubmit(values: z.infer<typeof otpVerificationSchema>) {
    if (isLoading) return;
    setIsLoading(true);
    setErrors({});

    try {
      const verifyResponse = await verifyOtp.mutateAsync({
        email: email,
        otp: values.otp,
      });
      if (verifyResponse.status === 'success') {
        await new Promise((resolve) => setTimeout(resolve, 800));
        router.replace('/');
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        const axiosError = error as AxiosError<{
          message: string;
          error_code: string;
        }>;
        setErrors({ general: axiosError.response?.data.message });
        return;
      }
      setErrors({
        general: 'Invalid verification code. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleResendOTP = async () => {
    setResendDisabled(true);
    setTimeLeft(60);
    await handleSendOtp();
  };

  return (
    <div className='mx-auto max-w-md space-y-6 px-4 py-8'>
      <div className='text-center'>
        <h1 className='text-2xl font-bold text-[#313957]'>Verify Your Identity</h1>
        <p className='mt-2 text-[#8897ad]'>
          We&apos;ve sent a 6-digit verification code to{' '}
          <span className='font-medium text-[#313957]'>{email}</span>
        </p>
      </div>
      <Form {...form}>
        <form className='space-y-6' onSubmit={form.handleSubmit(handleSubmit)}>
          <div className='space-y-2'>
            <FormField
              control={form.control}
              name='otp'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Label htmlFor='otp' className='block text-sm font-medium'>
                      Verification code
                    </Label>
                  </FormLabel>
                  <FormControl>
                    <Input
                      autoFocus
                      id='otp'
                      type='text'
                      maxLength={6}
                      placeholder='Enter 6-digit code'
                      className={`w-full rounded-md border px-3 py-2 text-center tracking-widest`}
                      isError={!!form.formState.errors.otp}
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
            {isLoading ? <LoadingSpinner /> : 'Verify'}
          </Button>

          <div className='text-center space-y-2'>
            <p className='text-sm text-[#8897ad]'>Didn&apos;t receive the code?</p>
            <button
              type='button'
              disabled={resendDisabled}
              className={`text-sm cursor-pointer ${
                resendDisabled ? 'text-[#8897ad]' : 'text-[#1e4ae9] hover:underline'
              }`}
              onClick={handleResendOTP}
            >
              {resendDisabled ? `Resend code in ${timeLeft}s` : 'Resend code'}
            </button>
          </div>
        </form>
      </Form>
    </div>
  );
}
