import ParallelRouting from '@/providers/ParallelRouting';
import React from 'react';

const RootLayout = ({ admin, user }: { admin: React.ReactNode; user: React.ReactNode }) => {
  return <ParallelRouting admin={admin} user={user} />;
};

export default RootLayout;
