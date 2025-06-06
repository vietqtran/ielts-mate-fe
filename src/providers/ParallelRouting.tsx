'use client';

import { useAppSelector } from '@/hooks';
import React from 'react';

export default function ParallelRouting({
  admin,
  user,
}: Readonly<{
  user: React.ReactNode;
  admin: React.ReactNode;
}>) {
  const { user: userInStore } = useAppSelector((state) => state.auth);
  const isAdmin = userInStore?.roles.includes('CREATOR') || userInStore?.roles.includes('ADMIN');

  if (isAdmin) {
    return admin;
  }
  return user;
}
