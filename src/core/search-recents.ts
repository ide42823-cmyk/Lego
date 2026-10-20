/**
 * Recent searches.
 *
 * Search history genuinely belongs to the account, so the eventual source of
 * truth is the server (and it must be erasable from settings). Until that
 * exists, the session keeps the last few terms in memory: it survives leaving
 * and reopening the search screen, and deliberately does not pretend to be
 * persisted profile data.
 *
 * The list helpers are pure so the ordering rules can be tested without React.
 */

export const MAX_RECENT_SEARCHES = 6;

/**
 * Adds a term to the front of the list.
 *
 * Blank input is ignored, whitespace is collapsed, and a repeat moves the term
 * to the top instead of appearing twice. Matching is case-insensitive but the
 * newest spelling is the one shown.
 */
export function addRecentSearch(list: readonly string[], query: string): readonly string[] {
  const term = query.trim().replace(/\s+/g, ' ');
  if (!term) {
    return list;
  }
  if (list[0] === term) {
    return list;
  }

  const key = term.toLowerCase();
  const withoutTerm = list.filter((item) => item.toLowerCase() !== key);
  return [term, ...withoutTerm].slice(0, MAX_RECENT_SEARCHES);
}

/** Removes a term, matching case-insensitively. */
export function removeRecentSearch(list: readonly string[], query: string): readonly string[] {
  const key = query.trim().toLowerCase();
  if (!key) {
    return list;
  }

  const next = list.filter((item) => item.toLowerCase() !== key);
  return next.length === list.length ? list : next;
}

type Listener = () => void;

let recents: readonly string[] = [];
const listeners = new Set<Listener>();

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

/**
 * The session's recent-search store. `subscribe` and `getSnapshot` are stable
 * so `useSyncExternalStore` can use them directly.
 */
export const recentSearches = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  getSnapshot(): readonly string[] {
    return recents;
  },

  add(query: string): void {
    const next = addRecentSearch(recents, query);
    if (next !== recents) {
      recents = next;
      emit();
    }
  },

  remove(query: string): void {
    const next = removeRecentSearch(recents, query);
    if (next !== recents) {
      recents = next;
      emit();
    }
  },

  clear(): void {
    if (recents.length > 0) {
      recents = [];
      emit();
    }
  },
};
