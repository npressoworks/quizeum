/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { ExploreSearchSection } from '@/components/explore/explore-search-section';
import { ActiveFilterChips } from '@/components/explore/active-filter-chips';
import { DEFAULT_HOME_FEED_FILTERS } from '@/lib/home-feed-filters';

let mockWeeklyTags: string[] = ['js', 'trivia'];
let mockLoadingWeekly = false;
let mockErrorWeekly = false;

jest.mock('@/hooks/useWeeklyTrends', () => ({
  useWeeklyTopSearch: () => ({
    keywords: [],
    tags: mockWeeklyTags,
    loading: mockLoadingWeekly,
    error: mockErrorWeekly,
  }),
}));

const tags = [
  { id: 'js', tagName: 'js', canonicalId: null, mergedTagIds: [] },
];

const baseProps = {
  filters: DEFAULT_HOME_FEED_FILTERS,
  onFiltersChange: jest.fn(),
  onClearAll: jest.fn(),
  tags,
  tagsLoading: false,
  tagsError: null,
  tagLabelById: new Map([['js', 'js']]),
  playStatus: 'all' as const,
  onPlayStatusChange: jest.fn(),
};

describe('ExploreSearchSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLoadingWeekly = false;
    mockErrorWeekly = false;
    mockWeeklyTags = ['js', 'trivia'];
  });

  it('フィルターパネルにジャンルは含まず難易度・問題数・プレイ状況を表示する', () => {
    render(<ExploreSearchSection {...baseProps} showQuickSearch />);

    fireEvent.click(screen.getByRole('button', { name: 'フィルター' }));
    expect(screen.queryByText('ジャンル')).not.toBeInTheDocument();
    expect(screen.getByText('難易度')).toBeInTheDocument();
    expect(screen.getByText('問題数')).toBeInTheDocument();
    expect(screen.getByText('プレイ状況')).toBeInTheDocument();
    expect(screen.getByText('クイック検索:')).toBeInTheDocument();
    expect(screen.getByTestId('search-filter-difficulty-min')).toHaveAttribute('type', 'number');
    expect(screen.getByTestId('search-filter-difficulty-max')).toHaveAttribute('type', 'number');
    expect(screen.getByTestId('search-filter-min-questions')).toHaveAttribute('type', 'number');
    expect(screen.getByTestId('search-filter-max-questions')).toHaveAttribute('type', 'number');
    expect(screen.getByRole('combobox')).toHaveTextContent('すべて表示');
    expect(screen.queryByText('all')).not.toBeInTheDocument();
  });

  it('プレイ状況の選択中表示は日本語ラベルになる', () => {
    render(<ExploreSearchSection {...baseProps} playStatus="unplayed" showQuickSearch />);

    fireEvent.click(screen.getByRole('button', { name: 'フィルター' }));
    expect(screen.getByRole('combobox')).toHaveTextContent('未プレイのみ');
    expect(screen.queryByText('unplayed')).not.toBeInTheDocument();
  });

  it('難易度・問題数の数値入力でフィルターを更新する', () => {
    const onFiltersChange = jest.fn();
    render(
      <ExploreSearchSection {...baseProps} showQuickSearch onFiltersChange={onFiltersChange} />
    );

    fireEvent.click(screen.getByRole('button', { name: 'フィルター' }));

    fireEvent.change(screen.getByTestId('search-filter-difficulty-min'), { target: { value: '2' } });
    expect(onFiltersChange).toHaveBeenCalledWith({
      difficultyMin: 2,
      difficultyMax: 5,
    });

    fireEvent.change(screen.getByTestId('search-filter-max-questions'), { target: { value: '20' } });
    expect(onFiltersChange).toHaveBeenCalledWith({
      maxQuestions: 20,
      minQuestions: 1,
    });
  });

  it('週間人気タグをクイック検索チップとして表示する', () => {
    render(<ExploreSearchSection {...baseProps} showQuickSearch />);

    expect(screen.getByTestId('quick-search-chip-js')).toHaveTextContent('#js');
    expect(screen.getByTestId('quick-search-chip-trivia')).toHaveTextContent('#trivia');
  });

  it('クイック検索チップ選択でタグチップが追加される', () => {
    const onFiltersChange = jest.fn();
    render(
      <ExploreSearchSection {...baseProps} showQuickSearch onFiltersChange={onFiltersChange} />
    );

    fireEvent.click(screen.getByTestId('quick-search-chip-js'));

    expect(onFiltersChange).toHaveBeenCalledWith({ tagChips: ['js'] });
  });

  it('週間人気タグ取得失敗時はクイック検索を非表示にする', () => {
    mockErrorWeekly = true;
    render(<ExploreSearchSection {...baseProps} showQuickSearch />);

    expect(screen.queryByTestId('quick-search-tags')).not.toBeInTheDocument();
  });

  it('ジャンルページではクイック検索を非表示にする', () => {
    render(
      <ExploreSearchSection
        {...baseProps}
        lockedGenreId="programming"
        showQuickSearch={false}
        testId="genre-explore-search"
      />
    );

    expect(screen.getByTestId('genre-explore-search')).toBeInTheDocument();
    expect(screen.queryByText('クイック検索:')).not.toBeInTheDocument();
  });

  it('フィルタパネルを閉じてもアクティブ条件チップを表示する', () => {
    const onRemove = jest.fn();
    render(
      <ExploreSearchSection
        {...baseProps}
        filters={{ ...DEFAULT_HOME_FEED_FILTERS, genreId: 'programming' }}
        activeFilterChipsSlot={
          <ActiveFilterChips
            filters={{ ...DEFAULT_HOME_FEED_FILTERS, genreId: 'programming' }}
            playStatus="all"
            tagLabelById={new Map()}
            genreLabelById={new Map([['programming', 'コンピュータ・IT']])}
            onRemove={onRemove}
            onClearAll={jest.fn()}
          />
        }
      />
    );

    expect(screen.getByTestId('search-active-filters')).toBeInTheDocument();
    expect(screen.getByText('ジャンル: コンピュータ・IT')).toBeInTheDocument();
    expect(screen.queryByText('難易度')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /ジャンル: コンピュータ・IT を解除/ }));
    expect(onRemove).toHaveBeenCalledWith('genre', undefined);
  });
});
