'use client';

import { useAppSelector } from '@/hooks';
import React from 'react';

export default function Layout({
  children,
  admin,
  user,
}: Readonly<{
  children: React.ReactNode;
  user: React.ReactNode;
  admin: React.ReactNode;
}>) {
  const { user: userInStore } = useAppSelector((state) => state.auth);

  const isAdmin = userInStore?.roles.includes('CREATOR') || userInStore?.roles.includes('ADMIN');

  if (isAdmin) {
    return (
      <>
        {children}
        {admin}
      </>
    );
  } else {
    return (
      <>
        {children}
        {user}
      </>
    );
  }
}
