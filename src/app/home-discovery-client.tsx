'use client';

import React from 'react';
import Link from 'next/link';
import type { GenreMetadata, Quiz } from '@/types';
import { QuizCarousel } from '@/components/explore/quiz-carousel';
import { GenreCarousel } from '@/components/explore/genre-carousel';
import { buildSearchUrlQuery } from '@/lib/search-url-state';
import styles from './home-discovery.module.css';

export interface HomeDiscoveryClientProps {
  initialTrending: Quiz[];
  initialLatest: Quiz[];
  initialGenres: GenreMetadata[];
  trendingError?: string | null;
  latestError?: string | null;
  genresError?: string | null;
}

interface DiscoverySectionProps {
  title: string;
  seeMoreHref: string;
  seeMoreTestId: string;
  sectionTestId: string;
  children: React.ReactNode;
}

function DiscoverySection({
  title,
  seeMoreHref,
  seeMoreTestId,
  sectionTestId,
  children,
}: DiscoverySectionProps) {
  return (
    <section className={styles.section} data-testid={sectionTestId}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <Link
          href={seeMoreHref}
          className={styles.seeMoreLink}
          data-testid={seeMoreTestId}
        >
          もっと見る
        </Link>
      </div>
      {children}
    </section>
  );
}

export function HomeDiscoveryClient({
  initialTrending,
  initialLatest,
  initialGenres,
  trendingError = null,
  latestError = null,
  genresError = null,
}: HomeDiscoveryClientProps) {
  const genreLabelById = new Map(initialGenres.map((genre) => [genre.id, genre.displayName]));

  return (
    <div className={styles.page}>
      <DiscoverySection
        title="おすすめクイズ"
        seeMoreHref={`/search?${buildSearchUrlQuery({ tab: 'trending' })}`}
        seeMoreTestId="discovery-see-more-trending"
        sectionTestId="home-discovery-trending"
      >
        <QuizCarousel
          quizzes={initialTrending}
          loading={false}
          error={trendingError}
          genreLabelById={genreLabelById}
        />
      </DiscoverySection>

      <DiscoverySection
        title="おすすめジャンル"
        seeMoreHref={`/search?${buildSearchUrlQuery({ openFilters: true })}`}
        seeMoreTestId="discovery-see-more-genres"
        sectionTestId="home-discovery-genres"
      >
        <GenreCarousel
          genres={initialGenres}
          loading={false}
          error={genresError}
          mode="navigate"
        />
      </DiscoverySection>

      <DiscoverySection
        title="新着クイズ"
        seeMoreHref="/search?tab=latest"
        seeMoreTestId="discovery-see-more-latest"
        sectionTestId="home-discovery-latest"
      >
        <QuizCarousel
          quizzes={initialLatest}
          loading={false}
          error={latestError}
          genreLabelById={genreLabelById}
        />
      </DiscoverySection>
    </div>
  );
}
