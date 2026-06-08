/**
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react';
import { usePlayState } from '@/hooks/usePlayState';
import { Question } from '@/types';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
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

const questions: Question[] = [
  {
    id: 'q1',
    type: 'text-input',
    questionText: 'Q1',
    correctTextAnswerList: ['answer1'],
  },
  {
    id: 'q2',
    type: 'text-input',
    questionText: 'Q2',
    correctTextAnswerList: ['answer2'],
  },
] as Question[];

describe('usePlayState manualAdvance', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('manualAdvance 時は回答後に currentIdx が進まない', () => {
    const { result } = renderHook(() =>
      usePlayState({
        quizId: 'quiz-1',
        userId: 'user-1',
        mode: 'normal',
        questions,
        persistSession: false,
        manualAdvance: true,
      })
    );

    act(() => {
      result.current.recordAnswer('wrong');
    });

    expect(result.current.currentIdx).toBe(0);
    expect(result.current.feedbackPending).toBe(true);
    expect(result.current.answeredIds).toContain('q1');
  });

  test('advanceToNext で次の問題へ進む', () => {
    const { result } = renderHook(() =>
      usePlayState({
        quizId: 'quiz-1',
        userId: 'user-1',
        mode: 'normal',
        questions,
        persistSession: false,
        manualAdvance: true,
      })
    );

    act(() => {
      result.current.recordAnswer('wrong');
      result.current.advanceToNext();
    });

    expect(result.current.currentIdx).toBe(1);
    expect(result.current.feedbackPending).toBe(false);
  });

  test('スキップ相当の空回答は不正解として記録される', () => {
    const { result } = renderHook(() =>
      usePlayState({
        quizId: 'quiz-1',
        userId: 'user-1',
        mode: 'normal',
        questions,
        persistSession: false,
        manualAdvance: true,
      })
    );

    act(() => {
      result.current.recordAnswer('');
    });

    expect(result.current.failedIds).toContain('q1');
    expect(result.current.score).toBe(0);
  });
});
