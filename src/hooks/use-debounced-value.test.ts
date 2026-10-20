import { renderHook, waitFor } from '@testing-library/react-native';

import { useDebouncedValue } from './use-debounced-value';

/**
 * Real timers here on purpose: `renderHook` flushes effects through the timer
 * queue, so faking timers before the initial render makes the hook never mount.
 * The delays are short enough that the suite stays fast.
 */
describe('useDebouncedValue', () => {
  it('trails the value by the delay', async () => {
    const { result, rerender } = await renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value, 50),
      { initialProps: { value: 'a' } },
    );

    await rerender({ value: 'ab' });
    // The old value is still current immediately after the change.
    expect(result.current).toBe('a');

    await waitFor(() => expect(result.current).toBe('ab'));
  });

  it('restarts the delay when the value changes again', async () => {
    const { result, rerender } = await renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value, 100),
      { initialProps: { value: 'a' } },
    );

    await rerender({ value: 'ab' });
    // Change again before the first delay elapses.
    await new Promise((resolve) => setTimeout(resolve, 30));
    await rerender({ value: 'abc' });

    // 60ms after the second change: a restarted timer has not fired yet.
    await new Promise((resolve) => setTimeout(resolve, 60));
    expect(result.current).toBe('a');

    await waitFor(() => expect(result.current).toBe('abc'));
  });
});
