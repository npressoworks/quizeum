import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

interface ResultSkeletonProps {
  'data-testid'?: string;
}

export function ResultSkeleton({ 'data-testid': testId = 'quiz-result-skeleton' }: ResultSkeletonProps) {
  return (
    <Card className="mx-auto w-full max-w-[800px]" data-testid={testId}>
      <CardContent className="flex flex-col items-center gap-6 pt-8">
        <Skeleton className="size-40 rounded-full" />
        <Skeleton className="h-8 w-48" />
        <div className="flex items-center gap-3">
          <Skeleton className="size-12 rounded-full" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="flex gap-8">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-11 w-full max-w-xs rounded-lg" />
        <div className="w-full space-y-3">
          <Skeleton className="h-6 w-40" />
          <div className="flex gap-3">
            <Skeleton className="h-10 flex-1 rounded-lg" />
            <Skeleton className="h-10 flex-1 rounded-lg" />
          </div>
        </div>
        <div className="w-full space-y-4">
          <Skeleton className="h-6 w-32" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2 rounded-lg border border-border p-4">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
