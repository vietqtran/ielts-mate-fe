import React from 'react';

export default function ParallelRouting({
  admin,
  user,
}: { admin: React.ReactNode; user: React.ReactNode }) {
  const role: string = 'user';
  return role === 'admin' ? admin : user;
}
