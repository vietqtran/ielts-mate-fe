import ParallelRouting from '@/providers/ParallelRouting';
import React from 'react';

const RootLayout = ({
  admin,
  user,
  guest,
}: { admin: React.ReactNode; user: React.ReactNode; guest: React.ReactNode }) => {
  return <ParallelRouting admin={admin} user={user} guest={guest} />;
};

export default RootLayout;
