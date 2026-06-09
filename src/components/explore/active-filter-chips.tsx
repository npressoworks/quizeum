'use client';

import React from 'react';
import { X } from 'lucide-react';
import {
  DEFAULT_HOME_FEED_FILTERS,
  type HomeFeedFilters,
} from '@/lib/home-feed-filters';
import { EXPLORE_FORMAT_OPTIONS } from '@/lib/explore-formats';
import { hasActiveExploreFilters } from '@/lib/explore-filter-active';
import type { SearchPlayStatus } from '@/lib/search-url-state';
import styles from './active-filter-chips.module.css';

export type FilterChipKey =
  | 'genre'
  | 'format'
  | 'difficulty'
  | 'questionCount'
  | 'keyword'
  | 'tag'
  | 'playStatus';

export interface ActiveFilterChipsProps {
  filters: HomeFeedFilters;
  playStatus: SearchPlayStatus;
  tagLabelById: Map<string, string>;
  genreLabelById: Map<string, string>;
  onRemove: (key: FilterChipKey, value?: string) => void;
  onClearAll: () => void;
}

const PLAY_STATUS_LABELS: Record<Exclude<SearchPlayStatus, 'all'>, string> = {
  unplayed: '未プレイ',
  played: 'プレイ済み',
};

function isNonDefaultDifficulty(filters: HomeFeedFilters): boolean {
  return (
    filters.difficultyMin !== DEFAULT_HOME_FEED_FILTERS.difficultyMin ||
    filters.difficultyMax !== DEFAULT_HOME_FEED_FILTERS.difficultyMax
  );
}

function isNonDefaultQuestionCount(filters: HomeFeedFilters): boolean {
  return (
    filters.minQuestions !== DEFAULT_HOME_FEED_FILTERS.minQuestions ||
    filters.maxQuestions !== DEFAULT_HOME_FEED_FILTERS.maxQuestions
  );
}

interface ChipItem {
  key: FilterChipKey;
  value?: string;
  label: string;
}

function buildChipItems(
  filters: HomeFeedFilters,
  playStatus: SearchPlayStatus,
  tagLabelById: Map<string, string>,
  genreLabelById: Map<string, string>
): ChipItem[] {
  const items: ChipItem[] = [];

  if (filters.genreId.trim()) {
    items.push({
      key: 'genre',
      label: `ジャンル: ${genreLabelById.get(filters.genreId) ?? filters.genreId}`,
    });
  }

  if (filters.format) {
    const formatLabel =
      EXPLORE_FORMAT_OPTIONS.find((option) => option.id === filters.format)?.label ??
      filters.format;
    items.push({
      key: 'format',
      label: `形式: ${formatLabel}`,
    });
  }

  if (isNonDefaultDifficulty(filters)) {
    items.push({
      key: 'difficulty',
      label: `難易度: ${filters.difficultyMin}〜${filters.difficultyMax}`,
    });
  }

  if (isNonDefaultQuestionCount(filters)) {
    items.push({
      key: 'questionCount',
      label: `問題数: ${filters.minQuestions}〜${filters.maxQuestions}問`,
    });
  }

  filters.tagChips.forEach((tag) => {
    items.push({
      key: 'tag',
      value: tag,
      label: `#${tagLabelById.get(tag) ?? tag}`,
    });
  });

  if (filters.searchQuery.trim()) {
    items.push({
      key: 'keyword',
      label: `キーワード: ${filters.searchQuery.trim()}`,
    });
  }

  if (playStatus !== 'all') {
    items.push({
      key: 'playStatus',
      label: PLAY_STATUS_LABELS[playStatus],
    });
  }

  return items;
}

export function ActiveFilterChips({
  filters,
  playStatus,
  tagLabelById,
  genreLabelById,
  onRemove,
  onClearAll,
}: ActiveFilterChipsProps) {
  const chips = buildChipItems(filters, playStatus, tagLabelById, genreLabelById);
  const visible = hasActiveExploreFilters(filters) || playStatus !== 'all';

  if (!visible || chips.length === 0) {
    return null;
  }

  return (
    <div className={styles.row} data-testid="search-active-filters">
      <div className={styles.chips}>
        {chips.map((chip) => (
          <span
            key={`${chip.key}-${chip.value ?? chip.label}`}
            className={styles.chip}
            data-testid={`search-active-filter-${chip.key}${chip.value ? `-${chip.value}` : ''}`}
          >
            <span className={styles.chipLabel}>{chip.label}</span>
            <button
              type="button"
              className={styles.removeBtn}
              aria-label={`${chip.label} を解除`}
              onClick={() => onRemove(chip.key, chip.value)}
            >
              <X size={14} aria-hidden />
            </button>
          </span>
        ))}
      </div>
      <button type="button" className={styles.clearAllBtn} onClick={onClearAll}>
        すべてクリア
      </button>
    </div>
  );
}
