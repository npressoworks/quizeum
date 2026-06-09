'use client';

import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Quiz } from '@/types';
import { QuizCard } from '@/components/quiz/quiz-card';
import { useAuth } from '@/context/auth-context';
import { toggleBookmark } from '@/services/bookmark';
import styles from './explore-carousel.module.css';

export interface QuizCarouselProps {
  quizzes: Quiz[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  emptyMessage?: string;
  genreLabelById?: Map<string, string>;
}

export function QuizCarousel({
  quizzes,
  loading,
  error,
  onRetry,
  emptyMessage = '表示できるクイズがありません。',
  genreLabelById,
}: QuizCarouselProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  const handleBookmarkToggle = useCallback(
    async (quizId: string) => {
      if (!user) {
        router.push('/login');
        return;
      }
      try {
        const currentlyBookmarked = bookmarkedIds.has(quizId);
        await toggleBookmark(user.id, quizId, 'quiz');
        setBookmarkedIds((prev) => {
          const next = new Set(prev);
          if (currentlyBookmarked) next.delete(quizId);
          else next.add(quizId);
          return next;
        });
      } catch (err) {
        console.error('[QuizCarousel] bookmark toggle failed:', err);
      }
    },
    [user, bookmarkedIds, router]
  );

  const handlePlayClick = useCallback(
    (quizId: string) => {
      router.push(`/quiz/${quizId}`);
    },
    [router]
  );

  if (loading) {
    return <p className={styles.status}>クイズを読み込み中...</p>;
  }

  if (error) {
    return (
      <p className={`${styles.status} ${styles.error}`} role="alert">
        {error}
        {onRetry && (
          <button type="button" className={styles.retryBtn} onClick={onRetry}>
            再試行
          </button>
        )}
      </p>
    );
  }

  if (quizzes.length === 0) {
    return <p className={styles.status}>{emptyMessage}</p>;
  }

  return (
    <div className={`${styles.carousel} ${styles.quizCarousel}`} data-testid="quiz-carousel">
      {quizzes.map((quiz) => (
        <div key={quiz.id} className={styles.quizSlot}>
          <QuizCard
            quiz={quiz}
            href={quiz.id ? `/quiz/${quiz.id}` : undefined}
            genreDisplayName={genreLabelById?.get(quiz.genre)}
            isBookmarked={bookmarkedIds.has(quiz.id ?? '')}
            onBookmarkToggle={handleBookmarkToggle}
            onPlayClick={handlePlayClick}
          />
        </div>
      ))}
    </div>
  );
}
