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
import { useAppDispatch, useAppSelector, useAuth } from '@/hooks';
import { setIsFirstSendOtp, setUnverifyEmail } from '@/store/slices/common-slice';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CustomLink from '@/components/ui/link';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { otpValidation } from '@/constants/validate';
import { extractAxiosErrorData } from '@/utils/error';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const otpVerificationSchema = z.object({
  otp: otpValidation,
});

export default function OtpVerificationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = (searchParams.get('email') ?? '').replace(/ /g, '+');
  const { sendOtp, verifyOtp } = useAuth();
  const { isFirstSendOtp, unverifyEmail } = useAppSelector((state) => state.common);
  const dispatch = useAppDispatch();

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
      await sendOtp(unverifyEmail ?? email);
    } catch (error) {
      const { message } = extractAxiosErrorData(error, 'Failed to send OTP. Please try again.');
      toast.error(message);
    }
  };

  useEffect(() => {
    if (window != undefined) {
      sessionStorage.setItem(CURRENT_PAGE_SESSION_STORAGE_KEY, PAGES.AUTH.OTP.VERIFY);
    }
  }, []);

  useEffect(() => {
    if (!unverifyEmail || unverifyEmail !== email) {
      router.replace('/sign-in');
      return;
    } else if (isFirstSendOtp) {
      handleSendOtp();
      if (isFirstSendOtp) {
        dispatch(setIsFirstSendOtp(false));
      }
    }

    return () => {
      if (isFirstSendOtp) {
        dispatch(setIsFirstSendOtp(false));
      }
      if (unverifyEmail) {
        dispatch(setUnverifyEmail(null));
      }
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

  const watch = form.watch();

  useEffect(() => {
    setErrors({});
  }, [watch.otp]);

  async function handleSubmit(values: z.infer<typeof otpVerificationSchema>) {
    if (isLoading) return;
    setIsLoading(true);
    setErrors({});

    try {
      const verifyResponse = await verifyOtp({
        email: email,
        otp: values.otp,
      });
      if (verifyResponse.status === 'success') {
        await new Promise((resolve) => setTimeout(resolve, 800));
        router.replace('/');
      }
    } catch (error) {
      console.log('OTP verification error:', error);
      const { message } = extractAxiosErrorData(
        error,
        'Invalid verification code. Please try again.'
      );
      setErrors({ general: message });
      return;
    } finally {
      setIsLoading(false);
    }
  }

  const handleResendOTP = async () => {
    setErrors({});
    setResendDisabled(true);
    setTimeLeft(60);
    await handleSendOtp();
  };

  return (
    <div className='mx-auto max-w-md space-y-6 p-8'>
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
          <div className='text-center'>
            <CustomLink href='/sign-in' text='Back to sign in' />
          </div>
        </form>
      </Form>
    </div>
  );
}
