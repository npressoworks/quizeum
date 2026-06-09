import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

interface PlaySkeletonProps {
  'data-testid'?: string;
}

export function PlaySkeleton({
  'data-testid': testId = 'quiz-play-skeleton',
}: PlaySkeletonProps) {
  return (
    <div className="mx-auto flex w-full max-w-[900px] flex-col gap-6 px-5 py-8" data-testid={testId}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-6 w-40" />
      </div>

      <div className="flex flex-col gap-2">
        <Skeleton className="h-2 w-full rounded-full" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-full" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
