import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import type { PromoBanner as PromoBannerModel } from '@/core/data/types';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from './themed-text';

/**
 * Promotional card interleaved into discovery feeds (reference screens 097–100).
 *
 * Kept visually distinct from data rows on purpose: promoted content must not be
 * mistaken for an organic result.
 */
export interface PromoBannerProps {
  banner: PromoBannerModel;
  onPress?: (bannerId: string) => void;
}

export function PromoBanner({ banner, onPress }: PromoBannerProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${banner.title}. ${banner.subtitle ?? ''} ${banner.ctaLabel}`.trim()}
      onPress={() => onPress?.(banner.id)}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.brandSoft, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <View style={styles.copy}>
        <ThemedText type="smallBold" style={{ color: theme.brand }}>
          {banner.title}
        </ThemedText>
        {banner.subtitle ? (
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
            {banner.subtitle}
          </ThemedText>
        ) : null}
      </View>
      <View style={[styles.cta, { backgroundColor: theme.brand }]}>
        <ThemedText type="small" style={[styles.ctaLabel, { color: theme.onBrand }]}>
          {banner.ctaLabel}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.large,
  },
  copy: { flex: 1, gap: Spacing.half },
  cta: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
  },
  ctaLabel: { fontWeight: '700' },
});
