import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import type { UserBadge } from '@/core/data/types';

import { CategoryChip } from './ui/category-chip';
import { Icon } from './ui/icon';
import { LevelEmblem } from './ui/level-emblem';
import { TierBadge } from './ui/tier-badge';

/**
 * Paid ranks, rarest first. Exported because a row may place the rank outside
 * the cluster — the discovery cards put it beside the age pill, which is where
 * the reference puts it.
 */
export const RANK_BADGES: readonly UserBadge[] = ['svip', 'vip', 'aristocracy'];

const BADGE_ORDER: UserBadge[] = ['level', 'vip', 'svip', 'aristocracy', 'verified', 'new'];

export interface UserBadgeItemProps {
  badge: UserBadge;
  level?: number;
  vipTier?: number;
}

/** Renders one badge. A missing level renders nothing rather than a crest "0". */
export function UserBadgeItem({ badge, level, vipTier }: UserBadgeItemProps) {
  switch (badge) {
    case 'level':
      return typeof level === 'number' && level > 0 ? <LevelEmblem level={level} /> : null;
    case 'vip':
      return <TierBadge tier="vip" label={vipTier ? `VIP${vipTier}` : 'VIP'} crowned />;
    case 'svip':
      return <TierBadge tier="svip" label="SVIP" crowned />;
    case 'aristocracy':
      return <TierBadge tier="aristocracy" label="AR" crowned />;
    case 'verified':
      return <Icon name="verified" size={16} color="#7C4DF0" label="Verified" />;
    case 'new':
      return <CategoryChip tone="trending" label="NEW" />;
    default:
      return null;
  }
}

export interface UserBadgesProps {
  badges: readonly UserBadge[];
  level?: number;
  vipTier?: number;
  /**
   * `all` renders the whole cluster. `status` omits the paid ranks so the caller
   * can surface them on their own line.
   */
  variant?: 'all' | 'status';
}

/**
 * The rank cluster shown next to a display name.
 *
 * Order matters for scanning: level first, then rank, then status. At most
 * three are shown so rows stay legible in both Arabic and Latin. Age is
 * deliberately not part of this cluster — it has its own pill (`AgePill`).
 */
export function UserBadges({ badges, level, vipTier, variant = 'all' }: UserBadgesProps) {
  const ordered = BADGE_ORDER.filter((badge) => {
    if (!badges.includes(badge)) {
      return false;
    }
    if (variant === 'status' && RANK_BADGES.includes(badge)) {
      return false;
    }
    // A level badge is only meaningful with a real level.
    return badge !== 'level' || (typeof level === 'number' && level > 0);
  }).slice(0, 3);

  if (ordered.length === 0) {
    return null;
  }

  return (
    <View style={styles.row}>
      {ordered.map((badge) => (
        <UserBadgeItem key={badge} badge={badge} level={level} vipTier={vipTier} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, flexWrap: 'wrap' },
});
