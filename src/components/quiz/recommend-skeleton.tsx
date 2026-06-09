import React from 'react';
import { SkeletonCard } from '@/components/ui/skeleton-card';

interface RecommendSkeletonProps {
  'data-testid'?: string;
}

export function RecommendSkeleton({ 'data-testid': testId = 'recommend-skeleton' }: RecommendSkeletonProps) {
  return (
    <div
      className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5"
      data-testid={testId}
    >
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
