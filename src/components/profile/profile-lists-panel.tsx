'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import type { QuizList } from '@/types';
import { resolveListType } from '@/types';
import { ProfileListCard } from '@/components/profile/profile-list-card';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ProfileListFilter = 'all' | 'quiz' | 'question';

export interface ProfileListsPanelProps {
  lists: QuizList[];
  isMyProfile: boolean;
}

function filterLists(lists: QuizList[], filter: ProfileListFilter): QuizList[] {
  if (filter === 'all') return lists;
  return lists.filter((list) => resolveListType(list) === filter);
}

export function ProfileListsPanel({ lists, isMyProfile }: ProfileListsPanelProps) {
  const [filter, setFilter] = useState<ProfileListFilter>('all');

  const filteredLists = useMemo(() => filterLists(lists, filter), [lists, filter]);

  if (lists.length === 0) {
    return (
      <div className="py-12 text-center" data-testid="profile-lists-panel">
        <div className="flex flex-col items-center gap-4">
          <p className="text-muted-foreground">作成したリストはまだありません。</p>
          {isMyProfile && (
            <Link href="/list/create" className={cn(buttonVariants())}>
              新しいリストを作成する
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div data-testid="profile-lists-panel">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: 'all' as const, label: 'すべて' },
              { id: 'quiz' as const, label: 'クイズリストのみ' },
              { id: 'question' as const, label: '問題リストのみ' },
            ] as const
          ).map((chip) => (
            <Button
              key={chip.id}
              type="button"
              variant={filter === chip.id ? 'default' : 'secondary'}
              size="sm"
              data-testid={`profile-list-filter-${chip.id}`}
              onClick={() => setFilter(chip.id)}
            >
              {chip.label}
            </Button>
          ))}
        </div>
        {isMyProfile && (
          <Link href="/list/create" className={cn(buttonVariants({ size: 'sm' }))}>
            新しいリストを作成する
          </Link>
        )}
      </div>

      {filteredLists.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center" data-testid="profile-list-filter-empty">
          <p className="text-muted-foreground">該当するリストがありません</p>
          <Button type="button" variant="secondary" size="sm" onClick={() => setFilter('all')}>
            フィルタを解除（すべて）
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredLists.map((list) => (
            <ProfileListCard key={list.id} list={list} />
          ))}
        </div>
      )}
    </div>
  );
}
