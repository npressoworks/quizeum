import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface BookmarksSkeletonProps {
  'data-testid'?: string;
}

export function BookmarksSkeleton({ 'data-testid': testId = 'bookmarks-skeleton' }: BookmarksSkeletonProps) {
  return (
    <div className="flex flex-col gap-6" data-testid={testId}>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="flex gap-2">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-20" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
