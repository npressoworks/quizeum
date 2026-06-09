import React, { Suspense } from 'react';
import {
  getLatestQuizzes,
  getTrendingQuizzes,
  listActiveGenres,
} from '@/services/quiz';
import { DISCOVERY_CAROUSEL_SIZE } from '@/lib/quiz-feed-cursor';
import { HomeDiscoveryClient } from './home-discovery-client';
import { HomeDiscoveryPageSkeleton } from '@/components/explore/home-discovery-page-skeleton';
import styles from './page.module.css';

async function HomeDiscoveryDataLoader() {
  const [trending, latest, genres] = await Promise.all([
    getTrendingQuizzes(DISCOVERY_CAROUSEL_SIZE),
    getLatestQuizzes(DISCOVERY_CAROUSEL_SIZE),
    listActiveGenres(),
  ]);

  return (
    <HomeDiscoveryClient
      initialTrending={JSON.parse(JSON.stringify(trending))}
      initialLatest={JSON.parse(JSON.stringify(latest))}
      initialGenres={JSON.parse(JSON.stringify(genres))}
    />
  );
}

export default function Home() {
  return (
    <div className={styles.container}>
      <Suspense fallback={<HomeDiscoveryPageSkeleton />}>
        <HomeDiscoveryDataLoader />
      </Suspense>
    </div>
  );
}
