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

/**
 * Inbox timestamp in the reference's shape: the sender's local clock for
 * today (`14:34`), `Yesterday 21:06` for the calendar day before, and a
 * numeric `DD-MM-YY` for anything older. Calendar days are compared on
 * midnight boundaries, so a 23:59 message is never mislabelled "Yesterday"
 * by a one-hour race. No `Intl`: Hermes on Android has a reduced ICU, and a
 * global inbox must not format per device locale yet.
 */
export function formatInboxTime(iso: string, now: number = Date.now()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) {
    return '';
  }

  const pad = (value: number) => String(value).padStart(2, '0');
  const clock = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

  const thenDate = new Date(then);
  const dayGap = calendarDayGap(then, now);

  if (dayGap === 0) {
    return clock(thenDate);
  }
  if (dayGap === 1) {
    return `Yesterday ${clock(thenDate)}`;
  }
  return numericDate(thenDate, pad);
}

/**
 * The thread's cluster stamp, in the reference's absolute shape:
 * `2026/10/17 17:20`. Unlike the inbox clock it never says "Yesterday" — a
 * chat reads better with the full date above each cluster. Shares the
 * local-date construction the other formatters use.
 */
export function formatClusterStamp(iso: string): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) {
    return '';
  }

  const pad = (value: number) => String(value).padStart(2, '0');
  return `${then.getFullYear()}/${pad(then.getMonth() + 1)}/${pad(then.getDate())} ${pad(
    then.getHours(),
  )}:${pad(then.getMinutes())}`;
}

/** Whole calendar days between two instants, compared on midnight boundaries. */
function calendarDayGap(thenMs: number, nowMs: number): number {
  const midnight = (value: number) => {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  };
  return Math.round((midnight(nowMs) - midnight(thenMs)) / DAY);
}

/** `15-10-26`, the thread and inbox's shared numeric old-date form. */
function numericDate(date: Date, pad: (value: number) => string): string {
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${String(
    date.getFullYear() % 100,
  ).padStart(2, '0')}`;
}

/**
 * Long-form age of a timestamp: `Just now`, `59 minutes ago`, `3 hours ago`,
 * `2 days ago`, then `Active 12 Mar`.
 *
 * Distinct from `formatRelativeTime` on purpose: a feed wants the compact form so
 * cards stay scannable, while a profile header states presence in words. `now` is
 * injectable so tests do not depend on the wall clock.
 */
export function formatElapsedLong(iso: string, now: number = Date.now()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) {
    return '';
  }

  const elapsed = Math.max(0, now - then);
  if (elapsed < MINUTE) {
    return 'Just now';
  }

  const plural = (value: number, unit: string) => `${value} ${unit}${value === 1 ? '' : 's'} ago`;

  if (elapsed < HOUR) {
    return plural(Math.floor(elapsed / MINUTE), 'minute');
  }
  if (elapsed < DAY) {
    return plural(Math.floor(elapsed / HOUR), 'hour');
  }
  if (elapsed < 7 * DAY) {
    return plural(Math.floor(elapsed / DAY), 'day');
  }

  const date = new Date(then);
  return `Active ${date.getDate()} ${SHORT_MONTHS[date.getMonth()]}`;
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
 * Distance copy in the reference's shape: the figure sits tight against `km`
 * (`7.5km`, `1376km`) rather than a spaced `7 km`. Sub-100 km rounds to one
 * decimal, which is the coarsest granularity nearby vetting uses; anything at
 * or beyond 100 prints whole kilometres. Distances stay directional estimates
 * bucketed by the data layer — no precise location can leak into the UI.
 */
export function formatDistanceKm(km: number): string {
  if (!Number.isFinite(km) || km < 0) {
    return '';
  }
  if (km < 1) {
    return '<1km';
  }
  if (km < 100) {
    return `${km.toFixed(1)}km`;
  }
  return `${Math.round(km)}km`;
}

/**
 * Renders an ISO-3166 alpha-2 code as its flag emoji.
 *
 * Country hints are deliberately coarse (see `UserSummary.locale`); this never
 * carries a precise location, and an unknown code degrades to an empty string
 * rather than a broken glyph.
 */
export function countryFlag(code?: string): string {
  if (!code || code.length !== 2) {
    return '';
  }
  const base = 0x1f1e6;
  const points = [...code.toUpperCase()].map((character) => base + (character.charCodeAt(0) - 65));
  if (points.some((point) => point < base || point > base + 25)) {
    return '';
  }
  return String.fromCodePoint(...points);
}
