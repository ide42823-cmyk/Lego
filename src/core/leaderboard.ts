/**
 * Leaderboard vocabulary and presentation-independent helpers.
 *
 * The values behind the boards are fixtures for now, but the *shape* of the
 * screen — categories in a fixed order, a period selector, top three plus the
 * rest — is product meaning, not styling. Keeping it here gives the route
 * params and the data contract one source of truth and makes the split testable
 * without rendering anything.
 */

import type { LeaderboardCategory, LeaderboardPeriod } from './data/types';

/** The reference's category order: Charm, Wealth, Newcomer, Room, Games, Family. */
export const LEADERBOARD_CATEGORIES = [
  'charm',
  'wealth',
  'newcomer',
  'room',
  'games',
  'family',
] as const satisfies readonly LeaderboardCategory[];

export const LEADERBOARD_PERIODS = [
  'daily',
  'weekly',
  'monthly',
] as const satisfies readonly LeaderboardPeriod[];

export function isLeaderboardCategory(value: unknown): value is LeaderboardCategory {
  return typeof value === 'string' && (LEADERBOARD_CATEGORIES as readonly string[]).includes(value);
}

export function isLeaderboardPeriod(value: unknown): value is LeaderboardPeriod {
  return typeof value === 'string' && (LEADERBOARD_PERIODS as readonly string[]).includes(value);
}

export interface PodiumSplit<T> {
  /** Ranks 1-3, in rank order. */
  podium: T[];
  /** Ranks 4 and below, still in rank order. */
  rest: T[];
}

/**
 * Splits an ordered board into its podium and the list beneath it.
 *
 * The two slices cover the input exactly once. A board with fewer than three
 * entries is allowed — the newcomer cohort can legitimately be small — and the
 * podium renders whatever ranks exist.
 */
export function splitPodium<T>(entries: readonly T[]): PodiumSplit<T> {
  return {
    podium: entries.slice(0, 3),
    rest: entries.slice(3),
  };
}
