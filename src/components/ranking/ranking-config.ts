import type { TierTintKey } from '@/constants/theme';
import type { IconName } from '@/components/ui/icon';
import type { LeaderboardCategory, LeaderboardEntry, LeaderboardPeriod } from '@/core/data/types';
import { LEADERBOARD_CATEGORIES, LEADERBOARD_PERIODS } from '@/core/leaderboard';

export interface LeaderboardCategoryMeta {
  key: LeaderboardCategory;
  label: string;
  /** Used by the unavailable state; the boards themselves show a heart score. */
  icon: IconName;
  /** Spoken metric for the value column ("65k Charm"), not a column heading. */
  metric: string;
}

/**
 * The six categories in the reference's order. One table keeps the tabs, the
 * podium, the rows and the a11y metric from drifting apart.
 */
export const LEADERBOARD_CATEGORY_META: Record<LeaderboardCategory, LeaderboardCategoryMeta> = {
  charm: { key: 'charm', label: 'Charm', icon: 'diamonds', metric: 'Charm' },
  wealth: { key: 'wealth', label: 'Wealth', icon: 'crown', metric: 'Wealth' },
  newcomer: { key: 'newcomer', label: 'Newcomer', icon: 'sparkle', metric: 'Newcomer' },
  room: { key: 'room', label: 'Room', icon: 'rooms', metric: 'Activity' },
  games: { key: 'games', label: 'Games', icon: 'games', metric: 'Games' },
  family: { key: 'family', label: 'Family', icon: 'family', metric: 'Family' },
};

export const LEADERBOARD_CATEGORY_ITEMS = LEADERBOARD_CATEGORIES.map(
  (key) => LEADERBOARD_CATEGORY_META[key],
);

export interface LeaderboardPeriodItem {
  key: LeaderboardPeriod;
  label: string;
}

export const LEADERBOARD_PERIOD_ITEMS: readonly LeaderboardPeriodItem[] = LEADERBOARD_PERIODS.map(
  (key) =>
    ({
      key,
      label: key === 'daily' ? 'Daily' : key === 'weekly' ? 'Weekly' : 'Monthly',
    }) satisfies LeaderboardPeriodItem,
);

export function leaderboardPeriodLabel(period: LeaderboardPeriod): string {
  return LEADERBOARD_PERIOD_ITEMS.find((item) => item.key === period)?.label ?? 'Daily';
}

export interface LeaderboardTier {
  tier: TierTintKey;
  label: string;
}

/**
 * The paid rank a row should show, if any.
 *
 * This is presentation only. `badges` is supplied by the data source; the
 * component never infers an entitlement from a level or from the category.
 */
export function leaderboardTierFor(entry: LeaderboardEntry): LeaderboardTier | null {
  if (entry.badges?.includes('svip')) {
    return { tier: 'svip', label: 'SVIP' };
  }
  if (entry.badges?.includes('vip') && entry.vipTier) {
    return { tier: 'vip', label: `VIP${entry.vipTier}` };
  }
  if (entry.badges?.includes('aristocracy')) {
    return { tier: 'aristocracy', label: 'AR' };
  }
  return null;
}
