import { searchQuizzes } from '../../src/services/quiz';
import { getDocs } from 'firebase/firestore';
import type { Quiz } from '../../src/types';

jest.mock('../../src/lib/firebase/config', () => ({ db: {} }));

jest.mock('firebase/firestore', () => {
  const original = jest.requireActual('firebase/firestore');
  return {
    ...original,
    doc: jest.fn((ref, ...paths) => ({ id: paths[paths.length - 1] || 'auto-id', path: paths.join('/') })),
    collection: jest.fn((_db, path) => ({ path })),
    query: jest.fn((ref, ...clauses) => ({ ref, clauses })),
    where: jest.fn((field, op, value) => ({ field, op, value })),
    limit: jest.fn((n) => ({ limit: n })),
    orderBy: jest.fn((field, dir) => ({ field, dir })),
    getDocs: jest.fn(),
    getDoc: jest.fn(),
  };
});

jest.mock('../../src/lib/metadata-resolution', () => {
  const actual = jest.requireActual('../../src/lib/metadata-resolution');
  return {
    ...actual,
    resolveCanonicalGenreId: jest.fn((genreId: string) => Promise.resolve(genreId)),
    expandGenreIdsForQuery: jest.fn((genreId: string) => Promise.resolve([genreId])),
    chunkIdsForInQuery: jest.fn((ids: string[]) => [ids]),
    dedupeQuizzesById: jest.fn((quizzes: Quiz[]) => {
      const map = new Map<string, Quiz>();
      quizzes.forEach((q) => map.set(q.id, q));
      return Array.from(map.values());
    }),
    sortQuizzesForList: jest.fn((quizzes: Quiz[]) => quizzes),
    resolveCanonicalTagIds: jest.fn((tags: string[]) => Promise.resolve(tags)),
  };
});

