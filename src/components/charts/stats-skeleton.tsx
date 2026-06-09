import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface StatsSkeletonProps {
  'data-testid'?: string;
}

export function StatsSkeleton({ 'data-testid': testId = 'stats-skeleton' }: StatsSkeletonProps) {
  return (
    <div
      className="mb-10 grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5"
      data-testid={testId}
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-5 rounded-lg border bg-card p-6"
        >
          <Skeleton className="size-12 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}
