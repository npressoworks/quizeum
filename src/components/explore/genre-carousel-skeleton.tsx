import React from 'react';
import styles from './explore-carousel.module.css';
import skeletonStyles from './genre-carousel-skeleton.module.css';

interface GenreCarouselSkeletonProps {
  count?: number;
  'data-testid'?: string;
}

export function GenreCarouselSkeleton({
  count = 6,
  'data-testid': testId = 'genre-carousel-skeleton',
}: GenreCarouselSkeletonProps) {
  return (
    <div className={styles.carousel} data-testid={testId}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={`${styles.card} ${skeletonStyles.card}`}>
          <div className={`${styles.cardIcon} ${skeletonStyles.pulse}`} />
          <div className={`${styles.cardLabel} ${skeletonStyles.label} ${skeletonStyles.pulse}`} />
        </div>
      ))}
    </div>
  );
}
