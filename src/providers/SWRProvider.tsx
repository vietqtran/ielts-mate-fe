'use client';

import React from 'react';
import { SWRConfig } from 'swr';

type Props = {
  children: React.ReactNode;
};

const SWRProvider = ({ children }: Props) => {
  return (
    <SWRConfig
      value={{
        dedupingInterval: 2000,
        keepPreviousData: true,
        shouldRetryOnError: false,
        onError: () => {
          // swallow by default; per-hook UIs can decide to show friendly messages
        },
      }}
    >
      {children}
    </SWRConfig>
  );
};

export default SWRProvider;
