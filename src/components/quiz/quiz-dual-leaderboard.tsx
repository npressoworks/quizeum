'use client';

import React, { useMemo, useState } from 'react';
import { Trophy } from 'lucide-react';
import { getLeaderboardFirstPlay, getLeaderboardReplay } from '@/lib/leaderboard-ranking';
import type { LeaderboardRecord, Quiz } from '@/types';
import styles from './quiz-dual-leaderboard.module.css';

export interface QuizDualLeaderboardProps {
  quiz: Quiz;
}

type BoardTab = 'firstPlay' | 'replay';

function formatCompletedAt(value: Date): string {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('ja-JP');
}

function rankClass(index: number): string {
  if (index === 0) return styles.rank1;
  if (index === 1) return styles.rank2;
  if (index === 2) return styles.rank3;
  return '';
}

function LeaderboardTable({
  entries,
  tableTestId,
  rowKeyPrefix,
}: {
  entries: LeaderboardRecord[];
  tableTestId: string;
  rowKeyPrefix: string;
}) {
  if (entries.length === 0) {
    return <div className={styles.emptyLeaderboard}>まだ記録がありません。</div>;
  }

  return (
    <div className={styles.tableWrapper} data-testid={tableTestId}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>順位</th>
            <th className={styles.th}>ユーザー名</th>
            <th className={styles.th}>正解数</th>
            <th className={styles.th}>合計時間</th>
            <th className={styles.th}>達成日</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((record, index) => (
            <tr
              key={`${rowKeyPrefix}-${record.userId}-${index}`}
              data-testid="leaderboard-entry"
            >
              <td className={`${styles.td} ${rankClass(index)}`}>#{index + 1}</td>
              <td className={styles.td}>{record.displayName || '名無しさん'}</td>
              <td className={styles.td}>{record.score}</td>
              <td className={styles.td}>{record.elapsedSeconds} 秒</td>
              <td className={styles.td}>{formatCompletedAt(record.completedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function QuizDualLeaderboard({ quiz }: QuizDualLeaderboardProps) {
  const [activeTab, setActiveTab] = useState<BoardTab>('firstPlay');

  const firstPlayEntries = useMemo(
    () => getLeaderboardFirstPlay(quiz).slice(0, 5),
    [quiz]
  );
  const replayEntries = useMemo(
    () => getLeaderboardReplay(quiz).slice(0, 5),
    [quiz]
  );

  return (
    <section className={styles.leaderboardSection} data-testid="quiz-leaderboard">
      <div className={styles.sectionHeader}>
        <Trophy size={20} aria-hidden />
        クイズランキング
      </div>

      <div className={styles.tabBar} role="tablist" aria-label="クイズランキングの種類">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'firstPlay'}
          className={`${styles.tab} ${activeTab === 'firstPlay' ? styles.tabActive : ''}`}
          data-testid="quiz-leaderboard-tab-first"
          onClick={() => setActiveTab('firstPlay')}
        >
          初回プレイランキング（上位5名）
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'replay'}
          className={`${styles.tab} ${activeTab === 'replay' ? styles.tabActive : ''}`}
          data-testid="quiz-leaderboard-tab-replay"
          onClick={() => setActiveTab('replay')}
        >
          リプレイランキング（上位5名）
        </button>
      </div>

      <div role="tabpanel">
        {activeTab === 'firstPlay' ? (
          <LeaderboardTable
            entries={firstPlayEntries}
            tableTestId="highscore-leaderboard"
            rowKeyPrefix="first"
          />
        ) : (
          <LeaderboardTable
            entries={replayEntries}
            tableTestId="replay-leaderboard"
            rowKeyPrefix="replay"
          />
        )}
      </div>
    </section>
  );
}
