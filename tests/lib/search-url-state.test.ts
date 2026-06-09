import { DEFAULT_HOME_FEED_FILTERS } from '@/lib/home-feed-filters';
import { DISCOVERY_CAROUSEL_SIZE } from '@/lib/quiz-feed-cursor';
import {
  buildSearchUrlQuery,
  parseSearchUrlState,
  serializeSearchUrlState,
  type SearchUrlState,
} from '@/lib/search-url-state';

describe('search-url-state', () => {
  it('DISCOVERY_CAROUSEL_SIZE は 10 件', () => {
    expect(DISCOVERY_CAROUSEL_SIZE).toBe(10);
  });

  it('tab=trending を parse → serialize → 同一 tab', () => {
    const parsed = parseSearchUrlState(new URLSearchParams('tab=trending'));
    expect(parsed.tab).toBe('trending');
    expect(serializeSearchUrlState(parsed).toString()).toBe('tab=trending');
  });

  it('genreId と openFilters=1 を round-trip できる', () => {
    const parsed = parseSearchUrlState(
      new URLSearchParams('genreId=prog&openFilters=1')
    );
    expect(parsed.filters.genreId).toBe('prog');
    expect(parsed.openFilters).toBe(true);
    expect(serializeSearchUrlState(parsed).toString()).toBe('genreId=prog&openFilters=1');
  });

  it('無効 tab=foo は latest に正規化される', () => {
    const parsed = parseSearchUrlState(new URLSearchParams('tab=foo'));
    expect(parsed.tab).toBe('latest');
    expect(serializeSearchUrlState(parsed).toString()).toBe('');
  });

  it('既定フィルタ serialize で空クエリになる', () => {
    const state: SearchUrlState = {
      tab: 'latest',
      filters: { ...DEFAULT_HOME_FEED_FILTERS, tagChips: [] },
      openFilters: false,
      playStatus: 'all',
    };
    expect(serializeSearchUrlState(state).toString()).toBe('');
    expect(buildSearchUrlQuery({})).toBe('');
  });

  it('tags は正規化・ソートしてシリアライズする', () => {
    const parsed = parseSearchUrlState(new URLSearchParams('tags=Beta,alpha'));
    expect(parsed.filters.tagChips).toEqual(['alpha', 'beta']);
    expect(serializeSearchUrlState(parsed).toString()).toBe('tags=alpha%2Cbeta');
  });

  it('数値範囲外は clamp される', () => {
    const parsed = parseSearchUrlState(
      new URLSearchParams('difficultyMin=0&difficultyMax=9&minQuestions=0&maxQuestions=99')
    );
    expect(parsed.filters.difficultyMin).toBe(1);
    expect(parsed.filters.difficultyMax).toBe(5);
    expect(parsed.filters.minQuestions).toBe(1);
    expect(parsed.filters.maxQuestions).toBe(50);
  });

  it('未知キーは無視される', () => {
    const parsed = parseSearchUrlState(
      new URLSearchParams('tab=latest&unknown=1&genreId=science')
    );
    expect(parsed.filters.genreId).toBe('science');
    expect(parsed.tab).toBe('latest');
  });

  it('Record 形式の searchParams も parse できる', () => {
    const parsed = parseSearchUrlState({
      tab: 'popular',
      q: 'react',
    });
    expect(parsed.tab).toBe('popular');
    expect(parsed.filters.searchQuery).toBe('react');
  });

  it('playStatus=unplayed を round-trip できる', () => {
    const parsed = parseSearchUrlState(new URLSearchParams('playStatus=unplayed&tab=timeline'));
    expect(parsed.playStatus).toBe('unplayed');
    expect(parsed.tab).toBe('timeline');
    expect(serializeSearchUrlState(parsed).toString()).toBe('tab=timeline&playStatus=unplayed');
  });
});
