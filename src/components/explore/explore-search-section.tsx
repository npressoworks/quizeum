'use client';

import React, { useMemo, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { UnifiedSearchField } from '@/components/explore/unified-search-field';
import { useWeeklyTopSearch } from '@/hooks/useWeeklyTrends';
import { normalizeTag } from '@/services/quiz-validation';
import type { TagMetadata } from '@/types';
import type { HomeFeedFilters } from '@/lib/home-feed-filters';
import styles from '@/app/page.module.css';

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
}: ExploreSearchSectionProps) {
  const [showFilters, setShowFilters] = useState(false);
  const { tags: weeklyTags, loading: loadingWeekly, error: errorWeekly } = useWeeklyTopSearch();

  const quickTags = useMemo(
    () => weeklyTags.filter((tagId) => !filters.tagChips.includes(tagId)).slice(0, 5),
    [weeklyTags, filters.tagChips]
  );

  const handleQuickChip = (tagId: string) => {
    const normalized = normalizeTag(tagId);
    if (!normalized || filters.tagChips.includes(normalized)) return;
    onFiltersChange({ tagChips: [...filters.tagChips, normalized] });
  };

  return (
    <section
      className={styles.searchSection}
      data-testid={testId ?? (lockedGenreId ? 'genre-explore-search' : undefined)}
    >
      <div className={styles.searchBar}>
        <div className={styles.searchFieldWrapper}>
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
        <button
          type="button"
          className={styles.filterToggleBtn}
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal size={18} />
          フィルター
        </button>
      </div>

      {showQuickSearch && !errorWeekly && (loadingWeekly || quickTags.length > 0) && (
        <div className={styles.quickSearch} data-testid="quick-search-tags">
          <span className={styles.quickSearchLabel}>クイック検索:</span>
          {loadingWeekly ? (
            <span className={styles.quickSearchLoading}>読み込み中...</span>
          ) : (
            quickTags.map((tagId) => (
              <button
                key={tagId}
                type="button"
                className={styles.quickChip}
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
        <div className={styles.filterPanel}>

          {/* ── 難易度スライダー ── */}
          <div className={styles.filterGroupFull}>
            <div className={styles.filterLabelRow}>
              <span className={styles.filterLabel}>難易度</span>
              <span className={styles.filterValue}>
                {filters.difficultyMin === filters.difficultyMax
                  ? `Lv.${filters.difficultyMin}（${DIFFICULTY_LABELS[filters.difficultyMin]}）`
                  : `Lv.${filters.difficultyMin} 〜 Lv.${filters.difficultyMax}`}
              </span>
            </div>

            <div className={styles.dualSliderWrapper}>
              {/* トラック背景（選択範囲のハイライト用） */}
              <div
                className={styles.sliderTrackHighlight}
                style={{
                  left: `${((filters.difficultyMin - 1) / 4) * 100}%`,
                  right: `${((5 - filters.difficultyMax) / 4) * 100}%`,
                }}
              />

              {/* Min スライダー */}
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={filters.difficultyMin}
                className={styles.rangeSlider}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  onFiltersChange({
                    difficultyMin: v,
                    difficultyMax: Math.max(v, filters.difficultyMax),
                  });
                }}
                aria-label="難易度最小値"
              />

              {/* Max スライダー */}
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={filters.difficultyMax}
                className={styles.rangeSlider}
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

            {/* 目盛りラベル */}
            <div className={styles.sliderTicks}>
              {[1, 2, 3, 4, 5].map((lv) => (
                <span key={lv} className={styles.sliderTick}>
                  {lv}
                </span>
              ))}
            </div>
          </div>

          {/* ── 問題数 ── */}
          <div className={styles.filterGroupFull}>
            <div className={styles.filterLabelRow}>
              <span className={styles.filterLabel}>問題数</span>
              <span className={styles.filterValue}>
                {filters.minQuestions === filters.maxQuestions
                  ? `${filters.minQuestions} 問`
                  : `${filters.minQuestions} 〜 ${filters.maxQuestions} 問`}
              </span>
            </div>

            <div className={styles.dualSliderWrapper}>
              {/* 選択範囲のハイライトトラック */}
              <div
                className={styles.sliderTrackHighlight}
                style={{
                  left: `${((filters.minQuestions - 1) / 49) * 100}%`,
                  right: `${((50 - filters.maxQuestions) / 49) * 100}%`,
                }}
              />

              {/* Min スライダー */}
              <input
                type="range"
                min={1}
                max={50}
                step={1}
                value={filters.minQuestions}
                className={styles.rangeSlider}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  onFiltersChange({
                    minQuestions: v,
                    maxQuestions: Math.max(v, filters.maxQuestions),
                  });
                }}
                aria-label="最小問題数"
              />

              {/* Max スライダー */}
              <input
                type="range"
                min={1}
                max={50}
                step={1}
                value={filters.maxQuestions}
                className={styles.rangeSlider}
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

            {/* 目盛りラベル（10問刻み） */}
            <div className={styles.sliderTicks}>
              {[1, 10, 20, 30, 40, 50].map((n) => (
                <span key={n} className={styles.sliderTick}>
                  {n}
                </span>
              ))}
            </div>
          </div>

          {/* ── プレイ状況 ── */}
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>プレイ状況</span>
            <select
              className={styles.filterSelect}
              value={playStatus}
              disabled={playStatusDisabled}
              title={
                playStatusDisabled ? 'ログインするとプレイ状況で絞り込めます' : undefined
              }
              onChange={(e) =>
                onPlayStatusChange(e.target.value as 'all' | 'unplayed' | 'played')
              }
            >
              <option value="all">すべて表示</option>
              <option value="unplayed">未プレイのみ</option>
              <option value="played">プレイ済みのみ</option>
            </select>
            {playStatusDisabled && (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                プレイ状況で絞り込むにはログインが必要です
              </p>
            )}
          </div>

        </div>
      )}
    </section>
  );
}
