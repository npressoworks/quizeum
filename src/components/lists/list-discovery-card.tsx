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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ListDiscoveryCardProps {
  list: QuizList;
}

export function ListDiscoveryCard({ list }: ListDiscoveryCardProps) {
  const listType = resolveListType(list);
  const typeLabel = getProfileListTypeLabel(listType);
  const { countLabel } = getProfileListItemCount(list);

  return (
    <Link href={`/list/${list.id}`} className="block no-underline" data-testid="lists-discovery-card">
      <Card
        size="sm"
        className={cn(
          'h-full transition-colors hover:border-primary/40 hover:shadow-md'
        )}
      >
        <CardHeader className="gap-2 pb-0">
          <Badge variant="secondary" className="w-fit gap-1.5">
            <Layers size={14} />
            {typeLabel}
          </Badge>
          <CardTitle className="text-base">{list.title}</CardTitle>
          {list.description && (
            <CardDescription className="line-clamp-2">{list.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <span className="text-xs text-muted-foreground">{countLabel}</span>
        </CardContent>
      </Card>
    </Link>
  );
}
