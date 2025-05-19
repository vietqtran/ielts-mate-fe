'use client';

import { HydrationBoundary, type HydrationBoundaryProps } from '@tanstack/react-query';

export function Hydrate(props: HydrationBoundaryProps) {
  return <HydrationBoundary {...props} />;
}
