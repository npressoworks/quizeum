'use client';

/**
 * @deprecated Phase 11: ホーム画面からは除去。ジャンル探索は ExploreAccordionsPanel / GenreCarousel を使用。
 * 参照用にファイルを残置（単体テスト用）。
 */
import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { GenreMetadata } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface GenreNavProps {
  genres: GenreMetadata[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}

const PRIMARY_GENRE_COUNT = 6;

export function GenreNav({ genres, loading, error, onRetry }: GenreNavProps) {
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);

  if (loading) {
    return (
      <nav className="flex gap-2 px-1 py-2" aria-label="ジャンル" data-testid="genre-nav">
        <p className="w-full px-4 py-4 text-center text-sm text-muted-foreground">ジャンルを読み込み中...</p>
      </nav>
    );
  }

  if (error) {
    return (
      <nav className="flex gap-2 px-1 py-2" aria-label="ジャンル" data-testid="genre-nav">
        <p className="w-full px-4 py-4 text-center text-sm text-destructive" role="alert">
          {error}
          {onRetry && (
            <Button type="button" variant="outline" size="sm" className="mt-2" onClick={onRetry}>
              再試行
            </Button>
          )}
        </p>
      </nav>
    );
  }

  if (genres.length === 0) {
    return (
      <nav className="flex gap-2 px-1 py-2" aria-label="ジャンル" data-testid="genre-nav">
        <p className="w-full px-4 py-4 text-center text-sm text-muted-foreground">
          表示できるジャンルがありません。
        </p>
      </nav>
    );
  }

  const displayedGenres = showAll ? genres : genres.slice(0, PRIMARY_GENRE_COUNT);
  const hasMore = genres.length > PRIMARY_GENRE_COUNT;

  return (
    <div className="my-4 mb-6">
      <nav
        className={cn(
          'flex gap-2 px-1 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          showAll ? 'flex-wrap' : 'overflow-x-auto',
        )}
        aria-label="ジャンル"
        data-testid="genre-nav"
      >
        {displayedGenres.map((genre) => (
          <button
            key={genre.id}
            type="button"
            className="group relative inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
            data-testid={`genre-nav-item-${genre.id}`}
            onClick={() => router.push(`/genres/${encodeURIComponent(genre.id)}`)}
          >
            <span className="flex items-center justify-center text-base">
              {genre.iconImageUrl ? (
                <Image
                  src={genre.iconImageUrl}
                  alt=""
                  width={20}
                  height={20}
                  className="object-contain"
                  unoptimized
                />
              ) : (
                <span aria-hidden>📚</span>
              )}
            </span>
            <span className="leading-none">{genre.displayName}</span>
            {genre.description && (
              <span
                className="pointer-events-none invisible absolute bottom-full left-1/2 z-[100] mb-1.5 -translate-x-1/2 translate-y-2 whitespace-nowrap rounded-lg border bg-popover px-2.5 py-1.5 text-[0.7rem] font-medium text-popover-foreground opacity-0 shadow-md transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100"
                role="tooltip"
              >
                {genre.description}
              </span>
            )}
          </button>
        ))}

        {hasMore && (
          <button
            type="button"
            className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary transition-colors hover:border-primary hover:bg-primary/10"
            onClick={() => setShowAll(!showAll)}
          >
            <span className="leading-none">{showAll ? '閉じる' : 'すべて見る'}</span>
          </button>
        )}
      </nav>
    </div>
  );
}
