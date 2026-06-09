import React from 'react';
import { SkeletonCard } from '@/components/ui/skeleton-card';
import { HorizontalScrollCarousel, quizCarouselSlotClass } from './horizontal-scroll-carousel';

interface QuizCarouselSkeletonProps {
  count?: number;
  'data-testid'?: string;
}

export function QuizCarouselSkeleton({
  count = 3,
  'data-testid': testId = 'quiz-carousel-skeleton',
}: QuizCarouselSkeletonProps) {
  return (
    <HorizontalScrollCarousel data-testid={testId}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={quizCarouselSlotClass}>
          <SkeletonCard />
        </div>
      ))}
    </HorizontalScrollCarousel>
  );
}
