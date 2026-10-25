import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import type { DiamondExchangeTier, DiamondsWallet } from '@/core/data/types';

import { ThemedText } from '../themed-text';
import { GradientFill } from '../ui/gradient-fill';
import { Icon } from '../ui/icon';

/**
 * The page carries its own blue/white financial identity independent of the
 * colour scheme, exactly like the reference — so the palette is fixed here.
 */
const INK = {
  headerTop: '#6CA9FE',
  headerBottom: '#3F87F3',
  balance: '#FFFFFF',
  balanceSub: '#E4F1FF',
  sheet: '#FFFFFF',
  title: '#17171B',
  pill: '#DCF1FE',
  pillText: '#28A0F6',
  divider: '#ECECEE',
  grabber: '#C4C5C9',
  violetAccent: '#7C5CF0',
} as const;

export interface DiamondsWalletViewProps {
  wallet: DiamondsWallet;
  onBack: () => void;
  /** The Diamonds record shortcut: a server-owned history surface. */
  onRecord: () => void;
  /** A tier press asks the server's exchange service; the client never applies one. */
  onExchange: (tier: DiamondExchangeTier) => void;
}

/**
 * The reference's My Diamonds page (screen 057): a blue header with the
 * server-owned balance, a watermark diamond, then the white exchange sheet
 * with the coin-to-diamond ladder. Every rate comes from the seam; pressing a
 * tier reports to the screen, which owns the backend gate — the client never
 * applies an exchange or a balance change locally.
 */
export function DiamondsWalletView({
  wallet,
  onBack,
  onRecord,
  onExchange,
}: DiamondsWalletViewProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.headerArt}>
        <GradientFill from={INK.headerTop} to={INK.headerBottom} radius={0} vertical />
        <View style={styles.watermark} pointerEvents="none">
          <Icon name="diamonds" size={170} color="rgba(255, 255, 255, 0.14)" />
        </View>
        <View style={styles.headerContent}>
          <View style={styles.headerBar}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back"
              onPress={onBack}
              style={styles.back}
            >
              <Icon name="back" size={24} color={INK.balance} strokeWidth={2.1} />
            </Pressable>
            <ThemedText style={styles.pageTitle}>My Diamonds</ThemedText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Diamonds record"
              onPress={onRecord}
              style={({ pressed }) => [styles.record, pressed && { opacity: 0.8 }]}
            >
              <ThemedText style={styles.recordLabel}>Diamonds record</ThemedText>
            </Pressable>
          </View>
          <View style={styles.balanceArea}>
            <ThemedText style={styles.balance}>{wallet.balance}</ThemedText>
            <View style={styles.balanceLine}>
              <Icon name="diamonds" size={18} color={INK.balanceSub} />
              <ThemedText style={styles.balanceLabel}>Diamonds Balance</ThemedText>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.sheet}>
        <View style={styles.sheetHead}>
          <View>
            <ThemedText style={styles.sheetTitle}>Exchange</ThemedText>
            <View style={styles.violetChip} />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open the Diamonds record"
            onPress={onRecord}
            style={({ pressed }) => [styles.history, pressed && { opacity: 0.7 }]}
          >
            <Icon name="history" size={22} color={INK.title} strokeWidth={2} />
          </Pressable>
        </View>
        {wallet.tiers.map((tier, index) => (
          <View key={tier.id} style={styles.row}>
            <View style={styles.coinPile}>
              <Icon name="coin" size={16 + index * 3} color="#F5A700" />
            </View>
            <ThemedText style={styles.coins} type="smallBold" numberOfLines={1}>
              {tier.coins} coins
            </ThemedText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Exchange ${tier.coins} coins for ${tier.diamonds} diamonds`}
              onPress={() => onExchange(tier)}
              style={({ pressed }) => [styles.pill, pressed && { opacity: 0.85 }]}
            >
              <ThemedText style={styles.pillLabel}>{tier.diamonds}</ThemedText>
              <Icon name="diamonds" size={15} color={INK.pillText} />
            </Pressable>
          </View>
        ))}
        <View style={styles.grabber} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: INK.sheet,
  },
  headerArt: {
    paddingTop: Spacing.two + Spacing.one,
    paddingBottom: Spacing.four,
    overflow: 'hidden',
  },
  watermark: {
    position: 'absolute',
    end: -26,
    top: 26,
  },
  /**
   * Positioned so it paints above `GradientFill`: on web an absolutely
   * positioned sibling paints after in-flow content, whatever the order.
   */
  headerContent: {
    position: 'relative',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    height: 44,
  },
  back: {
    padding: Spacing.one,
  },
  pageTitle: {
    color: INK.balance,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },
  record: {
    padding: Spacing.one,
    marginLeft: 'auto',
  },
  recordLabel: {
    color: INK.balance,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
  },
  balanceArea: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    gap: Spacing.one,
  },
  balance: {
    color: INK.balance,
    fontSize: 44,
    lineHeight: 52,
    fontWeight: '800',
  },
  balanceLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  balanceLabel: {
    color: INK.balanceSub,
    fontSize: 14,
    lineHeight: 20,
  },
  sheet: {
    flex: 1,
    backgroundColor: INK.sheet,
    borderTopStartRadius: 24,
    borderTopEndRadius: 24,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    marginTop: -22,
  },
  sheetHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.one,
  },
  sheetTitle: {
    color: INK.title,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
  },
  violetChip: {
    width: 26,
    height: 4,
    borderRadius: 2,
    backgroundColor: INK.violetAccent,
    marginTop: 2,
  },
  history: {
    marginLeft: 'auto',
    padding: Spacing.one,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: INK.divider,
  },
  coinPile: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 187, 27, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coins: {
    color: INK.title,
    fontSize: 17,
    flex: 1,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: INK.pill,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two - 2,
  },
  pillLabel: {
    color: INK.pillText,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  grabber: {
    alignSelf: 'center',
    width: 120,
    height: 4,
    borderRadius: 2,
    backgroundColor: INK.grabber,
    marginTop: Spacing.three,
    marginBottom: Spacing.two,
  },
});