function makeQuiz(overrides: Partial<Quiz> = {}): Quiz {
  return {
    id: 'q-default',
    authorId: 'author-1',
    authorName: '作者',
    authorAvatar: '',
    title: 'テストクイズ',
    description: '説明',
    thumbnailUrl: null,
    difficulty: 5,
    genre: 'general',
    tags: [],
    originalTags: [],
    questionIds: [],
    questions: [],
    questionCount: 5,
    status: 'published',
    flagsCount: 0,
    playCount: 1,
    bookmarksCount: 0,
    positiveCount: 0,
    negativeCount: 0,
    tempPositiveCount: 0,
    tempNegativeCount: 0,
    reviewScore: null,
    reviewBadge: null,
    isReviewMasked: false,
    activeResetRequestId: null,
    canonicalGenreId: 'general',
    canonicalTagIds: [],
    leaderboardFirstPlay: [],
    leaderboardReplay: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function mockTagQueryResults(quizzes: Quiz[]) {
  (getDocs as jest.Mock).mockImplementation((q: { clauses?: Array<{ field: string; op: string; value?: unknown }> }) => {
    const clauses = q.clauses ?? [];
    const isCanonicalTag = clauses.some(
      (c) => c.field === 'canonicalTagIds' && c.op === 'array-contains'
    );
    const isLegacyTag = clauses.some((c) => c.field === 'tags' && c.op === 'array-contains');
    const isLatest =
      clauses.some((c) => c.field === 'status' && c.op === '==') &&
      !isCanonicalTag &&
      !isLegacyTag &&
      !clauses.some((c) => c.field === 'authorName');

    if (isCanonicalTag || isLegacyTag) {
      const tagValue = clauses.find(
        (c) =>
          (c.field === 'canonicalTagIds' && c.op === 'array-contains') ||
          (c.field === 'tags' && c.op === 'array-contains')
      )?.value as string;

      const matched = quizzes.filter((quiz) => {
        if (quiz.canonicalTagIds?.includes(tagValue)) return true;
        if (quiz.tags?.includes(tagValue)) return true;
        return false;
      });

      return Promise.resolve({
        docs: matched.map((data) => ({ id: data.id, data: () => data })),
      });
    }

    if (isLatest) {
      return Promise.resolve({
        docs: quizzes.map((data) => ({ id: data.id, data: () => data })),
      });
    }

    return Promise.resolve({ docs: [] });
  });
}

describe('searchQuizzes (タグ AND 複合検索)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('タグのみ（単一）で該当クイズを返す', async () => {
    const quiz = makeQuiz({ id: 'q1', canonicalTagIds: ['js'] });
    mockTagQueryResults([quiz]);

    const results = await searchQuizzes('', { tags: ['js'] });

    expect(results.map((r) => r.id)).toEqual(['q1']);
  });

  test('複数タグ AND で積集合を返す', async () => {
    const both = makeQuiz({ id: 'both', canonicalTagIds: ['js', 'web'] });
    const jsOnly = makeQuiz({ id: 'js-only', canonicalTagIds: ['js'] });
    mockTagQueryResults([both, jsOnly]);

    const results = await searchQuizzes('', { tags: ['js', 'web'] });

    expect(results.map((r) => r.id)).toEqual(['both']);
  });

  test('重複タグは除去される', async () => {
    const quiz = makeQuiz({ id: 'q1', canonicalTagIds: ['js'] });
    mockTagQueryResults([quiz]);

    const results = await searchQuizzes('', { tags: ['js', 'JS', '#js'] });

    expect(results.map((r) => r.id)).toEqual(['q1']);
  });

  test('キーワードとタグを AND 合成する', async () => {
    const match = makeQuiz({
      id: 'match',
      title: 'JavaScript 入門',
      canonicalTagIds: ['js'],
      tags: ['js'],
    });
    const wrongTag = makeQuiz({
      id: 'wrong-tag',
      title: 'JavaScript 応用',
      canonicalTagIds: ['python'],
      tags: ['python'],
    });

    (getDocs as jest.Mock).mockImplementation((q: { clauses?: Array<{ field: string; op: string; value?: unknown }> }) => {
      const clauses = q.clauses ?? [];
      const isTagQuery = clauses.some((c) => c.field === 'tags' && c.op === 'array-contains');
      const isAuthorQuery = clauses.some((c) => c.field === 'authorName');
      const pool = [match, wrongTag];

      if (isTagQuery || isAuthorQuery) {
        return Promise.resolve({
          docs: pool.map((data) => ({ id: data.id, data: () => data })),
        });
      }

      return Promise.resolve({
        docs: pool.map((data) => ({ id: data.id, data: () => data })),
      });
    });

    const results = await searchQuizzes('javascript', { tags: ['js'] });

    expect(results.map((r) => r.id)).toEqual(['match']);
  });

  test('legacy tags フォールバックでタグ一致する', async () => {
    const quiz = makeQuiz({
      id: 'legacy',
      tags: ['ウミガメのスープ'],
      canonicalTagIds: [],
    });
    mockTagQueryResults([quiz]);

    const results = await searchQuizzes('', { tags: ['ウミガメのスープ'] });

    expect(results.map((r) => r.id)).toEqual(['legacy']);
  });

  test('tags 未指定時は従来挙動（空キーワード + genreId）', async () => {
    const genreQuiz = makeQuiz({ id: 'genre-q', genre: 'science', canonicalGenreId: 'science' });

    (getDocs as jest.Mock).mockImplementation((q: { clauses?: Array<{ field: string; op: string; value?: unknown }> }) => {
      const clauses = q.clauses ?? [];
      const isCanonicalGenre = clauses.some(
        (c) => c.field === 'canonicalGenreId' && c.op === '=='
      );
      if (isCanonicalGenre) {
        return Promise.resolve({
          docs: [genreQuiz].map((data) => ({ id: data.id, data: () => data })),
        });
      }
      return Promise.resolve({ docs: [] });
    });

    const results = await searchQuizzes('', { genreId: 'science' });

    expect(results.map((r) => r.id)).toContain('genre-q');
  });
});
