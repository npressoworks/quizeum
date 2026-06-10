'use client';

import React, { useId, useMemo, useRef, useState } from 'react';
import { filterGenreSuggestions } from '@/lib/filter-genre-suggestions';
import type { GenreMetadata } from '@/types';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import { useWeeklyTopGenres } from '@/hooks/useWeeklyTrends';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface GenreSearchFieldProps {
  genres: GenreMetadata[];
  query: string;
  onQueryChange: (query: string) => void;
  value: string;
  onChange: (genreId: string) => void;
  disabled?: boolean;
}

const suggestPanelClass =
  'absolute z-20 top-[calc(100%+4px)] left-0 right-0 max-h-[280px] overflow-y-auto rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md';

export function GenreSearchField({
  genres,
  query,
  onQueryChange,
  value,
  onChange,
  disabled = false,
}: GenreSearchFieldProps) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const { recentGenres, addRecentGenre } = useSearchHistory();
  const { genres: weeklyTopGenres, loading: loadingWeekly, error: errorWeekly } = useWeeklyTopGenres();

  const recentGenreMetadata = useMemo(() => {
    return recentGenres
      .map((id) => genres.find((g) => g.id === id))
      .filter(Boolean) as GenreMetadata[];
  }, [recentGenres, genres]);

  const weeklyGenreMetadata = useMemo(() => {
    return weeklyTopGenres
      .map((w) => genres.find((g) => g.id === w.genreId))
      .filter(Boolean) as GenreMetadata[];
  }, [weeklyTopGenres, genres]);

  const suggestions = useMemo(
    () => filterGenreSuggestions(genres, query),
    [genres, query]
  );

  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const updateQuery = (next: string) => {
    onQueryChange(next);
    if (!next.trim()) {
      onChange('');
    }
  };

  const pick = (genre: Pick<GenreMetadata, 'id' | 'displayName'>) => {
    addRecentGenre(genre.id);
    onChange(genre.id);
    onQueryChange('');
    setOpen(false);
  };

  const clear = () => {
    onChange('');
    onQueryChange('');
    setOpen(false);
  };

  const pickSmart = (genre: Pick<GenreMetadata, 'id' | 'displayName'>) => {
    addRecentGenre(genre.id);
    onChange(genre.id);
    setOpen(false);
  };

  return (
    <div className="relative w-full" ref={wrapRef} data-testid="genre-search-field">
      <label htmlFor={listId} className="sr-only">
        ジャンルで絞り込み
      </label>
      <Input
        id={listId}
        type="text"
        placeholder="ジャンル名で検索..."
        value={query}
        disabled={disabled || genres.length === 0}
        autoComplete="off"
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          updateQuery(e.target.value);
          setHighlight(0);
          setOpen(true);
        }}
        onInput={(e) => {
          updateQuery(e.currentTarget.value);
          setHighlight(0);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (!open || suggestions.length === 0) return;
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlight((h) => Math.max(h - 1, 0));
          } else if (e.key === 'Enter') {
            e.preventDefault();
            pick(suggestions[highlight]);
          } else if (e.key === 'Escape') {
            setOpen(false);
          }
        }}
      />
      {open && !query.trim() && (
        <div className={suggestPanelClass} data-testid="genre-smart-suggest" role="listbox">
          {recentGenreMetadata.length > 0 && (
            <div data-testid="recent-genres-section" className="py-1 not-last:border-b not-last:border-border">
              <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground">最近検索したジャンル</div>
              <ul className="m-0 list-none p-0">
                {recentGenreMetadata.map((g) => (
                  <li
                    key={g.id}
                    role="option"
                    className="cursor-pointer px-3 py-2.5 text-sm hover:bg-muted"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      pickSmart(g);
                    }}
                  >
                    {g.displayName}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!errorWeekly && (
            <div data-testid="weekly-top-genres-section" className="py-1">
              <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground">今週の人気ジャンル</div>
              {loadingWeekly ? (
                <div className="px-3 py-2.5 text-sm text-muted-foreground">読み込み中...</div>
              ) : (
                <ul className="m-0 list-none p-0">
                  {weeklyGenreMetadata.map((g) => (
                    <li
                      key={g.id}
                      role="option"
                      className="cursor-pointer px-3 py-2.5 text-sm hover:bg-muted"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        pickSmart(g);
                      }}
                    >
                      {g.displayName}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {open && query.trim().length > 0 && suggestions.length > 0 && (
        <ul className={suggestPanelClass} role="listbox">
          {suggestions.map((g, i) => (
            <li
              key={g.id}
              role="option"
              aria-selected={i === highlight}
              className={cn(
                'cursor-pointer px-3 py-2.5 text-sm',
                i === highlight && 'bg-muted'
              )}
              data-testid={`genre-suggest-${g.id}`}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(g);
              }}
            >
              {g.displayName}
            </li>
          ))}
        </ul>
      )}
      {value && (
        <Button type="button" variant="link" size="sm" className="mt-1.5 h-auto p-0" onClick={clear}>
          ジャンル条件をクリア
        </Button>
      )}
    </div>
  );
}
