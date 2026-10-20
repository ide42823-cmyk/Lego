import { useEffect, useState } from 'react';

/**
 * Trails `value` by `delayMs`.
 *
 * Search is the one place where typing should not fire a request per keystroke,
 * but the debounce belongs at the call site rather than inside the search hook:
 * clearing the field can then be treated as immediate instead of waiting for a
 * trailing edge.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    if (value === debounced) {
      return;
    }

    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs, debounced]);

  return debounced;
}
