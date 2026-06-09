'use client';

import React from 'react';
import type { ListsVisibility } from '@/hooks/useListsSearch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ListsVisibilityTabsProps {
  activeTab: ListsVisibility;
  onTabChange: (tab: ListsVisibility) => void;
}

const TABS: { id: ListsVisibility; label: string; testId: string }[] = [
  { id: 'public', label: '公開リスト', testId: 'lists-tab-public' },
  { id: 'private', label: '非公開リスト', testId: 'lists-tab-private' },
];

export function ListsVisibilityTabs({ activeTab, onTabChange }: ListsVisibilityTabsProps) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => onTabChange(value as ListsVisibility)}
      data-testid="lists-visibility-tabs"
    >
      <TabsList className="mb-5 h-auto w-full justify-start gap-2 bg-transparent p-0">
        {TABS.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            data-testid={tab.testId}
            className="rounded-lg border border-border px-5 py-2.5 data-active:border-primary data-active:bg-primary/10"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
