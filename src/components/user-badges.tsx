import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import type { UserBadge } from '@/core/data/types';
import { formatLevel } from '@/core/format';

import { Badge } from './ui/badge';

/**
 * Renders the badge cluster shown next to a display name.
 *
 * Order matters for scanning: level first, then rank, then status. At most three
 * are shown so rows stay legible in both Arabic and Latin.
 */
export interface UserBadgesProps {
  badges: readonly UserBadge[];
  level?: number;
}

const BADGE_LABELS: Record<UserBadge, string> = {
  level: '',
  vip: 'VIP',
  svip: 'SVIP',
  aristocracy: 'AR',
  verified: '✓',
  new: 'NEW',
};

const BADGE_ORDER: UserBadge[] = ['level', 'vip', 'svip', 'aristocracy', 'verified', 'new'];

export function UserBadges({ badges, level }: UserBadgesProps) {
  const ordered = BADGE_ORDER.filter((badge) => badges.includes(badge)).slice(0, 3);
  if (ordered.length === 0) {
    return null;
  }

  return (
    <View style={styles.row}>
      {ordered.map((badge) => (
        <Badge
          key={badge}
          tone={badge}
          label={badge === 'level' ? formatLevel(level ?? 0) : BADGE_LABELS[badge]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, flexWrap: 'wrap' },
});
