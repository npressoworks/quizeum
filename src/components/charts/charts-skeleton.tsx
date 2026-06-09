import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface ChartsSkeletonProps {
  'data-testid'?: string;
}

export function ChartsSkeleton({ 'data-testid': testId = 'charts-skeleton' }: ChartsSkeletonProps) {
  return (
    <div
      className="mb-10 grid grid-cols-1 gap-5 md:grid-cols-2"
      data-testid={testId}
    >
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-6">
          <Skeleton className="mb-4 h-5 w-40" />
          <Skeleton className="h-[180px] w-full" />
        </div>
      ))}
    </div>
  );
}
