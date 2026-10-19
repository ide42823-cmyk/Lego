import { countryFlag, formatCompactCount, formatDistanceKm, formatRelativeTime } from './index';

const NOW = new Date('2026-10-18T12:00:00.000Z').getTime();
const at = (offsetMs: number) => new Date(NOW - offsetMs).toISOString();

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe('formatRelativeTime', () => {
  it('reports anything under a minute as "now"', () => {
    expect(formatRelativeTime(at(45 * SECOND), NOW)).toBe('now');
  });

  it('reports minutes under an hour', () => {
    expect(formatRelativeTime(at(5 * MINUTE), NOW)).toBe('5m');
  });

  it('reports hours under a day', () => {
    expect(formatRelativeTime(at(3 * HOUR), NOW)).toBe('3h');
  });

  it('reports days up to a week', () => {
    expect(formatRelativeTime(at(2 * DAY), NOW)).toBe('2d');
  });

  it('falls back to a calendar date beyond a week', () => {
    expect(formatRelativeTime(at(10 * DAY), NOW)).toBe('8 Oct');
  });

  it('treats a future timestamp as "now" rather than a negative age', () => {
    expect(formatRelativeTime(new Date(NOW + HOUR).toISOString(), NOW)).toBe('now');
  });

  it('returns an empty string for an unparseable timestamp', () => {
    expect(formatRelativeTime('not-a-date', NOW)).toBe('');
  });
});

describe('formatCompactCount', () => {
  it('leaves small numbers alone', () => {
    expect(formatCompactCount(0)).toBe('0');
    expect(formatCompactCount(999)).toBe('999');
  });

  it('abbreviates thousands with one decimal below 10k', () => {
    expect(formatCompactCount(1234)).toBe('1.2k');
  });

  it('drops the decimal at 10k and above', () => {
    expect(formatCompactCount(12345)).toBe('12k');
  });

  it('prefers a whole number over "1.0k"', () => {
    expect(formatCompactCount(1000)).toBe('1k');
  });

  it('abbreviates millions', () => {
    expect(formatCompactCount(2_500_000)).toBe('2.5m');
  });

  it('never returns a negative count', () => {
    expect(formatCompactCount(-5)).toBe('0');
  });
});

describe('formatDistanceKm', () => {
  it('buckets sub-kilometre distances', () => {
    expect(formatDistanceKm(0.4)).toBe('<1 km');
  });

  it('rounds to whole kilometres', () => {
    expect(formatDistanceKm(6.6)).toBe('7 km');
  });

  it('returns an empty string for invalid input', () => {
    expect(formatDistanceKm(Number.NaN)).toBe('');
    expect(formatDistanceKm(-1)).toBe('');
  });
});

describe('countryFlag', () => {
  it('renders a country code as its flag', () => {
    expect(countryFlag('SA')).toBe('🇸🇦');
  });

  it('accepts lowercase input', () => {
    expect(countryFlag('de')).toBe('🇩🇪');
  });

  it('degrades to an empty string rather than a broken glyph', () => {
    expect(countryFlag(undefined)).toBe('');
    expect(countryFlag('')).toBe('');
    expect(countryFlag('SAU')).toBe('');
    expect(countryFlag('12')).toBe('');
  });
});
