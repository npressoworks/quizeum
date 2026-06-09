import React, { Suspense } from 'react';
import { listActiveGenres, listActiveTags, getQuizzesByGenre } from '@/services/quiz';
import { GenreExploreClient } from './genre-explore-client';
import { GridSkeleton } from '@/components/ui/grid-skeleton';

interface PageProps {
  params: Promise<{ genreName: string }>;
}

export default async function GenreExplorePage({ params }: PageProps) {
  const resolvedParams = await params;
  const genreId = decodeURIComponent(resolvedParams.genreName);

  return (
    <Suspense fallback={<GridSkeleton data-testid="explore-list-skeleton" />}>
      <GenreExploreDataLoader genreId={genreId} />
    </Suspense>
  );
}

interface LoaderProps {
  genreId: string;
}

async function GenreExploreDataLoader({ genreId }: LoaderProps) {
  try {
    const [genres, tags, quizzes] = await Promise.all([
      listActiveGenres(),
      listActiveTags(),
      getQuizzesByGenre(genreId, 20, 'latest'),
    ]);

    const plainGenres = JSON.parse(JSON.stringify(genres));
    const plainTags = JSON.parse(JSON.stringify(tags));
    const plainQuizzes = JSON.parse(JSON.stringify(quizzes));

    return (
      <GenreExploreClient
        genreId={genreId}
        initialGenres={plainGenres}
        initialTags={plainTags}
        initialQuizzes={plainQuizzes}
      />
    );
  } catch (e) {
    console.error('[GenreExploreDataLoader] 初期データ取得失敗:', e);
    return (
      <div className="py-10 text-center text-destructive">
        データの読み込みに失敗しました。ページを再読み込みしてください。
      </div>
    );
  }
}
