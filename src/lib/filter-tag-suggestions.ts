import type { TagMetadata } from '@/types';

/** タグマスタを id 優先・tagName 副次で部分一致フィルタ */
export function filterTagSuggestions(
  tags: Pick<TagMetadata, 'id' | 'tagName'>[],
  query: string,
  maxResults = 8
): Pick<TagMetadata, 'id' | 'tagName'>[] {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return tags.slice(0, maxResults);
  }

  const scored = tags
    .map((t) => {
      const id = t.id.toLowerCase();
      const name = (t.tagName ?? t.id).toLowerCase();
      let rank = 4;
      if (id === needle) rank = 0;
      else if (id.startsWith(needle)) rank = 1;
      else if (id.includes(needle)) rank = 2;
      else if (name.includes(needle)) rank = 3;
      else return null;
      return { tag: t, rank };
    })
    .filter(
      (x): x is { tag: Pick<TagMetadata, 'id' | 'tagName'>; rank: number } => x != null
    );

  scored.sort(
    (a, b) =>
      a.rank - b.rank ||
      (a.tag.tagName ?? a.tag.id).localeCompare(b.tag.tagName ?? b.tag.id, 'ja')
  );
  return scored.slice(0, maxResults).map((s) => s.tag);
}
