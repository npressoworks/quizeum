import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

interface ConnectionsSkeletonProps {
  'data-testid'?: string;
}

export function ConnectionsSkeleton({
  'data-testid': testId = 'connections-skeleton',
}: ConnectionsSkeletonProps) {
  return (
    <div className="flex flex-col gap-4" data-testid={testId}>
      <Skeleton className="h-4 w-36" />
      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <Skeleton className="h-7 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-28" />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="size-12 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
