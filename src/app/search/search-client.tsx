'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import styles from '../page.module.css';
import { toggleBookmark, getBookmarkedQuizIds } from '@/services/bookmark';
import { useActiveGenres } from '@/hooks/useActiveGenres';
import { useActiveTags } from '@/hooks/useActiveTags';
import { useExploreQuizFeed } from '@/hooks/useExploreQuizFeed';
import { useIntersectionLoadMore } from '@/hooks/useIntersectionLoadMore';
import { usePlayedQuizIds } from '@/hooks/usePlayedQuizIds';
import { useSearchUrlState } from '@/hooks/useSearchUrlState';
import { ExploreSearchSection } from '@/components/explore/explore-search-section';
import {
  ActiveFilterChips,
  type FilterChipKey,
} from '@/components/explore/active-filter-chips';
import { QuizCard } from '@/components/quiz/quiz-card';
import { GridSkeleton } from '@/components/ui/grid-skeleton';
import {
  DEFAULT_HOME_FEED_FILTERS,
} from '@/lib/home-feed-filters';
import { applyPlayStatusFilter } from '@/lib/apply-play-status-filter';
import { MIN_VISIBLE_AFTER_PLAY_FILTER } from '@/lib/feed-visible-threshold';
import type { QuizFormat } from '@/lib/quiz-format';
import type { GenreMetadata, TagMetadata, Quiz } from '@/types';

export interface SearchClientProps {
  initialGenres?: GenreMetadata[];
  initialTags?: TagMetadata[];
  initialQuizzes?: Quiz[];
}

