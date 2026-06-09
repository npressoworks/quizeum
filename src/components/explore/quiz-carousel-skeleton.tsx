import React from 'react';
import { SkeletonCard } from '@/components/ui/skeleton-card';
import carouselStyles from './explore-carousel.module.css';
import styles from './quiz-carousel-skeleton.module.css';

interface QuizCarouselSkeletonProps {
  count?: number;
  'data-testid'?: string;
}

export function QuizCarouselSkeleton({
  count = 3,
  'data-testid': testId = 'quiz-carousel-skeleton',
}: QuizCarouselSkeletonProps) {
  return (
    <div className={`${carouselStyles.carousel} ${styles.row}`} data-testid={testId}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={carouselStyles.quizSlot}>
          <SkeletonCard />
        </div>
      ))}
    </div>
  );
}
