export type RangeHandle = 'low' | 'high';

export interface RangeValue {
  low: number;
  high: number;
}

/** Rounds a raw position to the nearest step and clamps it to the bounds. */
export function clampRangeValue(value: number, min: number, max: number, step: number): number {
  const safeStep = step > 0 ? step : 1;
  const stepped = Math.round((value - min) / safeStep) * safeStep + min;
  return Math.min(max, Math.max(min, stepped));
}

/**
 * Moves one handle without letting it cross the other.
 *
 * Dragging the low handle stops at the high handle (and vice versa); the
 * caller's step rounding is applied before the clamp, so the final value is
 * always on the grid.
 */
export function moveRangeValue(
  range: RangeValue,
  handle: RangeHandle,
  raw: number,
  min: number,
  max: number,
  step: number,
): RangeValue {
  const next = clampRangeValue(raw, min, max, step);

  return handle === 'low'
    ? { low: Math.min(next, range.high), high: range.high }
    : { low: range.low, high: Math.max(next, range.low) };
}

/**
 * Which handle a touch at `ratio` (0..1 along the track) should move.
 *
 * The nearest handle wins; an exact midpoint picks the high handle so a drag
 * from the middle toward the end extends the range instead of collapsing it.
 */
export function pickRangeHandle(
  range: RangeValue,
  ratio: number,
  min: number,
  max: number,
): RangeHandle {
  const span = max - min;
  if (span <= 0) {
    return 'high';
  }

  const lowRatio = (range.low - min) / span;
  const highRatio = (range.high - min) / span;
  const middle = (lowRatio + highRatio) / 2;

  return ratio >= middle ? 'high' : 'low';
}
