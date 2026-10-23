import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import type { PromoBanner as PromoBannerModel } from '@/core/data/types';
import { useTheme } from '@/hooks/use-theme';
import { useTints } from '@/hooks/use-tints';

import { ThemedText } from './themed-text';
import { AppCard } from './ui/app-card';
import { Avatar } from './ui/avatar';
import { GradientFill } from './ui/gradient-fill';
import { Icon, type IconName } from './ui/icon';

/**
 * Promotional content interleaved into feeds (reference screens 097–100, 082).
 *
 * Kept visually distinct from data rows on purpose: promoted content must not
 * be mistaken for an organic result. `banner` is the wide, full-bleed gradient
 * plate used inside discovery feeds; `row` is the compact card used above an
 * inbox — a filled circular programme mark, the programme's copy and, when the
 * caller passes real members, an overlapping stack of them.
 *
 * The reference uses third-party campaign artwork. This component deliberately
 * does not: the mark is a generic glyph and the stack can only carry members
 * the app already knows, never stock faces.
 */
export type PromoBannerVariant = 'banner' | 'row';

const TONE_ICON: Record<'families' | 'event' | 'recharge', IconName> = {
  families: 'family',
  event: 'party',
  recharge: 'coin',
};

export interface PromoBannerStackMember {
  /** Stable identity for the accessibility tree and dedupe, e.g. a peer id. */
  id: string;
  name: string;
  uri?: string;
}

export interface PromoBannerProps {
  banner: PromoBannerModel;
  variant?: PromoBannerVariant;
  /** Real members shown in the row variant's overlap stack. Optional. */
  stack?: readonly PromoBannerStackMember[];
  onPress?: (bannerId: string) => void;
}

export function PromoBanner({ banner, variant = 'banner', stack, onPress }: PromoBannerProps) {
  const theme = useTheme();
  const tints = useTints();

  const accessibilityLabel = `${banner.title}. ${banner.subtitle ?? ''} ${banner.ctaLabel}`.trim();

  if (variant === 'row') {
    const visibleStack = (stack ?? []).slice(0, 3);

    return (
      <AppCard padded={false} style={styles.rowCard}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          onPress={() => onPress?.(banner.id)}
          style={({ pressed }) => [styles.rowInner, pressed && { opacity: 0.8 }]}
        >
          <View style={styles.rowIcon}>
            <GradientFill
              from={tints.promo[banner.tone ?? 'families'].from}
              to={tints.promo[banner.tone ?? 'families'].to}
              radius={28}
            />
            <Icon
              name={
                banner.tone === 'recharge' ? 'coin' : banner.tone === 'event' ? 'party' : 'house'
              }
              size={26}
              color="#FFFFFF"
            />
          </View>
          <View style={styles.copy}>
            <ThemedText numberOfLines={1} style={styles.rowTitle}>
              {banner.title}
            </ThemedText>
            {banner.subtitle ? (
              <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                {banner.subtitle}
              </ThemedText>
            ) : null}
          </View>
          {visibleStack.length > 0 ? (
            <View
              style={styles.stack}
              pointerEvents="none"
              accessible
              accessibilityLabel={visibleStack.map((member) => member.name).join(', ')}
            >
              {visibleStack.map((member, index) => (
                <View
                  key={member.id}
                  style={[
                    styles.stackItem,
                    { borderColor: theme.surface },
                    index > 0 && styles.stackOverlap,
                  ]}
                >
                  <Avatar id={member.id} name={member.name} uri={member.uri} size={38} />
                </View>
              ))}
            </View>
          ) : (
            <Icon name="forward" size={18} color={theme.textSecondary} />
          )}
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

        {/* The reference's carousel indicators, drawn as quiet decoration: the
            plate is a single static promo, so only the first dot is lit. */}
        <View pointerEvents="none" style={styles.dots}>
          {Array.from({ length: 5 }, (_, index) => (
            <View key={index} style={[styles.dot, index === 0 && styles.dotActive]} />
          ))}
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
    padding: Spacing.three,
  },
  rowIcon: {
    width: 56,
    height: 56,
    borderRadius: Radius.pill,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, gap: Spacing.half },
  rowTitle: { fontSize: 18, lineHeight: 24, fontWeight: '700' },
  stack: { flexDirection: 'row', alignItems: 'center' },
  stackItem: {
    width: 42,
    height: 42,
    borderRadius: Radius.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stackOverlap: { marginStart: -12 },

  bannerCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 0,
  },
  bannerInner: {
    minHeight: 96,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: Spacing.three,
    // Leaves quiet room along the bottom edge for the pagination dots.
    paddingBottom: Spacing.three + Spacing.two,
    overflow: 'hidden',
  },
  dots: {
    position: 'absolute',
    start: 0,
    end: 0,
    bottom: 7,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  dotActive: { backgroundColor: '#FFFFFF' },
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
