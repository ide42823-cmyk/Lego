import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import type { PromoBanner as PromoBannerModel } from '@/core/data/types';
import { useTheme } from '@/hooks/use-theme';
import { useTints } from '@/hooks/use-tints';

import { ThemedText } from './themed-text';
import { AppCard } from './ui/app-card';
import { Icon } from './ui/icon';

/**
 * Promotional content interleaved into feeds (reference screens 097–100, 082).
 *
 * Kept visually distinct from data rows on purpose: promoted content must not
 * be mistaken for an organic result. `banner` is the wide wash used inside
 * discovery feeds; `row` is the compact card used above an inbox.
 */
export type PromoBannerVariant = 'banner' | 'row';

export interface PromoBannerProps {
  banner: PromoBannerModel;
  variant?: PromoBannerVariant;
  onPress?: (bannerId: string) => void;
}

export function PromoBanner({ banner, variant = 'banner', onPress }: PromoBannerProps) {
  const theme = useTheme();
  const tints = useTints();

  const accessibilityLabel = `${banner.title}. ${banner.subtitle ?? ''} ${banner.ctaLabel}`.trim();

  if (variant === 'row') {
    return (
      <AppCard padded={false} style={styles.rowCard}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          onPress={() => onPress?.(banner.id)}
          style={({ pressed }) => [styles.rowInner, pressed && { opacity: 0.8 }]}
        >
          <View style={[styles.rowIcon, { backgroundColor: tints.tab.home }]}>
            <Icon name="friends" size={24} color={theme.brand} />
          </View>
          <View style={styles.copy}>
            <ThemedText type="smallBold" numberOfLines={1}>
              {banner.title}
            </ThemedText>
            {banner.subtitle ? (
              <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                {banner.subtitle}
              </ThemedText>
            ) : null}
          </View>
          <Icon name="forward" size={18} color={theme.textSecondary} />
        </Pressable>
      </AppCard>
    );
  }

  return (
    <AppCard padded={false} style={[styles.bannerCard, { backgroundColor: tints.tab.messages }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={() => onPress?.(banner.id)}
        style={({ pressed }) => [styles.bannerInner, pressed && { opacity: 0.85 }]}
      >
        <View style={styles.copy}>
          <ThemedText type="smallBold" style={styles.bannerTitle}>
            {banner.title}
          </ThemedText>
          {banner.subtitle ? (
            <ThemedText
              type="small"
              themeColor="textSecondary"
              style={styles.bannerSubtitle}
              numberOfLines={1}
            >
              {banner.subtitle}
            </ThemedText>
          ) : null}
        </View>
        <View style={[styles.cta, { backgroundColor: theme.surface }]}>
          <ThemedText type="small" style={[styles.ctaLabel, { color: theme.brand }]}>
            {banner.ctaLabel}
          </ThemedText>
        </View>
      </Pressable>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  rowCard: { borderRadius: Radius.large },
  rowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.two + 2,
  },
  rowIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, gap: Spacing.half },

  bannerCard: { borderRadius: Radius.large },
  bannerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
  },
  bannerTitle: { fontSize: 16, lineHeight: 22 },
  // No colour here: the wash behind the banner changes with the scheme, so the
  // subtitle takes its colour from the theme rather than a fixed ink.
  bannerSubtitle: { opacity: 0.85 },
  cta: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
  },
  ctaLabel: { fontWeight: '700' },
});
