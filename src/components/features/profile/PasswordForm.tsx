'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Lock } from 'lucide-react';
import { useTransition } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ERROR_CODE } from '@/constants/error_code';
import { useProfile } from '@/hooks/apis/auth/useProfile';
import { updatePasswordSchema } from '@/schemas/profile.schema';
import { extractAxiosErrorData } from '@/utils/error';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { z } from 'zod';

export function PasswordForm() {
  const [isPending, startTransition] = useTransition();
  const { updatePassword } = useProfile();

  const form = useForm<z.infer<typeof updatePasswordSchema>>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      confirmNewPassword: '',
      newPassword: '',
      oldPassword: '',
    },
  });

  const handleSubmit = async (values: z.infer<typeof updatePasswordSchema>) => {
    startTransition(async () => {
      try {
        const result = await updatePassword(values);
        if (result) {
          toast.success('Update successfull');
          form.reset();
        } else {
          toast.error('Update failed');
        }
      } catch (err) {
        const { error_code } = extractAxiosErrorData(err);
        if (error_code === ERROR_CODE.WRONG_OLD_PASSWORD) {
          toast.error('Old password is wrong');
        }
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Lock className='h-5 w-5' />
          Change Password
        </CardTitle>
        <CardDescription>Update your password to keep your account secure.</CardDescription>
      </CardHeader>
      <CardContent>
        <FormProvider {...form}>
          <form id='password-form' onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='oldPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Label htmlFor='oldPassword' className='block text-sm font-medium'>
                      Old password
                    </Label>
                  </FormLabel>
                  <FormControl>
                    <Input
                      id='oldPassword'
                      type='password'
                      placeholder='••••••••'
                      className={`w-full rounded-md border px-3 py-2`}
                      isError={!!form.formState.errors.oldPassword}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='newPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Label htmlFor='newPassword' className='block text-sm font-medium'>
                      New password
                    </Label>
                  </FormLabel>
                  <FormControl>
                    <Input
                      id='newPassword'
                      type='password'
                      placeholder='••••••••'
                      className={`w-full rounded-md border px-3 py-2`}
                      isError={!!form.formState.errors.newPassword}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='confirmNewPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Label htmlFor='confirmNewPassword' className='block text-sm font-medium'>
                      Confirm new password
                    </Label>
                  </FormLabel>
                  <FormControl>
                    <Input
                      id='confirmNewPassword'
                      type='password'
                      placeholder='••••••••'
                      className={`w-full rounded-md border px-3 py-2`}
                      isError={!!form.formState.errors.confirmNewPassword}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type='submit' disabled={isPending}>
              {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Change Password
            </Button>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
