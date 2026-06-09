'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { GenreMetadata } from '@/types';
import { buildSearchUrlQuery } from '@/lib/search-url-state';
import { Button } from '@/components/ui/button';
import { HorizontalScrollCarousel, genreFormatCardClass } from './horizontal-scroll-carousel';

export type GenreCarouselMode = 'filter' | 'navigate';

export interface GenreCarouselProps {
  genres: GenreMetadata[];
  loading: boolean;
  error: string | null;
  selectedGenreId?: string;
  onSelect?: (genreId: string) => void;
  onRetry?: () => void;
  emptyMessage?: string;
  mode?: GenreCarouselMode;
}

export function GenreCarousel({
  genres,
  loading,
  error,
  selectedGenreId = '',
  onSelect,
  onRetry,
  emptyMessage = '表示できるジャンルがありません。',
  mode = 'filter',
}: GenreCarouselProps) {
  const router = useRouter();
  const isNavigateMode = mode === 'navigate';

  const handleGenreClick = (genreId: string) => {
    if (isNavigateMode) {
      const query = buildSearchUrlQuery({
        filters: { genreId },
      } as Parameters<typeof buildSearchUrlQuery>[0]);
      router.push(query ? `/search?${query}` : '/search');
      return;
    }
    onSelect?.(selectedGenreId === genreId ? '' : genreId);
  };

  if (loading) {
    return <p className="px-1 py-2 text-sm text-muted-foreground">ジャンルを読み込み中...</p>;
  }

  if (error) {
    return (
      <p className="px-1 py-2 text-sm text-destructive" role="alert">
        {error}
        {onRetry && (
          <Button type="button" variant="link" className="ml-2 h-auto p-0" onClick={onRetry}>
            再試行
          </Button>
        )}
      </p>
    );
  }

  if (genres.length === 0) {
    return <p className="px-1 py-2 text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <HorizontalScrollCarousel data-testid="genre-carousel" className="gap-3 px-0.5 pb-3">
      {genres.map((genre) => {
        const selected = !isNavigateMode && selectedGenreId === genre.id;
        return (
          <button
            key={genre.id}
            type="button"
            className={genreFormatCardClass(selected)}
            data-testid={`genre-carousel-card-${genre.id}`}
            aria-pressed={isNavigateMode ? undefined : selected}
            onClick={() => handleGenreClick(genre.id)}
          >
            <div className="mb-2 flex min-h-9 items-center justify-center text-2xl">
              {genre.iconImageUrl ? (
                <Image
                  src={genre.iconImageUrl}
                  alt=""
                  width={32}
                  height={32}
                  unoptimized
                />
              ) : (
                <span aria-hidden>📚</span>
              )}
            </div>
            <span className="text-sm font-semibold leading-tight">{genre.displayName}</span>
          </button>
        );
      })}
    </HorizontalScrollCarousel>
  );
}
