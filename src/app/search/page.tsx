import React, { Suspense } from 'react';
import { SearchClient } from './search-client';
import { GridSkeleton } from '@/components/ui/grid-skeleton';
import styles from '../page.module.css';

export default function SearchPage() {
  return (
    <div className={styles.container}>
      <Suspense fallback={<GridSkeleton data-testid="search-page-skeleton" />}>
        <SearchClient />
      </Suspense>
    </div>
  );
}
