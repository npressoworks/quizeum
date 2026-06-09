import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface ListEditorSkeletonProps {
  'data-testid'?: string;
}

export function ListEditorSkeleton({ 'data-testid': testId = 'list-editor-skeleton' }: ListEditorSkeletonProps) {
  return (
    <div className="mx-auto max-w-[1200px] px-5 py-10" data-testid={testId}>
      <div className="mb-5 flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <Skeleton className="h-7 w-[240px]" />
      </div>
      <Skeleton className="mb-6 h-3.5 w-[360px]" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="min-h-[280px] rounded-lg" />
        <Skeleton className="min-h-[280px] rounded-lg" />
      </div>
    </div>
  );
}
