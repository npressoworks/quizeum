'use client';

import { useEffect, useMemo, useState } from 'react';
import { listActiveTags } from '@/services/quiz';
import type { TagMetadata } from '@/types';

export interface UseActiveTagsResult {
  tags: TagMetadata[];
  loading: boolean;
  error: string | null;
  tagLabelById: Map<string, string>;
  refetch: () => void;
}

export function useActiveTags(): UseActiveTagsResult {
  const [tags, setTags] = useState<TagMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    listActiveTags()
      .then((list) => {
        if (cancelled) return;
        setTags(list);
      })
      .catch((e) => {
        if (cancelled) return;
        console.error('[useActiveTags]', e);
        setTags([]);
        setError('タグ一覧の取得に失敗しました。しばらくしてから再試行してください。');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tick]);

  const tagLabelById = useMemo(() => {
    const map = new Map<string, string>();
    for (const t of tags) {
      map.set(t.id, t.tagName ?? t.id);
    }
    return map;
  }, [tags]);

  return {
    tags,
    loading,
    error,
    tagLabelById,
    refetch: () => setTick((t) => t + 1),
  };
}
