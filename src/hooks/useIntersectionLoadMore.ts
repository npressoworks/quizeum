'use client';

import { useEffect, useRef } from 'react';

export interface UseIntersectionLoadMoreOptions {
  onIntersect: () => void;
  enabled: boolean;
  rootMargin?: string;
}

export function useIntersectionLoadMore({
  onIntersect,
  enabled,
  rootMargin = '200px',
}: UseIntersectionLoadMoreOptions) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const onIntersectRef = useRef(onIntersect);

  useEffect(() => {
    onIntersectRef.current = onIntersect;
  }, [onIntersect]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          onIntersectRef.current();
        }
      },
      { rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, rootMargin]);

  return sentinelRef;
}
