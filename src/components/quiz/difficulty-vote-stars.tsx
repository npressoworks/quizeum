'use client';

import React from 'react';
import { getDifficultyColor } from '@/lib/difficulty-color';
import { cn } from '@/lib/utils';

export interface DifficultyVoteStarsProps {
  value: number | null;
  onVote: (level: number) => void;
  disabled?: boolean;
  maxLevel?: number;
}

export function DifficultyVoteStars({
  value,
  onVote,
  disabled = false,
  maxLevel = 5,
}: DifficultyVoteStarsProps) {
  const levels = Array.from({ length: maxLevel }, (_, i) => i + 1);

  return (
    <div
      className="flex flex-wrap gap-1"
      data-testid="difficulty-vote-stars"
      aria-label="体感難易度を星で投票"
    >
      {levels.map((level) => {
        const isFilled = value !== null && level <= value;
        const starColor =
          value !== null && isFilled ? getDifficultyColor(value) : undefined;

        return (
          <button
            key={level}
            type="button"
            className={cn(
              'rounded-md px-1 text-2xl leading-none transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50',
              isFilled ? 'font-bold' : 'text-muted-foreground',
            )}
            data-testid={`difficulty-vote-star-${level}`}
            style={starColor ? { color: starColor } : undefined}
            onClick={() => onVote(level)}
            disabled={disabled}
            aria-label={`難易度 ${level}`}
          >
            {isFilled ? '★' : '☆'}
          </button>
        );
      })}
    </div>
  );
}
