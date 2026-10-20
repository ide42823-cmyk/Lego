/**
 * Async data hooks.
 *
 * Screens must never render a blank screen while data is in flight, so every
 * request goes through one of these and therefore always has a loading, error
 * and empty path.
 *
 * Two deliberate design choices:
 *
 *  1. The request is identified by a string `key` instead of an array of
 *     dependencies. The effect list stays static, and "refetch when the segment
 *     changes" becomes explicit at the call site.
 *  2. State is *keyed* by the request. A stale response can never be mistaken for
 *     the current one, and switching segments needs no synchronous state reset
 *     inside an effect (which would trigger cascading renders).
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import type { Page } from '@/core/data/types';

export type AsyncState<T> =
  | { status: 'loading'; data: T | null }
  | { status: 'error'; data: T | null; error: unknown }
  | { status: 'ready'; data: T };

export type AsyncResult<T> = AsyncState<T> & { reload: () => void };

interface AsyncEntry<T> {
  key: string;
  state: AsyncState<T>;
}

/**
 * Runs `loader` whenever `key` changes and exposes an explicit state machine.
 * Stale responses are ignored, so fast segment switching cannot overwrite newer
 * data with an older response.
 */
export function useAsync<T>(loader: () => Promise<T>, key: string): AsyncResult<T> {
  const loaderRef = useRef(loader);

  // Runs before the fetch effect below (effects fire in declaration order), so
  // the request always sees the loader from the current render.
  useEffect(() => {
    loaderRef.current = loader;
  });

  const [nonce, setNonce] = useState(0);
  const requestKey = `${key}#${nonce}`;

  const [entry, setEntry] = useState<AsyncEntry<T>>(() => ({
    key: requestKey,
    state: { status: 'loading', data: null },
  }));

  useEffect(() => {
    let cancelled = false;

    loaderRef.current().then(
      (data) => {
        if (!cancelled) {
          setEntry({ key: requestKey, state: { status: 'ready', data } });
        }
      },
      (error: unknown) => {
        if (!cancelled) {
          setEntry({ key: requestKey, state: { status: 'error', data: null, error } });
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [requestKey]);

  const reload = useCallback(() => {
    setNonce((value) => value + 1);
  }, []);

  // Derived, not stored: a pending request is reported as loading even before
  // its effect has run.
  const state: AsyncState<T> =
    entry.key === requestKey ? entry.state : { status: 'loading', data: null };

  return { ...state, reload };
}

interface PageEntry<T> {
  key: string;
  status: 'loading' | 'error' | 'ready';
  items: T[];
  error: unknown;
  hasMore: boolean;
  /** Full match count when the endpoint reports one; kept across pages. */
  total: number | null;
}

export interface PaginatedResult<T> {
  status: 'loading' | 'error' | 'ready';
  items: T[];
  error: unknown;
  /** A follow-up page is in flight; the list keeps rendering. */
  isLoadingMore: boolean;
  /** A pull-to-refresh is in flight; existing items stay on screen. */
  isRefreshing: boolean;
  hasMore: boolean;
  /** Full match count, or null when the endpoint does not report one. */
  total: number | null;
  loadMore: () => void;
  refresh: () => void;
  reload: () => void;
}

function makeEntry<T>(key: string): PageEntry<T> {
  return { key, status: 'loading', items: [], error: null, hasMore: false, total: null };
}

/**
 * Cursor-paginated list state.
 *
 * A failed *follow-up* page never discards the items already on screen, and a
 * pull-to-refresh replaces the first page without blanking the list.
 */
export function usePaginated<T>(
  fetchPage: (cursor: string | null) => Promise<Page<T>>,
  key: string,
): PaginatedResult<T> {
  const fetchRef = useRef(fetchPage);
  useEffect(() => {
    fetchRef.current = fetchPage;
  });

  const cursorRef = useRef<string | null>(null);
  const inFlightRef = useRef(false);

  const [nonce, setNonce] = useState(0);
  const requestKey = `${key}#${nonce}`;

  const [entry, setEntry] = useState<PageEntry<T>>(() => makeEntry<T>(requestKey));
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    inFlightRef.current = true;
    cursorRef.current = null;

    fetchRef.current(null).then(
      (page) => {
        if (cancelled) {
          return;
        }
        inFlightRef.current = false;
        cursorRef.current = page.nextCursor;
        setEntry({
          key: requestKey,
          status: 'ready',
          items: page.items,
          error: null,
          hasMore: page.nextCursor !== null,
          total: page.total ?? null,
        });
      },
      (error: unknown) => {
        if (cancelled) {
          return;
        }
        inFlightRef.current = false;
        setEntry({
          key: requestKey,
          status: 'error',
          items: [],
          error,
          hasMore: false,
          total: null,
        });
      },
    );

    return () => {
      cancelled = true;
    };
  }, [requestKey]);

  const current: PageEntry<T> = entry.key === requestKey ? entry : makeEntry<T>(requestKey);

  const loadMore = useCallback(() => {
    if (inFlightRef.current || cursorRef.current === null) {
      return;
    }

    const cursor = cursorRef.current;
    inFlightRef.current = true;
    setIsLoadingMore(true);

    fetchRef.current(cursor).then(
      (page) => {
        inFlightRef.current = false;
        cursorRef.current = page.nextCursor;
        setIsLoadingMore(false);
        setEntry((previous) =>
          previous.key !== requestKey
            ? previous
            : {
                ...previous,
                status: 'ready',
                items: [...previous.items, ...page.items],
                hasMore: page.nextCursor !== null,
                total: page.total ?? previous.total,
              },
        );
      },
      () => {
        // Deliberately keeps the loaded items: a pagination failure must not
        // blank a list the user is already reading.
        inFlightRef.current = false;
        setIsLoadingMore(false);
      },
    );
  }, [requestKey]);

  const refresh = useCallback(() => {
    if (inFlightRef.current) {
      return;
    }

    inFlightRef.current = true;
    setIsRefreshing(true);

    fetchRef.current(null).then(
      (page) => {
        inFlightRef.current = false;
        cursorRef.current = page.nextCursor;
        setIsRefreshing(false);
        setEntry({
          key: requestKey,
          status: 'ready',
          items: page.items,
          error: null,
          hasMore: page.nextCursor !== null,
          total: page.total ?? null,
        });
      },
      () => {
        inFlightRef.current = false;
        setIsRefreshing(false);
      },
    );
  }, [requestKey]);

  const reload = useCallback(() => {
    setNonce((value) => value + 1);
  }, []);

  return {
    status: current.status,
    items: current.items,
    error: current.error,
    isLoadingMore,
    isRefreshing,
    hasMore: current.hasMore,
    total: current.total,
    loadMore,
    refresh,
    reload,
  };
}
