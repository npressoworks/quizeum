import { filterGenreSuggestions } from '@/lib/filter-genre-suggestions';
import { filterTagSuggestions } from '@/lib/filter-tag-suggestions';
import type { GenreMetadata, TagMetadata } from '@/types';

export type SearchSuggestion =
  | { kind: 'tag'; id: string; label: string }
  | { kind: 'genre'; id: string; label: string };

/** 統合検索バー用: タグ＋ジャンル候補をマージしてランキング */
export function filterSearchSuggestions(
  tags: Pick<TagMetadata, 'id' | 'tagName'>[],
  genres: Pick<GenreMetadata, 'id' | 'displayName'>[],
  query: string,
  maxResults = 10
): SearchSuggestion[] {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return [];
  }

  const tagHits = filterTagSuggestions(tags, query, maxResults).map(
    (t): SearchSuggestion => ({
      kind: 'tag',
      id: t.id,
      label: t.tagName ?? t.id,
    })
  );

  const genreHits = filterGenreSuggestions(genres, query, maxResults).map(
    (g): SearchSuggestion => ({
      kind: 'genre',
      id: g.id,
      label: g.displayName,
    })
  );

  const score = (item: SearchSuggestion): number => {
    const id = item.id.toLowerCase();
    const label = item.label.toLowerCase();
    if (id === needle || label === needle) return 0;
    if (id.startsWith(needle) || label.startsWith(needle)) return 1;
    if (id.includes(needle) || label.includes(needle)) return 2;
    return 3;
  };

  return [...tagHits, ...genreHits]
    .sort((a, b) => score(a) - score(b) || a.label.localeCompare(b.label, 'ja'))
    .slice(0, maxResults);
}
