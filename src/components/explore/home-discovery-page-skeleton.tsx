import React from 'react';
import discoveryStyles from '@/app/home-discovery.module.css';
import { QuizCarouselSkeleton } from './quiz-carousel-skeleton';
import { GenreCarouselSkeleton } from './genre-carousel-skeleton';

export function HomeDiscoveryPageSkeleton() {
  return (
    <div className={discoveryStyles.page} data-testid="home-discovery-page-skeleton">
      <section className={discoveryStyles.section} data-testid="home-discovery-trending">
        <div className={discoveryStyles.sectionHeader}>
          <h2 className={discoveryStyles.sectionTitle}>おすすめクイズ</h2>
        </div>
        <QuizCarouselSkeleton />
      </section>
      <section className={discoveryStyles.section} data-testid="home-discovery-genres">
        <div className={discoveryStyles.sectionHeader}>
          <h2 className={discoveryStyles.sectionTitle}>おすすめジャンル</h2>
        </div>
        <GenreCarouselSkeleton />
      </section>
      <section className={discoveryStyles.section} data-testid="home-discovery-latest">
        <div className={discoveryStyles.sectionHeader}>
          <h2 className={discoveryStyles.sectionTitle}>新着クイズ</h2>
        </div>
        <QuizCarouselSkeleton />
      </section>
    </div>
  );
}
