'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useMyQuizPool } from '@/hooks/useMyQuizPool';
import { useActiveGenres } from '@/hooks/useActiveGenres';
import { useActiveTags } from '@/hooks/useActiveTags';
import { MyQuizSourcePanel } from '@/components/my-quiz/my-quiz-source-panel';
import { MyQuizSearchSection } from '@/components/my-quiz/my-quiz-search-section';
import { MyQuizFilteredTable } from '@/components/my-quiz/my-quiz-filtered-table';
import { MyQuizPlaySettings } from '@/components/my-quiz/my-quiz-play-settings';
import { MyQuizPreviewBar } from '@/components/my-quiz/my-quiz-preview-bar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export function MyQuizClient() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { genres, loading: genresLoading, error: genresError, refetch: refetchGenres, genreLabelById } =
    useActiveGenres();
  const { tags, loading: tagsLoading, error: tagsError, tagLabelById } = useActiveTags();
  const pool = useMyQuizPool(user?.id);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?redirect=%2Fmy-quiz');
    }
  }, [authLoading, user, router]);

  if (!authLoading && !user) {
    return null;
  }

  return (
    <div className="flex flex-col gap-5" data-testid="my-quiz-content">
      {pool.error && (
        <Alert variant="destructive" data-testid="my-quiz-pool-error">
          <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
            <p>{pool.error}</p>
            <Button type="button" variant="secondary" size="sm" onClick={() => pool.refetch()}>
              再試行
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <MyQuizSourcePanel flags={pool.sourceFlags} onChange={pool.setSourceFlags} />
      <MyQuizSearchSection
        filters={pool.filters}
        onChange={pool.setFilters}
        genres={genres}
        genresLoading={genresLoading}
        genresError={genresError}
        onGenresRetry={refetchGenres}
        genreLabelById={genreLabelById}
        tags={tags}
        tagsLoading={tagsLoading}
        tagsError={tagsError}
        tagLabelById={tagLabelById}
      />
      <MyQuizFilteredTable
        filters={pool.filters}
        candidates={pool.filteredCandidates}
        genreLabelById={genreLabelById}
        hasAnySource={pool.hasAnySource}
        poolLoading={pool.loading}
      />
      <MyQuizPlaySettings
        settings={pool.playSettings}
        filteredCount={pool.filteredCount}
        effectivePlayCount={pool.effectivePlayCount}
        poolLoading={pool.loading}
        onChange={pool.setPlaySettings}
      />
      <MyQuizPreviewBar
        filteredCount={pool.filteredCount}
        effectivePlayCount={pool.effectivePlayCount}
        hasAnySource={pool.hasAnySource}
        poolLoading={pool.loading}
        buildEntries={pool.buildEntries}
      />
    </div>
  );
}
