'use client';

import { useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  buildSearchUrlQuery,
  parseSearchUrlState,
  type SearchPlayStatus,
  type SearchUrlState,
} from '@/lib/search-url-state';
import {
  DEFAULT_HOME_FEED_FILTERS,
  type HomeFeedFilters,
} from '@/lib/home-feed-filters';
import type { HomeFeedTab } from '@/hooks/useExploreQuizFeed';

function cloneDefaultFilters(): HomeFeedFilters {
  return {
    ...DEFAULT_HOME_FEED_FILTERS,
    tagChips: [...DEFAULT_HOME_FEED_FILTERS.tagChips],
  };
}

export function useSearchUrlState() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const parsed = useMemo(() => parseSearchUrlState(searchParams), [searchParams]);

  type ReplaceStateInput = Omit<Partial<SearchUrlState>, 'filters'> & {
    filters?: Partial<HomeFeedFilters>;
  };

  const replaceState = useCallback(
    (next: ReplaceStateInput) => {
      const mergedFilters: HomeFeedFilters = {
        ...parsed.filters,
        ...(next.filters ?? {}),
        tagChips: next.filters?.tagChips
          ? [...next.filters.tagChips]
          : [...parsed.filters.tagChips],
      };

      const query = buildSearchUrlQuery({
        tab: next.tab ?? parsed.tab,
        filters: mergedFilters,
        openFilters: next.openFilters ?? parsed.openFilters,
        playStatus: next.playStatus ?? parsed.playStatus,
      });

      router.replace(query ? `/search?${query}` : '/search', { scroll: false });
    },
    [parsed, router]
  );

  const setTab = useCallback(
    (tab: HomeFeedTab) => replaceState({ tab }),
    [replaceState]
  );

  const patchFilters = useCallback(
    (patch: Partial<HomeFeedFilters>) => replaceState({ filters: patch }),
    [replaceState]
  );

  const setPlayStatus = useCallback(
    (playStatus: SearchPlayStatus) => replaceState({ playStatus }),
    [replaceState]
  );

  const setOpenFilters = useCallback(
    (openFilters: boolean) => replaceState({ openFilters }),
    [replaceState]
  );

  const clearAll = useCallback(() => {
    replaceState({
      tab: 'latest',
      filters: cloneDefaultFilters(),
      playStatus: 'all',
      openFilters: false,
    });
  }, [replaceState]);

  return {
    tab: parsed.tab,
    filters: parsed.filters,
    playStatus: parsed.playStatus,
    openFilters: parsed.openFilters,
    setTab,
    patchFilters,
    setPlayStatus,
    setOpenFilters,
    clearAll,
  };
}
