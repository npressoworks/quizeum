import React from 'react';
import { SkeletonCard } from './skeleton-card';
import { discoveryGridClass } from '@/lib/discovery-layout';

interface GridSkeletonProps {
  'data-testid'?: string;
  count?: number;
}

export function GridSkeleton({
  'data-testid': testId = 'home-feed-skeleton',
  count = 6,
}: GridSkeletonProps) {
  return (
    <div className={discoveryGridClass} data-testid={testId}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
