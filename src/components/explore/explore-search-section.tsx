'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { UnifiedSearchField } from '@/components/explore/unified-search-field';
import { GenreCarousel } from '@/components/explore/genre-carousel';
import { FormatCarousel } from '@/components/explore/format-carousel';
import { GenreSearchField } from '@/components/explore/genre-search-field';
import { useWeeklyTopSearch } from '@/hooks/useWeeklyTrends';
import { normalizeTag } from '@/services/quiz-validation';
import { filterGenreSuggestions } from '@/lib/filter-genre-suggestions';
import type { GenreMetadata, TagMetadata } from '@/types';
import type { HomeFeedFilters } from '@/lib/home-feed-filters';
import type { QuizFormat } from '@/lib/quiz-format';
import { Button } from '@/components/ui/button';
import { badgeVariants } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

/** 難易度ラベルマップ */
const DIFFICULTY_LABELS: Record<number, string> = {
  1: 'かんたん',
  2: 'やや易しい',
  3: '普通',
  4: 'やや難しい',
  5: 'むずかしい',
};

export interface ExploreSearchSectionProps {
  filters: HomeFeedFilters;
  onFiltersChange: (patch: Partial<HomeFeedFilters>) => void;
  onClearAll: () => void;
  lockedGenreId?: string;
  tags: TagMetadata[];
  tagsLoading: boolean;
  tagsError: string | null;
  tagLabelById: Map<string, string>;
  playStatus: 'all' | 'unplayed' | 'played';
  onPlayStatusChange: (value: 'all' | 'unplayed' | 'played') => void;
  playStatusDisabled?: boolean;
  showQuickSearch?: boolean;
  testId?: string;
  showExploreCarousels?: boolean;
  genres?: GenreMetadata[];
  genresLoading?: boolean;
  genresError?: string | null;
  onGenresRetry?: () => void;
  selectedGenreId?: string;
  onGenreSelect?: (genreId: string) => void;
  selectedFormat?: QuizFormat | '';
  onFormatSelect?: (format: QuizFormat | '') => void;
  stickySearchBarTestId?: string;
  initialOpenFilters?: boolean;
  activeFilterChipsSlot?: React.ReactNode;
}

