'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { filterSearchSuggestions, type SearchSuggestion } from '@/lib/filter-search-suggestions';
import { normalizeTag } from '@/services/quiz-validation';
import type { GenreMetadata, TagMetadata } from '@/types';
import styles from './unified-search-field.module.css';

export interface UnifiedSearchFieldProps {
  tagChips: string[];
  onTagChipsChange: (chips: string[]) => void;
  keyword: string;
  onKeywordChange: (value: string) => void;
  genres: GenreMetadata[];
  tags: TagMetadata[];
  genresLoading: boolean;
  tagsLoading: boolean;
  genresError: string | null;
  tagsError: string | null;
  tagLabelById: Map<string, string>;
  selectedGenreId: string;
  onGenreSelect: (genreId: string) => void;
  onClearAll: () => void;
  disabled?: boolean;
}

export function UnifiedSearchField({
  tagChips,
  onTagChipsChange,
  keyword,
  onKeywordChange,
  genres,
  tags,
  genresLoading,
  tagsLoading,
  genresError,
  tagsError,
  tagLabelById,
  onGenreSelect,
  onClearAll,
  disabled = false,
}: UnifiedSearchFieldProps) {
  const inputId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);

  const suggestions = useMemo(
    () => filterSearchSuggestions(tags, genres, keyword),
    [tags, genres, keyword]
  );

  const showClear = keyword.trim().length > 0 || tagChips.length > 0;

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => {
    setHighlight(0);
  }, [keyword, suggestions.length]);

  const tryAddChip = (raw: string): boolean => {
    let token = raw.trim();
    if (token.startsWith('#')) token = token.slice(1);
    const normalized = normalizeTag(token);
    if (!normalized || tagChips.includes(normalized)) return false;
    onTagChipsChange([...tagChips, normalized]);
    return true;
  };

  const removeChip = (chip: string) => {
    onTagChipsChange(tagChips.filter((c) => c !== chip));
  };

  const pickSuggestion = (item: SearchSuggestion) => {
    if (item.kind === 'tag') {
      if (!tagChips.includes(item.id)) {
        onTagChipsChange([...tagChips, item.id]);
      }
      onKeywordChange('');
    } else {
      onGenreSelect(item.id);
      onKeywordChange('');
    }
    setOpen(false);
  };

  const masterError = tagsError || genresError;
  const suggestDisabled = disabled || genresLoading || tagsLoading;

  return (
    <div className={styles.wrap} ref={wrapRef} data-testid="unified-search-field">
      <Search className={styles.searchIcon} size={18} />
      <div className={styles.fieldRow}>
        <div className={styles.inputArea}>
          <div className={styles.chipRow} data-testid="search-tag-chips">
            {tagChips.map((chip) => (
              <span key={chip} className={styles.chip} data-testid="search-tag-chip">
                {tagLabelById.get(chip) ?? chip}
                <button
                  type="button"
                  className={styles.chipRemove}
                  aria-label={`タグ ${tagLabelById.get(chip) ?? chip} を削除`}
                  onClick={() => removeChip(chip)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <input
            id={inputId}
            type="text"
            className={styles.input}
            placeholder="タイトル、説明文、作成者、タグでクイズを検索..."
            value={keyword}
            disabled={disabled}
            autoComplete="off"
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              onKeywordChange(e.target.value);
              setOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown' && open && suggestions.length > 0) {
                e.preventDefault();
                setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
                return;
              }
              if (e.key === 'ArrowUp' && open && suggestions.length > 0) {
                e.preventDefault();
                setHighlight((h) => Math.max(h - 1, 0));
                return;
              }
              if (e.key === 'Enter') {
                e.preventDefault();
                if (open && suggestions.length > 0) {
                  pickSuggestion(suggestions[highlight]);
                } else if (tryAddChip(keyword)) {
                  onKeywordChange('');
                }
                return;
              }
              if (e.key === ' ') {
                if (tryAddChip(keyword)) {
                  e.preventDefault();
                  onKeywordChange('');
                }
              }
              if (e.key === 'Escape') {
                setOpen(false);
              }
            }}
          />
        </div>
      </div>
      {showClear && (
        <button
          type="button"
          className={styles.clearBtn}
          onClick={onClearAll}
          aria-label="クリア"
          data-testid="search-clear-btn"
        >
          <X size={18} />
        </button>
      )}
      {open && keyword.trim().length > 0 && !suggestDisabled && suggestions.length > 0 && (
        <ul className={styles.list} role="listbox">
          {suggestions.map((item, i) => (
            <li
              key={`${item.kind}-${item.id}`}
              role="option"
              aria-selected={i === highlight}
              className={`${styles.option} ${i === highlight ? styles.optionActive : ''}`}
              data-testid={
                item.kind === 'tag'
                  ? `search-suggest-tag-${item.id}`
                  : `search-suggest-genre-${item.id}`
              }
              onMouseDown={(e) => {
                e.preventDefault();
                pickSuggestion(item);
              }}
            >
              <span className={styles.optionKind}>{item.kind === 'tag' ? 'タグ' : 'ジャンル'}</span>
              {item.label}
            </li>
          ))}
        </ul>
      )}
      {open && keyword.trim().length > 0 && masterError && (
        <p className={styles.errorHint} role="alert">
          {masterError}
        </p>
      )}
    </div>
  );
}
