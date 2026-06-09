'use client';

import React from 'react';
import type { QuizList } from '@/types';
import { ListDiscoveryCard } from './list-discovery-card';
import { Button } from '@/components/ui/button';
import { discoveryGridClass } from '@/lib/discovery-layout';

interface ListsGridProps {
  lists: QuizList[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function ListsGrid({ lists, loading, error, onRetry }: ListsGridProps) {
  if (loading) {
    return <div className="py-12 text-center text-muted-foreground">読み込み中...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center text-muted-foreground">
        <p>{error}</p>
        <Button type="button" variant="outline" onClick={onRetry}>
          再試行
        </Button>
      </div>
    );
  }

  if (lists.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground" data-testid="lists-empty-state">
        <p>条件に一致するリストが見つかりませんでした。</p>
      </div>
    );
  }

  return (
    <div className={discoveryGridClass}>
      {lists.map((list) => (
        <ListDiscoveryCard key={list.id} list={list} />
      ))}
    </div>
  );
}
