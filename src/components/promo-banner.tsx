import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import type { PromoBanner as PromoBannerModel } from '@/core/data/types';
import { useTheme } from '@/hooks/use-theme';
import { useTints } from '@/hooks/use-tints';

import { ThemedText } from './themed-text';
import { AppCard } from './ui/app-card';
import { GradientFill } from './ui/gradient-fill';
import { Icon, type IconName } from './ui/icon';

/**
 * Promotional content interleaved into feeds (reference screens 097–100, 082).
 *
 * Kept visually distinct from data rows on purpose: promoted content must not
 * be mistaken for an organic result. `banner` is the wide, full-bleed gradient
 * plate used inside discovery feeds; `row` is the compact card used above an
 * inbox.
 *
 * The reference uses third-party campaign artwork. This component deliberately
 * does not: the plate is our own gradient, with our own icon and copy.
 */
export type PromoBannerVariant = 'banner' | 'row';

const TONE_ICON: Record<'families' | 'event' | 'recharge', IconName> = {
  families: 'family',
  event: 'party',
  recharge: 'coin',
};

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

  const tone = tints.promo[banner.tone ?? 'families'];

  return (
    <AppCard padded={false} style={styles.bannerCard}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={() => onPress?.(banner.id)}
        style={({ pressed }) => [styles.bannerInner, pressed && { opacity: 0.9 }]}
      >
        <GradientFill from={tone.from} to={tone.to} radius={20} vertical />

        {/* Original decoration: soft light blooms, no campaign artwork. */}
        <View pointerEvents="none" style={[styles.glow, styles.glowLarge]} />
        <View pointerEvents="none" style={[styles.glow, styles.glowSmall]} />

        <View style={styles.bannerIcon}>
          <Icon name={TONE_ICON[banner.tone ?? 'families']} size={23} color="#FFFFFF" />
        </View>

        <View style={styles.copy}>
          <ThemedText type="smallBold" style={styles.bannerTitle} numberOfLines={1}>
            {banner.title}
          </ThemedText>
          {banner.subtitle ? (
            <ThemedText type="small" style={styles.bannerSubtitle} numberOfLines={1}>
              {banner.subtitle}
            </ThemedText>
          ) : null}
        </View>

        <View style={styles.cta}>
          <ThemedText type="small" style={[styles.ctaLabel, { color: tone.ctaInk }]}>
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

  bannerCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 0,
  },
  bannerInner: {
    minHeight: 108,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: Spacing.three,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  glowLarge: { width: 168, height: 168, end: -34, top: -44 },
  glowSmall: { width: 76, height: 76, start: 78, bottom: -30 },
  bannerIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: { fontSize: 18, lineHeight: 24, color: '#FFFFFF' },
  bannerSubtitle: { fontSize: 13, lineHeight: 18, color: 'rgba(255, 255, 255, 0.90)' },
  cta: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    backgroundColor: '#FFFFFF',
  },
  ctaLabel: { fontSize: 13, lineHeight: 18, fontWeight: '800' },
});
