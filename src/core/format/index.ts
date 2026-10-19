/**
 * Presentation formatting.
 *
 * Kept deliberately free of `Intl`: Hermes ships a reduced ICU on Android, so
 * relying on locale data at runtime produces platform-dependent output. These
 * helpers return stable, predictable strings and are easy to unit test.
 *
 * Localised formatting is a follow-up once the locale catalogue exists.
 */

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const SHORT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

/**
 * Compact age of a timestamp: `now`, `5m`, `3h`, `2d`, then `12 Mar`.
 * `now` is injectable so tests do not depend on the wall clock.
 */
export function formatRelativeTime(iso: string, now: number = Date.now()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) {
    return '';
  }

  const elapsed = Math.max(0, now - then);

  if (elapsed < MINUTE) {
    return 'now';
  }
  if (elapsed < HOUR) {
    return `${Math.floor(elapsed / MINUTE)}m`;
  }
  if (elapsed < DAY) {
    return `${Math.floor(elapsed / HOUR)}h`;
  }
  if (elapsed < 7 * DAY) {
    return `${Math.floor(elapsed / DAY)}d`;
  }

  const date = new Date(then);
  return `${date.getDate()} ${SHORT_MONTHS[date.getMonth()]}`;
}

/** `1234` → `1.2k`. Used for follower and participant counts. */
export function formatCompactCount(value: number): string {
  if (!Number.isFinite(value)) {
    return '0';
  }
  const rounded = Math.max(0, Math.floor(value));
  if (rounded < 1000) {
    return String(rounded);
  }
  if (rounded < 1_000_000) {
    const thousands = rounded / 1000;
    if (thousands >= 10) {
      return `${Math.floor(thousands)}k`;
    }
    // Prefer `1k` over `1.0k`.
    return `${Number.isInteger(thousands) ? thousands : thousands.toFixed(1)}k`;
  }
  return `${(rounded / 1_000_000).toFixed(1)}m`;
}

/**
 * Coarse distance copy. Distances are already bucketed by the data layer so no
 * precise location can leak into the UI.
 */
export function formatDistanceKm(km: number): string {
  if (!Number.isFinite(km) || km < 0) {
    return '';
  }
  if (km < 1) {
    return '<1 km';
  }
  return `${Math.round(km)} km`;
}

/** Numeric label for a membership tier badge. */
export function formatLevel(level: number): string {
  return `Lv ${Math.max(0, Math.floor(level))}`;
}
