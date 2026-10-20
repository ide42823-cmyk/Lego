import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppCard } from '@/components/ui/app-card';
import { CategoryChip } from '@/components/ui/category-chip';
import { GradientFill } from '@/components/ui/gradient-fill';
import { Icon } from '@/components/ui/icon';
import { Radius, Spacing, TouchTarget } from '@/constants/theme';
import type { MeDashboard } from '@/core/data/types';
import { formatCompactCount } from '@/core/format';
import { membershipTiles, type MembershipTile } from '@/core/memberships';
import { useTheme } from '@/hooks/use-theme';
import { useTints } from '@/hooks/use-tints';

export interface MeWalletCardProps {
  me: MeDashboard;
  onRecharge: () => void;
  onJoin: (tile: MembershipTile) => void;
}

/**
 * The wallet and join card: the coin balance on top, the two membership tiles
 * beneath it.
 *
 * The number is read from the dashboard and never edited here — topping up or
 * joining starts a server flow, so this screen only reports what it was told.
 */
export function MeWalletCard({ me, onRecharge, onJoin }: MeWalletCardProps) {
  const theme = useTheme();
  const tints = useTints();
  const tiles = membershipTiles(me.memberships);
  const tileTint = tints.me.tierTile;

  return (
    <AppCard padded={false} style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Recharge. Balance ${me.coinBalance} coins`}
        onPress={onRecharge}
        style={({ pressed }) => [styles.head, pressed && styles.pressed]}
      >
        <View style={styles.titleRow}>
          <ThemedText style={styles.title}>Recharge</ThemedText>
          <CategoryChip tone="trending" label="Reward" pill />
        </View>
        <View style={styles.balance}>
          <Icon name="coin" size={20} color={tints.level.to} strokeWidth={2.2} />
          <ThemedText style={styles.balanceValue}>{formatCompactCount(me.coinBalance)}</ThemedText>
          <Icon name="forward" size={18} color={theme.textSecondary} />
        </View>
      </Pressable>

      {tiles.length > 0 ? (
        <View style={styles.tiles}>
          {tiles.map((tile) => (
            <Pressable
              key={tile.key}
              accessibilityRole="button"
              accessibilityLabel={`${tile.label}. ${tile.action}`}
              onPress={() => onJoin(tile)}
              style={({ pressed }) => [
                styles.tile,
                { borderColor: tileTint.border },
                pressed && styles.pressed,
              ]}
            >
              <GradientFill from={tileTint.from} to={tileTint.to} />
              <View style={styles.tileInner}>
                <View style={styles.tileCopy}>
                  <ThemedText numberOfLines={1} style={[styles.tileLabel, { color: tileTint.ink }]}>
                    {tile.label}
                  </ThemedText>
                  <ThemedText style={[styles.tileAction, { color: tileTint.ink }]}>
                    {tile.action}
                  </ThemedText>
                </View>
                <Icon
                  name={tile.key === 'aristocracy' ? 'shield' : 'crown'}
                  size={30}
                  strokeWidth={1.8}
                  color={tileTint.accent}
                />
              </View>
            </Pressable>
          ))}
        </View>
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { padding: Spacing.three, gap: Spacing.three },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    minHeight: TouchTarget - 8,
  },
  pressed: { opacity: 0.85 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  title: { fontSize: 19, lineHeight: 26, fontWeight: '800' },
  balance: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  balanceValue: { fontSize: 20, lineHeight: 26, fontWeight: '800' },

  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  tile: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 128,
    minHeight: 78,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    borderRadius: Radius.large,
    borderWidth: 1,
    overflow: 'hidden',
  },
  /**
   * Positioned so it paints above `GradientFill`: on web an absolutely
   * positioned sibling paints after in-flow content, whatever the order.
   */
  tileInner: {
    flex: 1,
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  tileCopy: { flex: 1, gap: 1 },
  tileLabel: { fontSize: 14, lineHeight: 20, fontWeight: '800' },
  /** The second line is a call to action, so it is quieter than the tier name. */
  tileAction: { fontSize: 13, lineHeight: 18, fontWeight: '600', opacity: 0.75 },
});
