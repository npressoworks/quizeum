import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

interface LeaderboardSkeletonProps {
  'data-testid'?: string;
}

export function LeaderboardSkeleton({ 'data-testid': testId = 'leaderboard-skeleton' }: LeaderboardSkeletonProps) {
  return (
    <Card className="w-full" data-testid={testId}>
      <CardContent className="flex flex-col gap-4 pt-6">
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 flex-1 rounded-lg" />
        </div>
        <div className="space-y-2">
          <div className="flex gap-2">
            {['10%', '30%', '20%', '20%', '20%'].map((w, i) => (
              <Skeleton key={i} className="h-4" style={{ width: w }} />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-2">
              {['10%', '30%', '20%', '20%', '20%'].map((w, j) => (
                <Skeleton key={j} className="h-8" style={{ width: w }} />
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
