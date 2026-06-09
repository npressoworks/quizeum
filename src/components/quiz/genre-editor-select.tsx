'use client';

import React, { useMemo } from 'react';
import type { GenreMetadata } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface GenreEditorSelectProps {
  value: string;
  onChange: (genreId: string) => void;
  genres: GenreMetadata[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  selectClassName?: string;
}

export function GenreEditorSelect({
  value,
  onChange,
  genres,
  loading,
  error,
  onRetry,
  selectClassName = '',
}: GenreEditorSelectProps) {
  const hasOrphanValue = useMemo(() => {
    if (!value.trim()) return false;
    return !genres.some((g) => g.id === value);
  }, [genres, value]);

  const orphanLabel = value;

  const selectDisabled = loading || !!error || (genres.length === 0 && !error && !loading);

  return (
    <div data-testid="genre-editor-select-wrap">
      {error && (
        <p
          className="genre-editor-select-error mb-2 text-sm text-destructive"
          role="alert"
        >
          {error}
          {onRetry && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="ml-2 h-7 text-xs"
            >
              再試行
            </Button>
          )}
        </p>
      )}

      {!error && !loading && genres.length === 0 && (
        <p className="mb-2 text-sm text-muted-foreground">
          選択可能なジャンルがありません。新しいジャンルを申請してください。
        </p>
      )}

      <select
        data-testid="genre-editor-select"
        className={cn(
          'w-full rounded-md border border-input bg-background px-4 py-3.5 text-base text-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50',
          selectClassName
        )}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={selectDisabled}
        required
        aria-busy={loading}
      >
        <option value="" disabled>
          {loading ? 'ジャンルを読み込み中...' : 'ジャンルを選択してください'}
        </option>
        {hasOrphanValue && (
          <option value={value}>{orphanLabel}（マスタ未登録・要確認）</option>
        )}
        {genres.map((g) => (
          <option key={g.id} value={g.id}>
            {g.displayName}
          </option>
        ))}
      </select>
    </div>
  );
}
