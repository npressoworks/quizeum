import {
  setOptimisticAttempt,
  getOptimisticAttempt,
  clearOptimisticAttempt,
} from '@/lib/optimistic-attempt';
import { PendingSyncAttempt } from '@/services/attempt-session';

const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(globalThis, 'sessionStorage', {
  value: sessionStorageMock,
  configurable: true,
});

describe('optimistic-attempt', () => {
  const sample: PendingSyncAttempt = {
    localId: 'local-1',
    quizId: 'quiz-1',
    userId: 'user-1',
    mode: 'normal',
    score: 3,
    totalQuestions: 5,
    elapsedSeconds: 120,
    failedQuestionIds: ['q2'],
    questionAnswers: [],
    aiTurnCount: 0,
    aiTurnLimit: null,
    completedAt: '2026-06-08T12:00:00.000Z',
  };

  beforeEach(() => {
    sessionStorageMock.clear();
    jest.clearAllMocks();
  });

  test('保存した楽観的 attempt を読み取れる', () => {
    setOptimisticAttempt('local-1', sample);
    expect(getOptimisticAttempt('local-1')).toEqual(sample);
  });

  test('削除後は読み取れない', () => {
    setOptimisticAttempt('local-1', sample);
    clearOptimisticAttempt('local-1');
    expect(getOptimisticAttempt('local-1')).toBeNull();
  });
});
