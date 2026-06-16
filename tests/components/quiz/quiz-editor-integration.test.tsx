/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import React from 'react';

// Polyfill for TransformStream and TextEncoder in jsdom/node test environment
if (typeof global.TransformStream === 'undefined') {
  const { TransformStream } = require('node:stream/web');
  global.TransformStream = TransformStream;
}
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('node:util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}
import { render, screen } from '@testing-library/react';
import { QuizEditorContent } from '@/components/quiz/quiz-editor';

const mockSearchParams = new URLSearchParams();
const mockUser = { id: 'uid-pro', displayName: 'Pro User', avatarUrl: '' };
const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn() };

// Auth / Router などのモック
jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => mockSearchParams,
}));

jest.mock('@/lib/firebase/config', () => ({
  auth: {
    currentUser: {
      getIdToken: jest.fn().mockResolvedValue('mock-token'),
    },
  },
  db: {},
  storage: {},
}));

jest.mock('@/context/auth-context', () => ({
  useAuth: () => ({
    user: mockUser,
    loading: false,
  }),
}));

jest.mock('@/lib/pricing-entitlement', () => ({
  hasUnlimitedAiQuestionsForUser: () => true, // Proユーザーに設定
}));

// Firestore / Service のモック
jest.mock('@/services/quiz', () => ({
  getQuiz: jest.fn(),
  saveQuiz: jest.fn(),
  updateQuiz: jest.fn(),
}));

jest.mock('@/hooks/useActiveGenres', () => ({
  useActiveGenres: () => ({ genres: [], loading: false, error: null, refetch: jest.fn() }),
}));

describe('QuizEditor AI Chat Integration', () => {
  it('Pro ユーザー向けに「AIで作問開始」と「全問包括チェック」ボタンが表示されること', () => {
    render(
      <QuizEditorContent
        quizId={undefined}
        initialGenres={[]}
        initialQuiz={null}
      />
    );

    // まだ quiz-editor.tsx に追加していないため、このテストは失敗する（RED）
    expect(screen.getByRole('button', { name: 'AIで作問開始' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '全問包括チェック' })).toBeInTheDocument();
  });
});
