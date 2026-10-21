import { I18nManager, Pressable, StyleSheet, View } from 'react-native';

import { RankingPalette, Spacing, TouchTarget } from '@/constants/theme';
import { ThemedText } from '../themed-text';
import { Icon } from '../ui/icon';

export interface RankingHeaderProps {
  onBack: () => void;
  onGift: () => void;
}

/**
 * The ranking destination header.
 *
 * It is not the shared `BackHeader` because the stage is always dark: the
 * shared header resolves its colours from the light/dark app theme, and a
 * light-scheme user would get black text on the purple sky. The structure is
 * the same — 44 pt back control, centred title, 44 pt trailing action — but the
 * ink is the stage's.
 */
export function RankingHeader({ onBack, onGift }: RankingHeaderProps) {
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={8}
        onPress={onBack}
        style={({ pressed }) => [styles.iconButton, pressed && styles.iconPressed]}
      >
        <Icon
          name={I18nManager.isRTL ? 'forward' : 'back'}
          size={26}
          strokeWidth={2.2}
          color={RankingPalette.text}
        />
      </Pressable>

      <ThemedText numberOfLines={1} style={styles.title}>
        Regional Rank
      </ThemedText>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Gifts"
        accessibilityHint="Gifting arrives with the backend phase"
        hitSlop={8}
        onPress={onGift}
        style={({ pressed }) => [styles.iconButton, pressed && styles.iconPressed]}
      >
        <Icon name="gift" size={24} strokeWidth={1.9} color={RankingPalette.gold} />
        <View style={styles.sparkle} pointerEvents="none">
          <Icon
            name="sparkle"
            size={10}
            strokeWidth={0}
            color={RankingPalette.gold}
            fill={RankingPalette.gold}
          />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
    gap: Spacing.two,
  },
  iconButton: {
    width: TouchTarget,
    height: TouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: TouchTarget,
  },
  iconPressed: { backgroundColor: RankingPalette.surface },
  title: {
    flex: 1,
    textAlign: 'center',
    color: RankingPalette.text,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  sparkle: {
    position: 'absolute',
    top: 6,
    right: 5,
  },
});
