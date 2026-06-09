import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface EditorFormSkeletonProps {
  'data-testid'?: string;
}

export function EditorFormSkeleton({ 'data-testid': testId = 'quiz-editor-skeleton' }: EditorFormSkeletonProps) {
  return (
    <div className="mx-auto max-w-[1000px] px-5 pb-[100px] pt-10" data-testid={testId}>
      <Skeleton className="mb-3 h-9 w-[280px]" />
      <Skeleton className="mb-8 h-4 w-[400px]" />
      <div className="mb-6 rounded-xl border border-border bg-card p-8">
        <Skeleton className="mb-4 h-10 w-full" />
        <Skeleton className="mb-4 h-[120px] w-full" />
        <Skeleton className="mb-4 h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="rounded-xl border border-border bg-card p-8">
        <Skeleton className="h-[120px] w-full" />
      </div>
    </div>
  );
}
