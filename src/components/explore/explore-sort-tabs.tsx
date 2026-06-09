'use client';

import React from 'react';
import type { QuizListSort } from '@/services/quiz';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface ExploreSortTabsProps {
  activeSort: QuizListSort;
  onSortChange: (sort: QuizListSort) => void;
}

const TABS: { id: QuizListSort; label: string }[] = [
  { id: 'latest', label: '新着' },
  { id: 'popular', label: '人気' },
  { id: 'trending', label: 'トレンド' },
];

export function ExploreSortTabs({ activeSort, onSortChange }: ExploreSortTabsProps) {
  return (
    <Tabs
      value={activeSort}
      onValueChange={(value) => onSortChange(value as QuizListSort)}
      data-testid="explore-sort-tabs"
    >
      <TabsList variant="line" className="h-auto w-full justify-start gap-6 rounded-none border-b bg-transparent p-0">
        {TABS.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            data-testid={`explore-sort-${tab.id}`}
            className="rounded-none px-2 py-3 data-active:bg-transparent"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
