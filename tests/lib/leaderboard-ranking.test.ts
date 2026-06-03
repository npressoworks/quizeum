import {
  compareLeaderboardRecords,
  isStrictlyBetter,
  mergeUserEntryAndTakeTop5,
  resolveLeaderboardBoard,
} from '../../src/lib/leaderboard-ranking';
import type { LeaderboardRecord } from '../../src/types';

const ts = (n: number) => new Date(n);

function entry(
  userId: string,
  score: number,
  elapsedSeconds: number
): LeaderboardRecord {
  return {
    userId,
    displayName: userId,
    score,
    elapsedSeconds,
    completedAt: ts(0),
  };
}

describe('leaderboard-ranking', () => {
  test('compareLeaderboardRecords: 正解数優先、同点はタイム短い方が上位', () => {
    const better = entry('a', 8, 120);
    const worseScore = entry('b', 7, 10);
    const sameScoreFaster = entry('c', 8, 60);

    expect(compareLeaderboardRecords(better, worseScore)).toBeLessThan(0);
    expect(compareLeaderboardRecords(better, sameScoreFaster)).toBeGreaterThan(0);
  });

  test('isStrictlyBetter: 同点タイムでは優位にならない', () => {
    const base = entry('u', 5, 30);
    const same = entry('u', 5, 30);
    expect(isStrictlyBetter(same, base)).toBe(false);
  });

  test('mergeUserEntryAndTakeTop5: 非優位記録では差し替えない', () => {
    const existing = [
      entry('u1', 10, 50),
      entry('u2', 9, 40),
    ];
    const worse = entry('u1', 8, 10);
    const result = mergeUserEntryAndTakeTop5(existing, 'u1', worse);
    expect(result.find((e) => e.userId === 'u1')?.score).toBe(10);
  });

  test('mergeUserEntryAndTakeTop5: 6件目は top5 に切り詰められる', () => {
    const existing = [
      entry('u1', 10, 10),
      entry('u2', 9, 10),
      entry('u3', 8, 10),
      entry('u4', 7, 10),
      entry('u5', 6, 10),
    ];
    const newcomer = entry('u6', 11, 5);
    const result = mergeUserEntryAndTakeTop5(existing, 'u6', newcomer);
    expect(result).toHaveLength(5);
    expect(result[0].userId).toBe('u6');
    expect(result.some((e) => e.userId === 'u5')).toBe(false);
  });

  test('resolveLeaderboardBoard', () => {
    expect(resolveLeaderboardBoard(0)).toBe('firstPlay');
    expect(resolveLeaderboardBoard(1)).toBe('replay');
    expect(resolveLeaderboardBoard(3)).toBe('replay');
  });
});
