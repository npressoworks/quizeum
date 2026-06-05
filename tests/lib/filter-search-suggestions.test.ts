import { filterSearchSuggestions } from '@/lib/filter-search-suggestions';

const tags = [{ id: 'js', tagName: 'JavaScript' }];
const genres = [{ id: 'programming', displayName: 'コンピュータ・IT' }];

describe('filterSearchSuggestions', () => {
  it('空クエリでは候補を返さない', () => {
    expect(filterSearchSuggestions(tags, genres, '')).toEqual([]);
  });

  it('タグとジャンルの混在候補を返す', () => {
    const result = filterSearchSuggestions(tags, genres, 'java');
    expect(result.some((s) => s.kind === 'tag' && s.id === 'js')).toBe(true);
  });

  it('ジャンル表示名でマッチする', () => {
    const result = filterSearchSuggestions(tags, genres, 'コンピュータ');
    expect(result.some((s) => s.kind === 'genre' && s.id === 'programming')).toBe(true);
  });
});
