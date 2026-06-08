/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { usePlayState, isSegmentTicking } from '@/hooks/usePlayState';
import type { Question } from '@/types';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

const baseQuestion: Question = {
  id: 'q1',
  type: 'text-input',
  questionText: 'テスト問題',
  explanation: '',
  imageUrl: null,
  hint: null,
  correctTextAnswerList: ['answer'],
  choices: undefined,
  sortingItems: undefined,
  limitTime: null,
  textInputMode: 'text',
  textInputCharCount: undefined,
  truthKeywords: undefined,
  aiContextDetails: undefined,
  correctCount: 0,
  incorrectCount: 0,
};

const quickPressQuestion: Question = {
  ...baseQuestion,
  id: 'qp1',
  type: 'quick-press',
  correctTextAnswerList: [btoa(unescape(encodeURIComponent('tokyo')))],
  limitTime: 30,
};

describe('isSegmentTicking', () => {
  test('早押し pre_reading では tick しない', () => {
    expect(
      isSegmentTicking({ kind: 'quick-press', phase: 'pre_reading' }, false)
    ).toBe(false);
  });

  test('早押し reading では tick する', () => {
    expect(
      isSegmentTicking({ kind: 'quick-press', phase: 'reading' }, false)
    ).toBe(true);
  });

  test('feedback 中は tick しない', () => {
    expect(isSegmentTicking({ kind: 'standard' }, true)).toBe(false);
  });
});

describe('usePlayState 区間累計経過時間', () => {
  const questions = [quickPressQuestion];
  const preReadingPolicy = { kind: 'quick-press' as const, phase: 'pre_reading' as const };
  const readingPolicy = { kind: 'quick-press' as const, phase: 'reading' as const };
  const postReadingPolicy = { kind: 'quick-press' as const, phase: 'post_reading' as const };
  const feedbackPolicy = { kind: 'quick-press' as const, phase: 'feedback' as const };

  beforeEach(() => {
    jest.useFakeTimers({ legacyFakeTimers: false });
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('早押し pre_reading 中は経過時間が加算されない', () => {
    const { result } = renderHook(() =>
      usePlayState({
        quizId: 'quiz1',
        userId: 'user1',
        mode: 'normal',
        questions,
        persistSession: false,
        manualAdvance: true,
        elapsedPolicy: preReadingPolicy,
      })
    );

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(result.current.elapsedSeconds).toBe(0);
  });

  test('早押し reading 中は経過時間が加算される', () => {
    const { result, rerender } = renderHook(
      ({ policy }) =>
        usePlayState({
          quizId: 'quiz1',
          userId: 'user1',
          mode: 'normal',
          questions,
          persistSession: false,
          manualAdvance: true,
          elapsedPolicy: policy,
        }),
      {
        initialProps: {
          policy: readingPolicy,
        },
      }
    );

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(result.current.elapsedSeconds).toBe(3);

    rerender({
      policy: feedbackPolicy,
    });

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(result.current.elapsedSeconds).toBe(3);
  });

  test('早押し問題表示直後は limitTime カウントダウンが始まらない', () => {
    const { result } = renderHook(() =>
      usePlayState({
        quizId: 'quiz1',
        userId: 'user1',
        mode: 'normal',
        questions,
        persistSession: false,
        manualAdvance: true,
        elapsedPolicy: preReadingPolicy,
      })
    );

    expect(result.current.timeLeft).toBeNull();
  });

  test('beginLimitCountdown で limitTime がセットされる', () => {
    const { result } = renderHook(() =>
      usePlayState({
        quizId: 'quiz1',
        userId: 'user1',
        mode: 'normal',
        questions,
        persistSession: false,
        manualAdvance: true,
        elapsedPolicy: postReadingPolicy,
      })
    );

    act(() => {
      result.current.beginLimitCountdown();
    });

    expect(result.current.timeLeft).toBe(30);
  });

  test('回答確定後は残り時間カウントが止まる', () => {
    const { result } = renderHook(() =>
      usePlayState({
        quizId: 'quiz1',
        userId: 'user1',
        mode: 'normal',
        questions,
        persistSession: false,
        manualAdvance: true,
        elapsedPolicy: postReadingPolicy,
      })
    );

    act(() => {
      result.current.beginLimitCountdown();
    });

    expect(result.current.timeLeft).toBe(30);

    act(() => {
      result.current.recordAnswer('');
    });

    expect(result.current.feedbackPending).toBe(true);
    expect(result.current.timeLeft).toBeNull();

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(result.current.timeLeft).toBeNull();
  });
});
