import { useCallback, useMemo, useState } from 'react';

interface Options {
  pageSize: number;
  /** When this changes (a new search query), rendering starts over at one page. */
  resetKey: string;
}

/**
 * Renders a long list a page at a time, loading the next page as a sentinel
 * element nears the viewport.
 *
 * Slicing only: callers pass the complete, already-filtered list, so search
 * and counts still cover every item -- only what is mounted is limited.
 */
export function useIncrementalList<T>(items: readonly T[], { pageSize, resetKey }: Options) {
  const [state, setState] = useState({ key: resetKey, count: pageSize });

  // Reset during render rather than in an effect, so a new query never paints
  // one frame with the previous query's page count.
  let count = state.count;
  if (state.key !== resetKey) {
    count = pageSize;
    setState({ key: resetKey, count });
  }

  const visible = useMemo(() => items.slice(0, count), [items, count]);
  const remaining = Math.max(0, items.length - count);

  const loadMore = useCallback(() => {
    setState(current => ({ ...current, count: current.count + pageSize }));
  }, [pageSize]);

  // Re-created per page on purpose: an observer reports the current state when
  // it starts observing, so if the sentinel is still near the viewport after a
  // page renders (a tall screen), the next page loads instead of stalling until
  // the user scrolls.
  const sentinelRef = useCallback(
    (node: Element | null) => {
      if (!node || !('IntersectionObserver' in window)) return;
      const observer = new IntersectionObserver(
        entries => {
          if (entries.some(entry => entry.isIntersecting)) loadMore();
        },
        // Start the next page before the user reaches the end.
        { rootMargin: '400px' }
      );
      observer.observe(node);
      return () => observer.disconnect();
    },
    // count: see above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loadMore, count]
  );

  return { visible, hasMore: remaining > 0, remaining, loadMore, sentinelRef };
}
