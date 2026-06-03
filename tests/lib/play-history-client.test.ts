import {
  fetchPlayHistoryPage,
  getAttemptModeLabel,
  PlayHistoryApiError,
} from '../../src/lib/play-history-client';

jest.mock('@/lib/firebase/config', () => ({
  auth: {
    currentUser: {
      getIdToken: jest.fn().mockResolvedValue('mock-token'),
    },
  },
}));

describe('play-history-client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getAttemptModeLabel: 各モードの日本語ラベル', () => {
    expect(getAttemptModeLabel('normal')).toBe('通常モード');
    expect(getAttemptModeLabel('exam')).toBe('模擬試験');
    expect(getAttemptModeLabel('flashcard')).toBe('フラッシュカード');
    expect(getAttemptModeLabel('review')).toBe('弱点克服');
    expect(getAttemptModeLabel('list')).toBe('リストプレイ');
  });

  test('fetchPlayHistoryPage: 401 で PlayHistoryApiError', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: '認証に失敗しました' }),
    });

    try {
      await fetchPlayHistoryPage({});
      throw new Error('expected PlayHistoryApiError');
    } catch (e) {
      expect(e).toBeInstanceOf(PlayHistoryApiError);
      expect((e as PlayHistoryApiError).status).toBe(401);
      expect((e as PlayHistoryApiError).message).toBe('認証に失敗しました');
    }
  });

  test('fetchPlayHistoryPage: completedAt を Date に変換', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        items: [
          {
            attemptId: 'a1',
            quizId: 'q1',
            quizTitle: 'テスト',
            score: 3,
            totalQuestions: 5,
            mode: 'normal',
            completedAt: '2026-01-15T12:00:00.000Z',
            elapsedSeconds: 42,
          },
        ],
        nextCursor: 'cursor-abc',
      }),
    });

    const page = await fetchPlayHistoryPage({ cursor: 'prev' });
    expect(page.items[0].completedAt).toBeInstanceOf(Date);
    expect(page.items[0].quizTitle).toBe('テスト');
    expect(page.nextCursor).toBe('cursor-abc');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('cursor=prev'),
      expect.objectContaining({
        headers: { Authorization: 'Bearer mock-token' },
      })
    );
  });
});
