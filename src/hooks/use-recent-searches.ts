import { useSyncExternalStore } from 'react';

import { recentSearches } from '@/core/search-recents';

/**
 * The session's recent search terms.
 *
 * `recentSearches` owns the value and the listeners, so every search screen (and
 * any future search field elsewhere) sees the same list. Reads are synchronous:
 * there is no loading state because nothing is fetched yet.
 */
export function useRecentSearches(): readonly string[] {
  return useSyncExternalStore(
    recentSearches.subscribe,
    recentSearches.getSnapshot,
    recentSearches.getSnapshot,
  );
}
