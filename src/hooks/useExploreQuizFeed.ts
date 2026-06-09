'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getLatestQuizzesPage,
  getPopularQuizzesPage,
  getTrendingQuizzesPage,
  getFollowedTimelinePage,
  getQuizzesByGenre,
  searchQuizzes,
  searchQuizzesPaginated,
  type QuizListSort,
} from '@/services/quiz';
import { HOME_FEED_PAGE_SIZE } from '@/lib/quiz-feed-cursor';
import { sortQuizzesForList } from '@/lib/metadata-resolution';
import type { HomeFeedFilters } from '@/lib/home-feed-filters';
import {
  hasActiveExploreFilters,
  hasActiveScopedExploreFilters,
} from '@/lib/explore-filter-active';
import type { PaginatedQuizResult, Quiz } from '@/types';

const DEBOUNCE_MS = 300;

export type HomeFeedTab = 'latest' | 'popular' | 'trending' | 'timeline';
export type ExploreFeedMode = 'home' | 'scoped';

export interface UseExploreQuizFeedOptions {
  mode: ExploreFeedMode;
  activeTab?: HomeFeedTab;
  userId?: string;
  filters: HomeFeedFilters;
  lockedGenreId?: string;
  activeSort?: QuizListSort;
  limit?: number;
  initialQuizzes?: Quiz[];
}

function buildSearchArgs(filters: HomeFeedFilters, genreIdOverride?: string) {
  const genreId = genreIdOverride ?? filters.genreId.trim();
  return {
    genreId: genreId || undefined,
    tags: filters.tagChips.length > 0 ? filters.tagChips : undefined,
    format: filters.format || undefined,
    difficultyMin: filters.difficultyMin,
    difficultyMax: filters.difficultyMax,
    minQuestions: filters.minQuestions,
    maxQuestions: filters.maxQuestions,
  };
}

function appendUniqueQuizzes(prev: Quiz[], incoming: Quiz[]): Quiz[] {
  if (incoming.length === 0) return prev;
  const ids = new Set(prev.map((q) => q.id));
  const fresh = incoming.filter((q) => !ids.has(q.id));
  return fresh.length > 0 ? [...prev, ...fresh] : prev;
}

export function useExploreQuizFeed(options: UseExploreQuizFeedOptions) {
  const {
    mode,
    activeTab = 'latest',
    userId,
    filters,
    lockedGenreId,
    activeSort = 'latest',
    limit = HOME_FEED_PAGE_SIZE,
    initialQuizzes,
  } = options;

  const [quizzes, setQuizzes] = useState<Quiz[]>(initialQuizzes || []);
  const [loading, setLoading] = useState(!initialQuizzes);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isFirstRender, setIsFirstRender] = useState(true);
  const loadingMoreRef = useRef(false);
  const nextCursorRef = useRef<string | null>(null);

  useEffect(() => {
    nextCursorRef.current = nextCursor;
  }, [nextCursor]);

  const usesHomePagination = mode === 'home';

  const fetchHomePage = useCallback(
    async (cursor: string | null): Promise<PaginatedQuizResult> => {
      const pageOpts = { limit, cursor };
      if (hasActiveExploreFilters(filters)) {
        return searchQuizzesPaginated(filters.searchQuery, buildSearchArgs(filters), {
          ...pageOpts,
          userId,
        });
      }
      if (activeTab === 'latest') return getLatestQuizzesPage(pageOpts);
      if (activeTab === 'popular') return getPopularQuizzesPage(pageOpts);
      if (activeTab === 'trending') return getTrendingQuizzesPage(pageOpts);
      if (activeTab === 'timeline') {
        if (!userId) return { items: [], nextCursor: null };
        return getFollowedTimelinePage(userId, pageOpts);
      }
      return { items: [], nextCursor: null };
    },
    [activeTab, filters, limit, userId]
  );

  const fetchScopedBulk = useCallback(async (): Promise<Quiz[]> => {
    if (!lockedGenreId) return [];
    if (hasActiveScopedExploreFilters(filters, lockedGenreId)) {
      const fetched = await searchQuizzes(
        filters.searchQuery,
        buildSearchArgs(filters, lockedGenreId)
      );
      return sortQuizzesForList(fetched, activeSort);
    }
    return getQuizzesByGenre(lockedGenreId, limit, activeSort);
  }, [activeSort, filters, limit, lockedGenreId]);

  useEffect(() => {
    if (isFirstRender && initialQuizzes && usesHomePagination) {
      setIsFirstRender(false);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      setLoadingMore(false);
      setError(null);
      setQuizzes([]);
      setNextCursor(null);
      setHasMore(false);

      try {
        if (usesHomePagination) {
          const page = await fetchHomePage(null);
          if (!cancelled) {
            setQuizzes(page.items);
            setNextCursor(page.nextCursor);
            setHasMore(page.nextCursor != null);
          }
        } else {
          const fetched = await fetchScopedBulk();
          if (!cancelled) {
            setQuizzes(fetched);
            setNextCursor(null);
            setHasMore(false);
          }
        }
      } catch (e) {
        console.error('[useExploreQuizFeed]', e);
        if (!cancelled) {
          setQuizzes([]);
          setNextCursor(null);
          setHasMore(false);
          setError('クイズ一覧の取得に失敗しました。');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    mode,
    activeTab,
    userId,
    lockedGenreId,
    activeSort,
    limit,
    filters.genreId,
    filters.format,
    filters.searchQuery,
    filters.tagChips.join(','),
    filters.difficultyMin,
    filters.difficultyMax,
    filters.minQuestions,
    filters.maxQuestions,
    fetchHomePage,
    fetchScopedBulk,
    usesHomePagination,
    initialQuizzes,
    isFirstRender,
  ]);

  const loadMore = useCallback(async () => {
    if (!usesHomePagination) return;
    if (loading || loadingMoreRef.current || !hasMore || !nextCursorRef.current) return;

    loadingMoreRef.current = true;
    setLoadingMore(true);
    setError(null);

    try {
      const page = await fetchHomePage(nextCursorRef.current);
      setQuizzes((prev) => appendUniqueQuizzes(prev, page.items));
      setNextCursor(page.nextCursor);
      setHasMore(page.nextCursor != null);
    } catch (e) {
      console.error('[useExploreQuizFeed] loadMore', e);
      setError('クイズ一覧の取得に失敗しました。');
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [fetchHomePage, hasMore, loading, usesHomePagination]);

  return { quizzes, loading, loadingMore, error, hasMore, loadMore };
}
