import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface QuizListSkeletonProps {
  'data-testid'?: string;
}

export function QuizListSkeleton({ 'data-testid': testId = 'quiz-list-skeleton' }: QuizListSkeletonProps) {
  return (
    <div className="rounded-lg border bg-card p-6" data-testid={testId}>
      <Skeleton className="mb-4 h-5 w-48" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="border-b py-4 last:border-b-0">
          <Skeleton className="mb-2 h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}
