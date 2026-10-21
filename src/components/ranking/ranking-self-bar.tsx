import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RankingPalette, Spacing } from '@/constants/theme';
import type { MeDashboard } from '@/core/data/types';

import { ThemedText } from '../themed-text';
import { Avatar } from '../ui/avatar';
import { TierBadge } from '../ui/tier-badge';

export interface RankingSelfBarProps {
  me: MeDashboard | null;
}

/**
 * The pinned "you" row at the bottom of the stage.
 *
 * The reference can print a real position and score here because its backend
 * owns the board. This build has no viewer rank, so it says exactly that rather
 * than inventing one. The membership pill is the same presentation-only
 * entitlement the Me screen shows; it is not a client-side grant.
 */
export function RankingSelfBar({ me }: RankingSelfBarProps) {
  const insets = useSafeAreaInsets();
  const vipActive = me?.memberships.some(
    (membership) => membership.id === 'vip' && membership.status === 'active',
  );

  return (
    <View
      accessible
      accessibilityLabel="Your rank: not ranked yet. Your regional rank arrives with the backend phase."
      style={[styles.bar, { paddingBottom: insets.bottom + Spacing.two }]}
    >
      <ThemedText style={styles.rank}>—</ThemedText>

      <Avatar id="user-me" name="You" uri={me?.avatarUrl} size={38} accessible={false} />

      <View style={styles.body}>
        <ThemedText style={styles.name}>You</ThemedText>
        {vipActive ? <TierBadge tier="vip" label="VIP" crowned style={styles.tier} /> : null}
      </View>

      <ThemedText style={styles.status}>Not ranked yet</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two + 2,
    paddingTop: Spacing.two,
    paddingHorizontal: Spacing.three,
    backgroundColor: RankingPalette.selfBar,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: RankingPalette.border,
  },
  rank: {
    width: 30,
    color: RankingPalette.textFaint,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    textAlign: 'start',
  },
  body: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 2,
  },
  name: {
    color: RankingPalette.text,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
  tier: { alignSelf: 'flex-start' },
  status: {
    color: RankingPalette.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
});
