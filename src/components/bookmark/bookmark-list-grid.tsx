'use client';

import React from 'react';
import Link from 'next/link';
import { Bookmark, Layers } from 'lucide-react';
import { QuizList, resolveListType } from '@/types';
import { getProfileListTypeLabel } from '@/lib/profile-list-display';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface BookmarkListGridProps {
  lists: QuizList[];
  onRemove: (listId: string) => void;
}

export function BookmarkListGrid({ lists, onRemove }: BookmarkListGridProps) {
  if (lists.length === 0) {
    return (
      <Card className="py-16 text-center">
        <CardContent>
          <h2 className="mb-2 text-lg font-semibold">ブックマークしたリストがありません</h2>
          <p className="text-muted-foreground">お気に入りのクイズリストをブックマークしましょう。</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-3">
      {lists.map((list) => (
        <Card key={list.id} className="flex flex-row items-stretch overflow-hidden">
          <Link href={`/list/${list.id}`} className="flex flex-1 flex-col gap-2 p-4 transition-colors hover:bg-muted/30">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <Layers size={14} />
              <span>{getProfileListTypeLabel(resolveListType(list))}</span>
            </div>
            <h3 className="text-lg font-bold">{list.title}</h3>
            {list.description && (
              <p className="line-clamp-2 text-sm text-muted-foreground">{list.description}</p>
            )}
          </Link>
          <div className="flex items-center border-l px-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-primary"
              onClick={() => onRemove(list.id)}
              title="ブックマーク解除"
            >
              <Bookmark size={20} className="fill-primary text-primary" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
