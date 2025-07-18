'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, User } from 'lucide-react';
import { useEffect, useTransition } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks';
import { useProfile } from '@/hooks/apis/auth/useProfile';
import { updateProfileDataSchema } from '@/schemas/profile.schema';
import { User as UserType } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { z } from 'zod';

interface ProfileFormProps {
  user: UserType | null;
}

export function ProfileForm({ user }: Readonly<ProfileFormProps>) {
  const [isPending, startTransition] = useTransition();
  const { updateProfile } = useProfile();
  const { refetchUser } = useAuth();

  const form = useForm<z.infer<typeof updateProfileDataSchema>>({
    resolver: zodResolver(updateProfileDataSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
    },
  });

  useEffect(() => {
    form.setValue('first_name', user?.firstName ?? '');
    form.setValue('last_name', user?.lastName ?? '');
  }, []);

  const handleSubmit = async (values: z.infer<typeof updateProfileDataSchema>) => {
    startTransition(async () => {
      const result = await updateProfile(values);
      if (result) {
        toast.success('Update successfull');
        await refetchUser();
      } else {
        toast.error('Update failed');
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <User className='h-5 w-5' />
          Profile Information
        </CardTitle>
        <CardDescription>Update your personal information here.</CardDescription>
      </CardHeader>
      <CardContent>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
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
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input id='email' value={user?.email} disabled className='bg-muted' />
              <p className='text-sm text-muted-foreground'>
                Email cannot be changed from this page.
              </p>
            </div>

            <Button type='submit' disabled={isPending}>
              {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Update Profile
            </Button>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
