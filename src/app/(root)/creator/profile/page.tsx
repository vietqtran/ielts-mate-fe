'use client';

import { PasswordForm } from '@/components/features/profile/PasswordForm';
import { ProfileForm } from '@/components/features/profile/ProfileForm';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

import { Skeleton } from '@/components/ui/skeleton';
import { useAppSelector } from '@/hooks';
import { XCircle } from 'lucide-react';
import { Suspense } from 'react';

import { usePageTitle } from '@/hooks/usePageTitle';

const ProfileContent = () => {
  usePageTitle('Creator Profile');

  const { user } = useAppSelector((state) => state.auth);
  try {
    return (
      <div className='container mx-auto p-6 space-y-6'>
        <div className='space-y-2'>
          <h1 className='text-3xl font-bold'>Profile Settings</h1>
          <p className='text-muted-foreground'>Manage your account settings and preferences.</p>
        </div>
        <div className='grid gap-8 md:grid-cols-2'>
          <ProfileForm user={user} />
          <PasswordForm />
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className='container mx-auto py-8'>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center space-y-2'>
              <XCircle className='h-12 w-12 text-red-500 mx-auto' />
              <h3 className='text-lg font-semibold'>Failed to load profile</h3>
              <p className='text-muted-foreground'>
                {error instanceof Error ? error.message : 'An unexpected error occurred'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
};

const ProfileSkeleton = () => {
  return (
    <div className='container mx-auto py-8 space-y-8'>
      <div className='space-y-2'>
        <Skeleton className='h-8 w-48' />
        <Skeleton className='h-4 w-96' />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className='h-6 w-32' />
          <Skeleton className='h-4 w-64' />
        </CardHeader>
        <CardContent className='space-y-4'>
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-full' />
        </CardContent>
      </Card>

      <div className='grid gap-8 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <Skeleton className='h-6 w-40' />
            <Skeleton className='h-4 w-56' />
          </CardHeader>
          <CardContent className='space-y-4'>
            <Skeleton className='h-10 w-full' />
            <Skeleton className='h-10 w-full' />
            <Skeleton className='h-10 w-full' />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className='h-6 w-36' />
            <Skeleton className='h-4 w-52' />
          </CardHeader>
          <CardContent className='space-y-4'>
            <Skeleton className='h-10 w-full' />
            <Skeleton className='h-10 w-full' />
            <Skeleton className='h-10 w-full' />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileContent />
    </Suspense>
  );
};

export default ProfilePage;
