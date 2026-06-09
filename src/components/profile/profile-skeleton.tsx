import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

interface ProfileDetailSkeletonProps {
  'data-testid'?: string;
}

export function ProfileEditSkeleton() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6" data-testid="profile-edit-skeleton">
      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export function ProfileDetailSkeleton({
  'data-testid': testId = 'profile-skeleton',
}: ProfileDetailSkeletonProps) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6" data-testid={testId}>
      <Card>
        <CardContent className="flex gap-6 pt-6">
          <Skeleton className="size-24 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </CardContent>
      </Card>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
