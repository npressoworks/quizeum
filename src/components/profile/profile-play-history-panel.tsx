'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { History, RefreshCw } from 'lucide-react';
import {
  fetchPlayHistoryPage,
  getAttemptModeLabel,
  PlayHistoryApiError,
} from '@/lib/play-history-client';
import type { PlayHistoryEntry } from '@/types';
import panelStyles from './profile-play-history-panel.module.css';

export interface ProfilePlayHistoryPanelProps {
  /** プレイ履歴タブが選択されているとき true */
  isActive: boolean;
}

export function ProfilePlayHistoryPanel({ isActive }: ProfilePlayHistoryPanelProps) {
  const [items, setItems] = useState<PlayHistoryEntry[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const initialFetched = useRef(false);

  const loadPage = useCallback(async (cursor?: string | null, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setError(null);
      setErrorStatus(null);
    }

    try {
      const page = await fetchPlayHistoryPage({ cursor: cursor ?? undefined });
      setItems((prev) => (append ? [...prev, ...page.items] : page.items));
      setNextCursor(page.nextCursor);
    } catch (e) {
      const message =
        e instanceof PlayHistoryApiError
          ? e.message
          : 'プレイ履歴の取得に失敗しました';
      const status = e instanceof PlayHistoryApiError ? e.status : 500;
      setError(message);
      setErrorStatus(status);
      if (!append) {
        setItems([]);
        setNextCursor(null);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (!isActive || initialFetched.current) return;
    initialFetched.current = true;
    void loadPage();
  }, [isActive, loadPage]);

  const handleLoadMore = () => {
    if (!nextCursor || loadingMore) return;
    void loadPage(nextCursor, true);
  };

  const handleRetry = () => {
    initialFetched.current = true;
    void loadPage();
  };

  if (!isActive) {
    return null;
  }

  return (
    <div className={panelStyles.panel} data-testid="play-history-section">
      {loading && items.length === 0 && (
        <div className={panelStyles.loading}>
          <History size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          プレイ履歴を読み込み中...
        </div>
      )}

      {error && items.length === 0 && (
        <div className={panelStyles.errorState}>
          <p>{error}</p>
          {errorStatus === 401 ? (
            <Link href="/login" className="btn btn-primary" style={{ marginTop: 12 }}>
              ログインする
            </Link>
          ) : (
            <button
              type="button"
              className={`btn btn-secondary ${panelStyles.retryBtn}`}
              onClick={handleRetry}
            >
              <RefreshCw size={16} style={{ marginRight: 6 }} />
              再試行
            </button>
          )}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className={panelStyles.emptyState}>まだプレイ履歴がありません</div>
      )}

      {items.length > 0 && (
        <ul className={panelStyles.list}>
          {items.map((entry) => (
            <li
              key={entry.attemptId}
              className={panelStyles.entry}
              data-testid="play-history-entry"
            >
              <div className={panelStyles.entryMain}>
                <Link
                  href={`/quiz/${entry.quizId}`}
                  className={panelStyles.quizLink}
                >
                  {entry.quizTitle}
                </Link>
                <span className={panelStyles.score}>
                  {entry.score} / {entry.totalQuestions} 正解
                </span>
              </div>
              <div className={panelStyles.metaRow}>
                <span className={panelStyles.modeBadge}>
                  {getAttemptModeLabel(entry.mode)}
                </span>
                <span>{entry.elapsedSeconds} 秒</span>
                <span>
                  {entry.completedAt.toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <Link
                  href={`/quiz/${entry.quizId}`}
                  className="btn btn-secondary"
                  style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                >
                  もう一度プレイ
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      {nextCursor && !error && (
        <div className={panelStyles.loadMoreWrap}>
          <button
            type="button"
            className="btn btn-secondary"
            data-testid="play-history-load-more"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? '読み込み中...' : 'もっと見る'}
          </button>
        </div>
      )}
    </div>
  );
}