export function SearchClient({
  initialGenres,
  initialTags,
  initialQuizzes,
}: SearchClientProps = {}) {
  const router = useRouter();
  const { user, firebaseUser, loading: authLoading } = useAuth();

  const {
    tab: activeTab,
    filters,
    playStatus,
    openFilters,
    setTab,
    patchFilters,
    setPlayStatus,
    clearAll,
  } = useSearchUrlState();

  const { genres, loading: genresLoading, error: genresError, refetch, genreLabelById } =
    useActiveGenres(initialGenres);

  const {
    tags: activeTags,
    loading: tagsLoading,
    error: tagsError,
    tagLabelById,
  } = useActiveTags(initialTags);

  const [bookmarkedIds, setBookmarkedIds] = React.useState<Set<string>>(new Set());

  const handleGenreSelect = (genreId: string) => {
    patchFilters({ genreId });
  };

  const handleFormatSelect = (format: QuizFormat | '') => {
    patchFilters({ format });
  };

  const handleFilterChipRemove = (key: FilterChipKey, value?: string) => {
    switch (key) {
      case 'genre':
        patchFilters({ genreId: '' });
        break;
      case 'format':
        patchFilters({ format: '' });
        break;
      case 'difficulty':
        patchFilters({
          difficultyMin: DEFAULT_HOME_FEED_FILTERS.difficultyMin,
          difficultyMax: DEFAULT_HOME_FEED_FILTERS.difficultyMax,
        });
        break;
      case 'questionCount':
        patchFilters({
          minQuestions: DEFAULT_HOME_FEED_FILTERS.minQuestions,
          maxQuestions: DEFAULT_HOME_FEED_FILTERS.maxQuestions,
        });
        break;
      case 'keyword':
        patchFilters({ searchQuery: '' });
        break;
      case 'tag':
        patchFilters({
          tagChips: filters.tagChips.filter((chip) => chip !== value),
        });
        break;
      case 'playStatus':
        setPlayStatus('all');
        break;
      default:
        break;
    }
  };

  const {
    quizzes,
    loading: feedLoading,
    loadingMore,
    error: feedError,
    hasMore,
    loadMore,
  } = useExploreQuizFeed({
    mode: 'home',
    activeTab,
    userId: user?.id,
    filters,
    initialQuizzes,
  });

  const { playedQuizIds } = usePlayedQuizIds(user?.id);

  const displayQuizzes = useMemo(
    () => applyPlayStatusFilter(quizzes, playStatus, playedQuizIds),
    [quizzes, playStatus, playedQuizIds]
  );

  const loadMoreSentinelRef = useIntersectionLoadMore({
    onIntersect: loadMore,
    enabled: hasMore && !feedLoading && !loadingMore,
  });

  const autoLoadGuardRef = useRef<string | null>(null);

  useEffect(() => {
    const guardKey = `${playStatus}:${quizzes.length}:${hasMore}`;
    if (
      playStatus !== 'all' &&
      displayQuizzes.length < MIN_VISIBLE_AFTER_PLAY_FILTER &&
      hasMore &&
      !feedLoading &&
      !loadingMore &&
      autoLoadGuardRef.current !== guardKey
    ) {
      autoLoadGuardRef.current = guardKey;
      loadMore();
    }
  }, [
    displayQuizzes.length,
    feedLoading,
    hasMore,
    loadMore,
    loadingMore,
    playStatus,
    quizzes.length,
  ]);

  useEffect(() => {
    async function loadBookmarks() {
      if (authLoading) return;
      const uid = firebaseUser?.uid;
      if (uid && user) {
        try {
          const ids = await getBookmarkedQuizIds(uid);
          setBookmarkedIds(new Set(ids));
        } catch (e) {
          console.error('[SearchClient] ブックマーク取得エラー:', e);
        }
      } else {
        setBookmarkedIds(new Set());
        if (playStatus !== 'all') {
          setPlayStatus('all');
        }
      }
    }
    loadBookmarks();
  }, [user, firebaseUser, authLoading, playStatus, setPlayStatus]);

  const handleBookmarkToggle = async (quizId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const isAdded = await toggleBookmark(user.id, quizId, 'quiz');
      const nextBookmarks = new Set(bookmarkedIds);
      if (isAdded) {
        nextBookmarks.add(quizId);
      } else {
        nextBookmarks.delete(quizId);
      }
      setBookmarkedIds(nextBookmarks);
    } catch (error) {
      console.error('[SearchClient] ブックマーク切り替え失敗:', error);
    }
  };

  const handleCardClick = (quizId: string) => {
    router.push(`/quiz/${quizId}`);
  };

  return (
    <div data-testid="search-page">
      <ExploreSearchSection
        filters={filters}
        onFiltersChange={patchFilters}
        onClearAll={clearAll}
        tags={activeTags}
        tagsLoading={tagsLoading}
        tagsError={tagsError}
        tagLabelById={tagLabelById}
        playStatus={playStatus}
        onPlayStatusChange={setPlayStatus}
        playStatusDisabled={!user}
        showQuickSearch
        showExploreCarousels
        stickySearchBarTestId="search-search-bar-sticky"
        initialOpenFilters={openFilters}
        genres={genres}
        genresLoading={genresLoading}
        genresError={genresError}
        onGenresRetry={refetch}
        selectedGenreId={filters.genreId}
        onGenreSelect={handleGenreSelect}
        selectedFormat={filters.format}
        onFormatSelect={handleFormatSelect}
        activeFilterChipsSlot={
          <ActiveFilterChips
            filters={filters}
            playStatus={playStatus}
            tagLabelById={tagLabelById}
            genreLabelById={genreLabelById}
            onRemove={handleFilterChipRemove}
            onClearAll={clearAll}
          />
        }
      />

      <section className={styles.mainContent}>
        <div className={styles.tabBar}>
          <div
            className={`${styles.tab} ${activeTab === 'latest' ? styles.tabActive : ''}`}
            onClick={() => setTab('latest')}
          >
            新着順
          </div>
          <div
            className={`${styles.tab} ${activeTab === 'popular' ? styles.tabActive : ''}`}
            onClick={() => setTab('popular')}
          >
            人気順
          </div>
          <div
            className={`${styles.tab} ${activeTab === 'trending' ? styles.tabActive : ''}`}
            onClick={() => setTab('trending')}
          >
            トレンド
          </div>
          {user && (
            <div
              className={`${styles.tab} ${activeTab === 'timeline' ? styles.tabActive : ''}`}
              onClick={() => setTab('timeline')}
            >
              フォローTL
            </div>
          )}
        </div>

        {feedError && (
          <div style={{ textAlign: 'center', padding: '16px', color: 'var(--color-danger, #c62828)' }}>
            {feedError}
          </div>
        )}

        {feedLoading ? (
          <GridSkeleton data-testid="search-feed-skeleton" />
        ) : displayQuizzes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            該当するクイズが見つかりませんでした。
          </div>
        ) : (
          <>
            <div className={styles.grid}>
              {displayQuizzes.map((quiz) => (
                <QuizCard
                  key={quiz.id}
                  quiz={quiz}
                  genreDisplayName={
                    genres.find((g) => g.id === quiz.genre || g.id === quiz.canonicalGenreId)
                      ?.displayName
                  }
                  isBookmarked={bookmarkedIds.has(quiz.id)}
                  onBookmarkToggle={handleBookmarkToggle}
                  onPlayClick={handleCardClick}
                />
              ))}
            </div>
            {loadingMore && (
              <GridSkeleton data-testid="search-feed-load-more" />
            )}
            <div
              ref={loadMoreSentinelRef}
              data-testid="search-feed-load-more-sentinel"
              aria-hidden
              style={{ height: 1 }}
            />
          </>
        )}
      </section>
    </div>
  );
}
