import { auth } from '@/lib/firebase/config';
import type { Attempt, PlayHistoryEntry, PlayHistoryPage } from '@/types';

export class PlayHistoryApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = 'PlayHistoryApiError';
  }
}

const MODE_LABELS: Record<Attempt['mode'], string> = {
  normal: '通常モード',
  exam: '模擬試験',
  flashcard: 'フラッシュカード',
  review: '弱点克服',
  list: 'リストプレイ',
  'test-play': 'テストプレイ',
};

export function getAttemptModeLabel(mode: Attempt['mode']): string {
  return MODE_LABELS[mode] ?? mode;
}

function parsePlayHistoryEntry(raw: {
  attemptId: string;
  quizId: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  mode: Attempt['mode'];
  completedAt: string | Date;
  elapsedSeconds: number;
}): PlayHistoryEntry {
  const completedAt =
    raw.completedAt instanceof Date
      ? raw.completedAt
      : new Date(raw.completedAt);
  return {
    attemptId: raw.attemptId,
    quizId: raw.quizId,
    quizTitle: raw.quizTitle,
    score: raw.score,
    totalQuestions: raw.totalQuestions,
    mode: raw.mode,
    completedAt,
    elapsedSeconds: raw.elapsedSeconds,
  };
}

export async function fetchPlayHistoryPage(params: {
  cursor?: string | null;
  limit?: number;
}): Promise<PlayHistoryPage> {
  const token = await auth.currentUser?.getIdToken();
  if (!token) {
    throw new PlayHistoryApiError('ログインが必要です', 401);
  }

  const searchParams = new URLSearchParams();
  if (params.cursor) {
    searchParams.set('cursor', params.cursor);
  }
  if (params.limit != null) {
    searchParams.set('limit', String(params.limit));
  }
  const qs = searchParams.toString();
  const url = qs ? `/api/user/play-history?${qs}` : '/api/user/play-history';

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const body = (await res.json().catch(() => ({}))) as {
    message?: string;
    items?: Parameters<typeof parsePlayHistoryEntry>[0][];
    nextCursor?: string | null;
  };

  if (!res.ok) {
    throw new PlayHistoryApiError(
      body.message ?? 'プレイ履歴の取得に失敗しました',
      res.status
    );
  }

  const items = (body.items ?? []).map(parsePlayHistoryEntry);
  return {
    items,
    nextCursor: body.nextCursor ?? null,
  };
}
