'use client';

import { useAppSelector } from '@/hooks';
import React from 'react';

export default function ParallelRouting({
  admin,
  user,
  guest,
}: Readonly<{
  user: React.ReactNode;
  admin: React.ReactNode;
  guest: React.ReactNode;
}>) {
  const { user: userInStore } = useAppSelector((state) => state.auth);
  const isAdmin = userInStore?.roles.includes('CREATOR') || userInStore?.roles.includes('ADMIN');
  const isUser = userInStore?.roles.includes('USER');

  if (isAdmin) {
    return admin;
  }
  if (isUser) {
    return user;
  }
  // return user;
  return guest;
}
