import {
  countryFlag,
  formatClusterStamp,
  formatCompactCount,
  formatDistanceKm,
  formatElapsedLong,
  formatInboxTime,
  formatMomentStamp,
  formatRelativeTime,
} from './index';

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

describe('formatMomentStamp', () => {
  it('opens with "Just now" under a minute', () => {
    expect(formatMomentStamp(at(45 * SECOND), NOW)).toBe('Just now');
  });

  it('counts minutes and hours in words', () => {
    expect(formatMomentStamp(at(5 * MINUTE), NOW)).toBe('5 minutes ago');
    expect(formatMomentStamp(at(16 * HOUR), NOW)).toBe('16 hours ago');
  });

  it('keeps a singular unit singular', () => {
    expect(formatMomentStamp(at(MINUTE), NOW)).toBe('1 minute ago');
    expect(formatMomentStamp(at(HOUR), NOW)).toBe('1 hour ago');
    expect(formatMomentStamp(at(DAY), NOW)).toBe('1 day ago');
  });

  it('counts days up to a week', () => {
    expect(formatMomentStamp(at(2 * DAY), NOW)).toBe('2 days ago');
  });

  it('prints a bare MM-DD past a week, with no "Active" prefix', () => {
    // 18 Oct minus 48 days is 31 Aug, the reference's own old-post stamp.
    expect(formatMomentStamp(at(48 * DAY), NOW)).toBe('08-31');
  });

  it('treats a future timestamp as "Just now"', () => {
    expect(formatMomentStamp(new Date(NOW + HOUR).toISOString(), NOW)).toBe('Just now');
  });

  it('returns an empty string for an unparseable timestamp', () => {
    expect(formatMomentStamp('not-a-date', NOW)).toBe('');
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
    expect(formatDistanceKm(0.4)).toBe('<1km');
  });

  it('keeps one decimal under 100 km, tight against the unit', () => {
    expect(formatDistanceKm(6.6)).toBe('6.6km');
    expect(formatDistanceKm(27)).toBe('27.0km');
  });

  it('prints whole kilometres from 100 km up', () => {
    expect(formatDistanceKm(1376)).toBe('1376km');
  });

  it('returns an empty string for invalid input', () => {
    expect(formatDistanceKm(Number.NaN)).toBe('');
    expect(formatDistanceKm(-1)).toBe('');
  });
});

describe('formatInboxTime', () => {
  // Built on local dates on purpose: the calendar-day comparisons in the
  // formatter run on the device's zone, so the tests must not assume UTC.
  const noon = new Date(2026, 9, 18, 12, 0, 0, 0).getTime();
  const atLocal = (day: number, hour: number, minute: number) =>
    new Date(2026, 9, day, hour, minute, 0, 0).toISOString();

  it('prints the clock for today', () => {
    expect(formatInboxTime(atLocal(18, 14, 34), noon)).toBe('14:34');
  });

  it('labels the previous calendar day as yesterday with the clock', () => {
    expect(formatInboxTime(atLocal(17, 21, 6), noon)).toBe('Yesterday 21:06');
  });

  it('still says yesterday for 23:59 the night before, not a two-day gap', () => {
    expect(formatInboxTime(atLocal(17, 23, 59), noon)).toBe('Yesterday 23:59');
  });

  it('prints a numeric date for anything older', () => {
    expect(formatInboxTime(atLocal(15, 9, 30), noon)).toBe('15-10-26');
  });

  it('degrades to an empty string for invalid input', () => {
    expect(formatInboxTime('not-a-date', noon)).toBe('');
  });
});

describe('formatClusterStamp', () => {
  it('prints the absolute date-and-time the thread strips use', () => {
    const stamp = new Date(2026, 9, 17, 17, 20).toISOString();
    expect(formatClusterStamp(stamp)).toBe('2026/10/17 17:20');
  });

  it('pads single digits so stamps align in a column', () => {
    const stamp = new Date(2026, 0, 4, 8, 5).toISOString();
    expect(formatClusterStamp(stamp)).toBe('2026/01/04 08:05');
  });

  it('degrades to an empty string for invalid input', () => {
    expect(formatClusterStamp('not-a-date')).toBe('');
  });
});

describe('formatElapsedLong', () => {
  it('reports anything under a minute as "Just now"', () => {
    expect(formatElapsedLong(at(0), NOW)).toBe('Just now');
  });

  it('spells out minutes, hours and days', () => {
    expect(formatElapsedLong(at(59 * MINUTE), NOW)).toBe('59 minutes ago');
    expect(formatElapsedLong(at(3 * HOUR), NOW)).toBe('3 hours ago');
    expect(formatElapsedLong(at(2 * DAY), NOW)).toBe('2 days ago');
  });

  it('does not pluralise a single unit', () => {
    expect(formatElapsedLong(at(1 * MINUTE), NOW)).toBe('1 minute ago');
    expect(formatElapsedLong(at(1 * HOUR), NOW)).toBe('1 hour ago');
    expect(formatElapsedLong(at(1 * DAY), NOW)).toBe('1 day ago');
  });

  it('falls back to a date once a week has passed', () => {
    expect(formatElapsedLong(at(30 * DAY), NOW)).toMatch(/^Active \d{1,2} [A-Z][a-z]{2}$/);
  });

  it('returns an empty string for invalid input', () => {
    expect(formatElapsedLong('not-a-date', NOW)).toBe('');
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
