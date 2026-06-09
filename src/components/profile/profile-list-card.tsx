'use client';

import React from 'react';
import Link from 'next/link';
import { Layers } from 'lucide-react';
import type { QuizList } from '@/types';
import { resolveListType } from '@/types';
import {
  getProfileListItemCount,
  getProfileListTypeLabel,
} from '@/lib/profile-list-display';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export interface ProfileListCardProps {
  list: QuizList;
}

export function ProfileListCard({ list }: ProfileListCardProps) {
  const listType = resolveListType(list);
  const typeLabel = getProfileListTypeLabel(listType);
  const { countLabel } = getProfileListItemCount(list);

  return (
    <Link href={`/list/${list.id}`} data-testid="profile-list-card">
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
        {list.coverImageUrl && (
          <div className="aspect-video overflow-hidden bg-muted">
            <img src={list.coverImageUrl} alt={list.title} className="h-full w-full object-cover" />
          </div>
        )}
        <CardContent className="flex flex-col gap-2 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Layers size={14} />
            <Badge variant="outline" data-testid="profile-list-type-badge">
              {typeLabel}
            </Badge>
          </div>
          <h3 className="line-clamp-2 font-semibold">{list.title}</h3>
          {list.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">{list.description}</p>
          )}
          <span className="text-xs text-muted-foreground">{countLabel}</span>
        </CardContent>
      </Card>
    </Link>
  );
}
