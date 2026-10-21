import { clampRangeValue, moveRangeValue, pickRangeHandle } from './range';

describe('clampRangeValue', () => {
  it('rounds to the nearest step from the minimum', () => {
    expect(clampRangeValue(23, 0, 100, 10)).toBe(20);
    expect(clampRangeValue(26, 0, 100, 10)).toBe(30);
    expect(clampRangeValue(23, 18, 40, 1)).toBe(23);
  });

  it('clamps outside the bounds', () => {
    expect(clampRangeValue(-10, 0, 100, 10)).toBe(0);
    expect(clampRangeValue(140, 0, 100, 10)).toBe(100);
  });

  it('handles a degenerate step', () => {
    expect(clampRangeValue(5.4, 0, 10, 0)).toBe(5);
  });
});

describe('moveRangeValue', () => {
  const range = { low: 20, high: 80 };

  it('moves the low handle without crossing the high handle', () => {
    expect(moveRangeValue(range, 'low', 35, 0, 100, 5)).toEqual({ low: 35, high: 80 });
    expect(moveRangeValue(range, 'low', 95, 0, 100, 5)).toEqual({ low: 80, high: 80 });
  });

  it('moves the high handle without crossing the low handle', () => {
    expect(moveRangeValue(range, 'high', 70, 0, 100, 5)).toEqual({ low: 20, high: 70 });
    expect(moveRangeValue(range, 'high', 5, 0, 100, 5)).toEqual({ low: 20, high: 20 });
  });

  it('rounds the moved handle to the step', () => {
    expect(moveRangeValue(range, 'low', 22, 0, 100, 5)).toEqual({ low: 20, high: 80 });
    expect(moveRangeValue(range, 'high', 78, 0, 100, 5)).toEqual({ low: 20, high: 80 });
  });
});

describe('pickRangeHandle', () => {
  it('picks the nearer handle', () => {
    expect(pickRangeHandle({ low: 20, high: 80 }, 0.1, 0, 100)).toBe('low');
    expect(pickRangeHandle({ low: 20, high: 80 }, 0.9, 0, 100)).toBe('high');
  });

  it('picks the high handle at an exact midpoint', () => {
    expect(pickRangeHandle({ low: 20, high: 80 }, 0.5, 0, 100)).toBe('high');
  });

  it('handles a zero-span range', () => {
    expect(pickRangeHandle({ low: 10, high: 10 }, 0.5, 10, 10)).toBe('high');
  });
});
