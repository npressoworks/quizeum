import React, { Suspense } from 'react';
import { SearchClient } from './search-client';
import { GridSkeleton } from '@/components/ui/grid-skeleton';
import { discoveryPageContainerClass } from '@/lib/discovery-layout';

export default function SearchPage() {
  return (
    <div className={discoveryPageContainerClass}>
      <Suspense fallback={<GridSkeleton data-testid="search-page-skeleton" />}>
        <SearchClient />
      </Suspense>
    </div>
  );
}
