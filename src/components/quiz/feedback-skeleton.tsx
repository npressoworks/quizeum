import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface FeedbackSkeletonProps {
  'data-testid'?: string;
}

export function FeedbackSkeleton({ 'data-testid': testId = 'feedback-list-skeleton' }: FeedbackSkeletonProps) {
  return (
    <div className="rounded-lg border bg-card p-6" data-testid={testId}>
      <Skeleton className="mb-4 h-5 w-56" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="mb-4 rounded-md border p-4 last:mb-0">
          <Skeleton className="mb-2 h-3 w-20" />
          <Skeleton className="mb-2 h-4 w-full" />
          <Skeleton className="h-4 w-[70%]" />
        </div>
      ))}
    </div>
  );
}
