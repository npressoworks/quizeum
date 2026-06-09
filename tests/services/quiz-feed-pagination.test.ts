import {
  getLatestQuizzes,
  getLatestQuizzesPage,
  searchQuizzesPaginated,
  QuizFeedCursorError,
} from '../../src/services/quiz';
import { getDoc, getDocs } from 'firebase/firestore';
import type { Quiz } from '../../src/types';
import {
  buildSearchFingerprint,
  encodeSearchOffsetCursor,
} from '../../src/lib/quiz-feed-cursor';

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
    startAfter: jest.fn((snap) => ({ startAfter: snap })),
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

function makeQuiz(id: string, createdAtMs: number): Quiz {
  return {
    id,
    authorId: 'author-1',
    authorName: '作者',
    authorAvatar: '',
    title: `Quiz ${id}`,
    description: '',
    thumbnailUrl: null,
    difficulty: 3,
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
    createdAt: new Date(createdAtMs),
    updatedAt: new Date(createdAtMs),
  };
}

describe('quiz feed pagination', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getLatestQuizzesPage の2ページ目先頭 ID が1ページ目に含まれない', async () => {
    const page1 = [makeQuiz('q-1', 3000), makeQuiz('q-2', 2000)];

    (getDocs as jest.Mock)
      .mockResolvedValueOnce({
        docs: page1.map((q) => ({ data: () => q })),
      })
      .mockResolvedValueOnce({
        docs: [page1[1]].map((q) => ({ data: () => q })),
      });

    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => page1[0],
    });

    const first = await getLatestQuizzesPage({ limit: 1 });
    expect(first.items.map((q) => q.id)).toEqual(['q-1']);
    expect(first.nextCursor).toBeTruthy();

    const second = await getLatestQuizzesPage({ limit: 1, cursor: first.nextCursor });
    expect(second.items.map((q) => q.id)).toEqual(['q-2']);
    expect(first.items.some((q) => second.items.some((s) => s.id === q.id))).toBe(false);
  });

  it('getLatestQuizzes は先頭ページ API の薄いラッパーとして動作する', async () => {
    const rows = [makeQuiz('wrap-1', 1000), makeQuiz('wrap-2', 900)];
    (getDocs as jest.Mock).mockResolvedValue({
      docs: rows.map((q) => ({ data: () => q })),
    });

    const items = await getLatestQuizzes(2);
    expect(items.map((q) => q.id)).toEqual(['wrap-1', 'wrap-2']);
  });

  it('searchQuizzesPaginated は offset 0/1 で件数が整合する', async () => {
    const rows = [makeQuiz('s-1', 3000), makeQuiz('s-2', 2000), makeQuiz('s-3', 1000)];
    (getDocs as jest.Mock).mockResolvedValue({
      docs: rows.map((q) => ({ data: () => q })),
    });

    const page1 = await searchQuizzesPaginated('', {}, { limit: 2 });
    expect(page1.items).toHaveLength(2);
    expect(page1.nextCursor).toBeTruthy();

    const page2 = await searchQuizzesPaginated('', {}, { limit: 2, cursor: page1.nextCursor });
    expect(page2.items).toHaveLength(1);
    expect(page2.nextCursor).toBeNull();
    expect([...page1.items, ...page2.items]).toHaveLength(3);
  });

  it('fingerprint 不一致の検索カーソルはエラーになる', async () => {
    const fingerprint = buildSearchFingerprint('', {});
    const staleCursor = encodeSearchOffsetCursor(10, fingerprint);

    await expect(
      searchQuizzesPaginated('', { genreId: 'science' }, { cursor: staleCursor })
    ).rejects.toThrow(QuizFeedCursorError);
  });
});
