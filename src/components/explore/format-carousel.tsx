'use client';

import React from 'react';
import type { QuizFormat } from '@/lib/quiz-format';
import { EXPLORE_FORMAT_OPTIONS } from '@/lib/explore-formats';
import { HorizontalScrollCarousel, genreFormatCardClass } from './horizontal-scroll-carousel';

export interface FormatCarouselProps {
  selectedFormat: QuizFormat | '';
  onSelect: (format: QuizFormat | '') => void;
}

export function FormatCarousel({ selectedFormat, onSelect }: FormatCarouselProps) {
  return (
    <HorizontalScrollCarousel data-testid="format-carousel">
      {EXPLORE_FORMAT_OPTIONS.map((option) => {
        const selected = selectedFormat === option.id;
        return (
          <button
            key={option.id}
            type="button"
            className={genreFormatCardClass(selected)}
            data-testid={`format-carousel-card-${option.id}`}
            aria-pressed={selected}
            onClick={() => onSelect(selected ? '' : option.id)}
          >
            <div className="mb-2 flex min-h-9 items-center justify-center text-2xl" aria-hidden>
              {option.icon}
            </div>
            <span className="text-sm font-semibold leading-snug">{option.label}</span>
          </button>
        );
      })}
    </HorizontalScrollCarousel>
  );
}
