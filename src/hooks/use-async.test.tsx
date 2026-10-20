import { act, renderHook, waitFor } from '@testing-library/react-native';

import type { Page } from '@/core/data/types';

import { useAsync, usePaginated } from './use-async';

interface Row {
  id: string;
}

function pagedFetcher(pages: Row[][]) {
  const calls: (string | null)[] = [];

  const fetchPage = (cursor: string | null): Promise<Page<Row>> => {
    calls.push(cursor);
    const index = cursor === null ? 0 : Number(cursor);
    const items = pages[index] ?? [];
    const nextCursor = index + 1 < pages.length ? String(index + 1) : null;
    return Promise.resolve({ items, nextCursor });
  };

  return { fetchPage, calls };
}

describe('usePaginated', () => {
  it('loads the first page and reports that more is available', async () => {
    const { fetchPage } = pagedFetcher([[{ id: 'a' }], [{ id: 'b' }]]);
    const { result } = await renderHook(() => usePaginated(fetchPage, 'feed'));

    await waitFor(() => expect(result.current.status).toBe('ready'));

    expect(result.current.items).toEqual([{ id: 'a' }]);
    expect(result.current.hasMore).toBe(true);
  });

  it('appends the next page instead of replacing it', async () => {
    const { fetchPage } = pagedFetcher([[{ id: 'a' }], [{ id: 'b' }]]);
    const { result } = await renderHook(() => usePaginated(fetchPage, 'feed'));

    await waitFor(() => expect(result.current.status).toBe('ready'));
    await act(() => result.current.loadMore());

    await waitFor(() => expect(result.current.items).toEqual([{ id: 'a' }, { id: 'b' }]));
    expect(result.current.hasMore).toBe(false);
  });

  it('reports the total from the endpoint and keeps it while paging', async () => {
    const fetchPage = (cursor: string | null): Promise<Page<Row>> =>
      Promise.resolve(
        cursor === null
          ? { items: [{ id: 'a' }], nextCursor: '1', total: 3 }
          : { items: [{ id: 'b' }], nextCursor: null, total: 3 },
      );

    const { result } = await renderHook(() => usePaginated(fetchPage, 'search'));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.total).toBe(3);

    await act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.items).toHaveLength(2));
    expect(result.current.total).toBe(3);
  });

  it('stops requesting pages once the cursor is exhausted', async () => {
    const { fetchPage, calls } = pagedFetcher([[{ id: 'a' }]]);
    const { result } = await renderHook(() => usePaginated(fetchPage, 'feed'));

    await waitFor(() => expect(result.current.status).toBe('ready'));
    await act(() => result.current.loadMore());

    expect(calls).toEqual([null]);
  });

  it('keeps rendered items when a follow-up page fails', async () => {
    let attempts = 0;
    const fetchPage = (cursor: string | null): Promise<Page<Row>> => {
      attempts += 1;
      if (cursor === null) {
        return Promise.resolve({ items: [{ id: 'a' }], nextCursor: '1' });
      }
      return Promise.reject(new Error('page 2 exploded'));
    };

    const { result } = await renderHook(() => usePaginated(fetchPage, 'feed'));
    await waitFor(() => expect(result.current.status).toBe('ready'));

    await act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.isLoadingMore).toBe(false));

    expect(attempts).toBe(2);
    expect(result.current.status).toBe('ready');
    expect(result.current.items).toEqual([{ id: 'a' }]);
  });

  it('reports a failed first page as an error and recovers on reload', async () => {
    let attempts = 0;
    const fetchPage = (): Promise<Page<Row>> => {
      attempts += 1;
      return attempts === 1
        ? Promise.reject(new Error('offline'))
        : Promise.resolve({ items: [{ id: 'a' }], nextCursor: null });
    };

    const { result } = await renderHook(() => usePaginated(fetchPage, 'feed'));
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.items).toEqual([]);

    await act(() => result.current.reload());
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.items).toEqual([{ id: 'a' }]);
  });

  it('refreshes in place without blanking the list', async () => {
    const { fetchPage } = pagedFetcher([[{ id: 'a' }]]);
    const { result } = await renderHook(() => usePaginated(fetchPage, 'feed'));

    await waitFor(() => expect(result.current.status).toBe('ready'));

    await act(async () => {
      result.current.refresh();
    });

    expect(result.current.status).toBe('ready');
    await waitFor(() => expect(result.current.isRefreshing).toBe(false));
    expect(result.current.items).toEqual([{ id: 'a' }]);
  });

  it('ignores a response from a superseded request key', async () => {
    const { result, rerender } = await renderHook(
      ({ key }: { key: string }) =>
        usePaginated(
          () =>
            new Promise<Page<Row>>((resolve) => {
              const items: Row[] = key === 'slow' ? [{ id: 'slow' }] : [{ id: 'fast' }];
              setTimeout(() => resolve({ items, nextCursor: null }), key === 'slow' ? 40 : 0);
            }),
          key,
        ),
      { initialProps: { key: 'slow' } },
    );

    // Switch views before the first request has resolved.
    await rerender({ key: 'fast' });
    await waitFor(() => expect(result.current.items).toEqual([{ id: 'fast' }]));

    // Give the abandoned request time to land. It must not overwrite the view.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 60));
    });

    expect(result.current.items).toEqual([{ id: 'fast' }]);
  });
});

describe('useAsync', () => {
  it('moves from loading to ready and can reload', async () => {
    let value = 1;
    const { result } = await renderHook(() => useAsync(() => Promise.resolve(value), 'counter'));

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.data).toBe(1);

    value = 2;
    await act(() => result.current.reload());

    await waitFor(() => expect(result.current.data).toBe(2));
  });

  it('reports a rejection as an error state rather than throwing', async () => {
    const { result } = await renderHook(() =>
      useAsync(() => Promise.reject(new Error('nope')), 'failing'),
    );

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.data).toBeNull();
  });
});
