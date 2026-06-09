import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

interface ReviewSkeletonProps {
  'data-testid'?: string;
}

export function ReviewSkeleton({ 'data-testid': testId = 'review-skeleton' }: ReviewSkeletonProps) {
  return (
    <div className="mx-auto flex max-w-[900px] flex-col gap-6 px-5 py-10" data-testid={testId}>
      <Skeleton className="h-8 w-64" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <Card>
        <CardContent className="grid grid-cols-2 gap-3 pt-6 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 p-4">
              <Skeleton className="size-10 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
      <Skeleton className="h-11 w-full rounded-lg" />
    </div>
  );
}
