import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { HorizontalScrollCarousel, genreFormatCardClass } from './horizontal-scroll-carousel';

interface GenreCarouselSkeletonProps {
  count?: number;
  'data-testid'?: string;
}

export function GenreCarouselSkeleton({
  count = 6,
  'data-testid': testId = 'genre-carousel-skeleton',
}: GenreCarouselSkeletonProps) {
  return (
    <HorizontalScrollCarousel data-testid={testId}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={genreFormatCardClass(false)} aria-hidden>
          <Skeleton className="mx-auto mb-2 h-9 w-9 rounded-md" />
          <Skeleton className="mx-auto h-3.5 w-[72px]" />
        </div>
      ))}
    </HorizontalScrollCarousel>
  );
}
