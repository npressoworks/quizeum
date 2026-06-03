import type { LeaderboardRecord, Quiz } from '@/types';

export type LeaderboardBoard = 'firstPlay' | 'replay';

/** a が b より上位なら負、同順位なら 0、下位なら正（Array.sort 用） */
export function compareLeaderboardRecords(
  a: Pick<LeaderboardRecord, 'score' | 'elapsedSeconds'>,
  b: Pick<LeaderboardRecord, 'score' | 'elapsedSeconds'>
): number {
  if (b.score !== a.score) {
    return b.score - a.score;
  }
  return a.elapsedSeconds - b.elapsedSeconds;
}

export function isStrictlyBetter(
  candidate: Pick<LeaderboardRecord, 'score' | 'elapsedSeconds'>,
  existing: Pick<LeaderboardRecord, 'score' | 'elapsedSeconds'>
): boolean {
  if (candidate.score > existing.score) return true;
  if (candidate.score < existing.score) return false;
  return candidate.elapsedSeconds < existing.elapsedSeconds;
}

export function mergeUserEntryAndTakeTop5(
  entries: LeaderboardRecord[],
  userId: string,
  incoming: LeaderboardRecord
): LeaderboardRecord[] {
  const existing = entries.find((e) => e.userId === userId);
  const others = entries.filter((e) => e.userId !== userId);

  const recordToPlace =
    existing && !isStrictlyBetter(incoming, existing) ? existing : incoming;

  return [...others, recordToPlace]
    .sort((a, b) => compareLeaderboardRecords(a, b))
    .slice(0, 5);
}

export function resolveLeaderboardBoard(priorCompletedAttemptCount: number): LeaderboardBoard {
  return priorCompletedAttemptCount === 0 ? 'firstPlay' : 'replay';
}

export function getLeaderboardFirstPlay(quiz: Quiz): LeaderboardRecord[] {
  if (quiz.leaderboardFirstPlay?.length) {
    return [...quiz.leaderboardFirstPlay];
  }
  return [...(quiz.leaderboard ?? [])];
}

export function getLeaderboardReplay(quiz: Quiz): LeaderboardRecord[] {
  return [...(quiz.leaderboardReplay ?? [])];
}

export function buildLeaderboardFieldUpdates(
  quiz: Quiz,
  board: LeaderboardBoard,
  entry: LeaderboardRecord
): {
  leaderboardFirstPlay?: LeaderboardRecord[];
  leaderboardReplay?: LeaderboardRecord[];
} {
  if (board === 'firstPlay') {
    const merged = mergeUserEntryAndTakeTop5(getLeaderboardFirstPlay(quiz), entry.userId, entry);
    return { leaderboardFirstPlay: merged };
  }
  const merged = mergeUserEntryAndTakeTop5(getLeaderboardReplay(quiz), entry.userId, entry);
  return { leaderboardReplay: merged };
}

export const EMPTY_LEADERBOARD: LeaderboardRecord[] = [];
