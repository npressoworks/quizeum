/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useExploreQuizFeed } from '@/hooks/useExploreQuizFeed';
import { DEFAULT_HOME_FEED_FILTERS } from '@/lib/home-feed-filters';
import { HOME_FEED_PAGE_SIZE } from '@/lib/quiz-feed-cursor';

const mockGetLatestQuizzesPage = jest.fn();
const mockSearchQuizzesPaginated = jest.fn();

jest.mock('@/services/quiz', () => ({
  getLatestQuizzesPage: (...args: unknown[]) => mockGetLatestQuizzesPage(...args),
  getPopularQuizzesPage: jest.fn(),
  getTrendingQuizzesPage: jest.fn(),
  getFollowedTimelinePage: jest.fn(),
  getQuizzesByGenre: jest.fn(),
  searchQuizzes: jest.fn(),
  searchQuizzesPaginated: (...args: unknown[]) => mockSearchQuizzesPaginated(...args),
}));

describe('useExploreQuizFeed pagination', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetLatestQuizzesPage.mockResolvedValue({
      items: [{ id: 'page-1' }],
      nextCursor: 'cursor-1',
    });
  });

  it('先頭ページ取得後に hasMore と loadMore が利用できる', async () => {
    mockGetLatestQuizzesPage
      .mockResolvedValueOnce({
        items: [{ id: 'page-1' }],
        nextCursor: 'cursor-1',
      })
      .mockResolvedValueOnce({
        items: [{ id: 'page-2' }],
        nextCursor: null,
      });

    const { result } = renderHook(() =>
      useExploreQuizFeed({
        mode: 'home',
        activeTab: 'latest',
        filters: DEFAULT_HOME_FEED_FILTERS,
      })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.quizzes).toEqual([{ id: 'page-1' }]);
    expect(result.current.hasMore).toBe(true);

    await act(async () => {
      await result.current.loadMore();
    });

    expect(mockGetLatestQuizzesPage).toHaveBeenLastCalledWith({
      limit: HOME_FEED_PAGE_SIZE,
      cursor: 'cursor-1',
    });
    expect(result.current.quizzes).toEqual([{ id: 'page-1' }, { id: 'page-2' }]);
    expect(result.current.hasMore).toBe(false);
  });

  it('フィルタ変更時に一覧をリセットして先頭ページを再取得する', async () => {
    mockSearchQuizzesPaginated.mockResolvedValue({
      items: [{ id: 'filtered-1' }],
      nextCursor: null,
    });

    const { result, rerender } = renderHook(
      ({ format }: { format: '' | 'mixed' }) =>
        useExploreQuizFeed({
          mode: 'home',
          activeTab: 'latest',
          filters: { ...DEFAULT_HOME_FEED_FILTERS, format },
        }),
      { initialProps: { format: '' as '' | 'mixed' } }
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockGetLatestQuizzesPage).toHaveBeenCalled();

    rerender({ format: 'mixed' });

    await waitFor(() => expect(result.current.quizzes).toEqual([{ id: 'filtered-1' }]));
    expect(mockSearchQuizzesPaginated).toHaveBeenCalled();
  });
});
