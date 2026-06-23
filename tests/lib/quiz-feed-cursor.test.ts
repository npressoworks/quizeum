import {
  QuizFeedCursorError,
  buildSearchFingerprint,
  decodeQuizFeedCursor,
  decodeSearchOffsetCursor,
  encodeQuizFeedCursor,
  encodeSearchOffsetCursor,
} from '@/lib/quiz-feed-cursor';

describe('quiz-feed-cursor', () => {
  it('タブ別カーソルを round-trip できる', () => {
    const cursor = encodeQuizFeedCursor({
      v: 1,
      kind: 'latest',
      quizId: 'quiz-1',
      sortKey: 1234567890,
    });
    const decoded = decodeQuizFeedCursor(cursor, 'latest');
    expect(decoded.quizId).toBe('quiz-1');
    expect(decoded.sortKey).toBe(1234567890);
  });

  it('author カーソルを round-trip できる', () => {
    const cursor = encodeQuizFeedCursor({
      v: 1,
      kind: 'author',
      quizId: 'quiz-author-1',
      sortKey: 1620000000,
    });
    const decoded = decodeQuizFeedCursor(cursor, 'author');
    expect(decoded.quizId).toBe('quiz-author-1');
    expect(decoded.sortKey).toBe(1620000000);
  });

  it('種別不一致のカーソルはエラーになる', () => {
    const cursor = encodeQuizFeedCursor({
      v: 1,
      kind: 'popular',
      quizId: 'quiz-2',
      sortKey: 1,
    });
    expect(() => decodeQuizFeedCursor(cursor, 'latest')).toThrow(QuizFeedCursorError);
  });

  it('壊れた base64 カーソルはエラーになる', () => {
    expect(() => decodeQuizFeedCursor('not-valid!!!', 'latest')).toThrow(QuizFeedCursorError);
  });

  it('検索オフセットカーソルを round-trip できる', () => {
    const fingerprint = buildSearchFingerprint('hello', { genreId: 'science' });
    const cursor = encodeSearchOffsetCursor(20, fingerprint);
    expect(decodeSearchOffsetCursor(cursor, fingerprint)).toBe(20);
  });

  it('fingerprint 不一致の検索カーソルはエラーになる', () => {
    const fingerprint = buildSearchFingerprint('hello', {});
    const cursor = encodeSearchOffsetCursor(10, fingerprint);
    expect(() => decodeSearchOffsetCursor(cursor, 'fp_deadbeef')).toThrow(QuizFeedCursorError);
  });

  it('同一条件では fingerprint が安定する', () => {
    const a = buildSearchFingerprint('test', { tags: ['b', 'a'] });
    const b = buildSearchFingerprint('test', { tags: ['a', 'b'] });
    expect(a).toBe(b);
  });
});