export function ExploreSearchSection({
  filters,
  onFiltersChange,
  onClearAll,
  lockedGenreId,
  tags,
  tagsLoading,
  tagsError,
  tagLabelById,
  playStatus,
  onPlayStatusChange,
  playStatusDisabled = false,
  showQuickSearch = true,
  testId,
  showExploreCarousels = false,
  genres = [],
  genresLoading = false,
  genresError = null,
  onGenresRetry,
  selectedGenreId = '',
  onGenreSelect,
  selectedFormat = '',
  onFormatSelect,
  stickySearchBarTestId,
  initialOpenFilters = false,
  activeFilterChipsSlot,
}: ExploreSearchSectionProps) {
  const [showFilters, setShowFilters] = useState(initialOpenFilters);
  const [genreSearchQuery, setGenreSearchQuery] = useState('');
  const { tags: weeklyTags, loading: loadingWeekly, error: errorWeekly } = useWeeklyTopSearch();

  const filteredGenres = useMemo(() => {
    const trimmed = genreSearchQuery.trim();
    if (!trimmed) return genres;
    return filterGenreSuggestions(genres, genreSearchQuery, genres.length);
  }, [genres, genreSearchQuery]);

  const handleGenreSelect = useCallback(
    (genreId: string) => {
      onGenreSelect?.(genreId);
      setGenreSearchQuery('');
    },
    [onGenreSelect],
  );

  const quickTags = useMemo(
    () => weeklyTags.filter((tagId) => !filters.tagChips.includes(tagId)).slice(0, 5),
    [weeklyTags, filters.tagChips],
  );

  const handleQuickChip = (tagId: string) => {
    const normalized = normalizeTag(tagId);
    if (!normalized || filters.tagChips.includes(normalized)) return;
    onFiltersChange({ tagChips: [...filters.tagChips, normalized] });
  };

  return (
    <section
      className="flex flex-col gap-4 rounded-xl border bg-card p-6 shadow-sm max-md:p-4"
      data-testid={testId ?? (lockedGenreId ? 'genre-explore-search' : undefined)}
    >
      <div
        className={cn(
          'flex gap-3 max-md:flex-col max-md:items-stretch',
          showExploreCarousels &&
            'sticky top-0 z-[80] -mx-1 bg-background/95 px-1 py-2 backdrop-blur-sm',
        )}
        data-testid={
          showExploreCarousels
            ? (stickySearchBarTestId ?? 'home-search-bar-sticky')
            : undefined
        }
      >
        <div className="relative flex flex-1 items-center">
          <UnifiedSearchField
            tagChips={filters.tagChips}
            onTagChipsChange={(tagChips) => onFiltersChange({ tagChips })}
            keyword={filters.searchQuery}
            onKeywordChange={(searchQuery) => onFiltersChange({ searchQuery })}
            tags={tags}
            tagsLoading={tagsLoading}
            tagsError={tagsError}
            tagLabelById={tagLabelById}
            onClearAll={onClearAll}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          className="shrink-0 max-md:justify-center"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal size={18} />
          フィルター
        </Button>
      </div>

      {activeFilterChipsSlot}

      {showQuickSearch && !errorWeekly && (loadingWeekly || quickTags.length > 0) && (
        <div className="flex flex-wrap items-center gap-2" data-testid="quick-search-tags">
          <span className="text-xs font-semibold text-muted-foreground">クイック検索:</span>
          {loadingWeekly ? (
            <span className="text-xs text-muted-foreground">読み込み中...</span>
          ) : (
            quickTags.map((tagId) => (
              <button
                key={tagId}
                type="button"
                className={cn(
                  badgeVariants({ variant: 'secondary' }),
                  'cursor-pointer hover:bg-secondary/80',
                )}
                data-testid={`quick-search-chip-${tagId}`}
                onClick={() => handleQuickChip(tagId)}
              >
                #{tagLabelById.get(tagId) ?? tagId}
              </button>
            ))
          )}
        </div>
      )}

      {showFilters && (
        <div className="flex animate-fade-in flex-col gap-5 border-t pt-4">
          {showExploreCarousels && onGenreSelect && onFormatSelect && (
            <>
              <div className="flex flex-col gap-2" data-testid="home-genre-carousel-block">
                <div className="mb-3" data-testid="genre-explore-search-field">
                  <GenreSearchField
                    genres={genres}
                    query={genreSearchQuery}
                    onQueryChange={setGenreSearchQuery}
                    value={selectedGenreId}
                    onChange={handleGenreSelect}
                    disabled={genresLoading || !!genresError}
                  />
                </div>
                <GenreCarousel
                  genres={filteredGenres}
                  loading={genresLoading}
                  error={genresError}
                  selectedGenreId={selectedGenreId}
                  onSelect={handleGenreSelect}
                  onRetry={onGenresRetry}
                  emptyMessage={
                    genreSearchQuery.trim() ? '該当するジャンルがありません。' : undefined
                  }
                />
              </div>
              <div className="flex flex-col gap-2" data-testid="home-format-carousel-block">
                <FormatCarousel selectedFormat={selectedFormat} onSelect={onFormatSelect} />
              </div>
            </>
          )}

          <div className="flex w-full flex-col gap-2.5">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-semibold text-muted-foreground">難易度</span>
              <span className="text-sm font-bold text-primary">
                {filters.difficultyMin === filters.difficultyMax
                  ? `Lv.${filters.difficultyMin}（${DIFFICULTY_LABELS[filters.difficultyMin]}）`
                  : `Lv.${filters.difficultyMin} 〜 Lv.${filters.difficultyMax}`}
              </span>
            </div>

            <div className="explore-dual-slider">
              <div
                className="explore-slider-highlight"
                style={{
                  left: `${((filters.difficultyMin - 1) / 4) * 100}%`,
                  right: `${((5 - filters.difficultyMax) / 4) * 100}%`,
                }}
              />
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={filters.difficultyMin}
                className="explore-range-input"
                onChange={(e) => {
                  const v = Number(e.target.value);
                  onFiltersChange({
                    difficultyMin: v,
                    difficultyMax: Math.max(v, filters.difficultyMax),
                  });
                }}
                aria-label="難易度最小値"
              />
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={filters.difficultyMax}
                className="explore-range-input"
                onChange={(e) => {
                  const v = Number(e.target.value);
                  onFiltersChange({
                    difficultyMax: v,
                    difficultyMin: Math.min(v, filters.difficultyMin),
                  });
                }}
                aria-label="難易度最大値"
              />
            </div>

            <div className="flex justify-between px-0.5">
              {[1, 2, 3, 4, 5].map((lv) => (
                <span key={lv} className="select-none text-xs font-semibold text-muted-foreground">
                  {lv}
                </span>
              ))}
            </div>
          </div>

          <div className="flex w-full flex-col gap-2.5">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-semibold text-muted-foreground">問題数</span>
              <span className="text-sm font-bold text-primary">
                {filters.minQuestions === filters.maxQuestions
                  ? `${filters.minQuestions} 問`
                  : `${filters.minQuestions} 〜 ${filters.maxQuestions} 問`}
              </span>
            </div>

            <div className="explore-dual-slider">
              <div
                className="explore-slider-highlight"
                style={{
                  left: `${((filters.minQuestions - 1) / 49) * 100}%`,
                  right: `${((50 - filters.maxQuestions) / 49) * 100}%`,
                }}
              />
              <input
                type="range"
                min={1}
                max={50}
                step={1}
                value={filters.minQuestions}
                className="explore-range-input"
                onChange={(e) => {
                  const v = Number(e.target.value);
                  onFiltersChange({
                    minQuestions: v,
                    maxQuestions: Math.max(v, filters.maxQuestions),
                  });
                }}
                aria-label="最小問題数"
              />
              <input
                type="range"
                min={1}
                max={50}
                step={1}
                value={filters.maxQuestions}
                className="explore-range-input"
                onChange={(e) => {
                  const v = Number(e.target.value);
                  onFiltersChange({
                    maxQuestions: v,
                    minQuestions: Math.min(v, filters.minQuestions),
                  });
                }}
                aria-label="最大問題数"
              />
            </div>

            <div className="flex justify-between px-0.5">
              {[1, 10, 20, 30, 40, 50].map((n) => (
                <span key={n} className="select-none text-xs font-semibold text-muted-foreground">
                  {n}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="text-sm font-semibold text-muted-foreground">プレイ状況</span>
            <Select
              value={playStatus}
              disabled={playStatusDisabled}
              onValueChange={(value) =>
                onPlayStatusChange(value as 'all' | 'unplayed' | 'played')
              }
            >
              <SelectTrigger
                className="w-full"
                title={
                  playStatusDisabled ? 'ログインするとプレイ状況で絞り込めます' : undefined
                }
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて表示</SelectItem>
                <SelectItem value="unplayed">未プレイのみ</SelectItem>
                <SelectItem value="played">プレイ済みのみ</SelectItem>
              </SelectContent>
            </Select>
            {playStatusDisabled && (
              <p className="mt-1 text-xs text-muted-foreground">
                プレイ状況で絞り込むにはログインが必要です
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
