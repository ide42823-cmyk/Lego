import { StyleSheet, View, type ViewProps } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import type { UserBadge } from '@/core/data/types';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from '../themed-text';

export type BadgeTone = UserBadge | 'neutral';

export interface BadgeProps extends ViewProps {
  tone?: BadgeTone;
  label: string;
}

/**
 * Small status/level pill. Tones match the reference system: gold for VIP-style
 * ranks, red for SVIP, green for Aristocracy, brand for levels.
 *
 * These are presentation only — whether a user *is* VIP is an entitlement the
 * server decides.
 */
export function Badge({ tone = 'neutral', label, style, ...rest }: BadgeProps) {
  const theme = useTheme();

  const tones: Record<BadgeTone, { background: string; text: string }> = {
    level: { background: theme.brandSoft, text: theme.brand },
    vip: { background: 'rgba(245, 179, 1, 0.18)', text: theme.gold },
    svip: { background: 'rgba(211, 47, 47, 0.16)', text: theme.danger },
    aristocracy: { background: 'rgba(46, 125, 50, 0.16)', text: theme.success },
    verified: { background: theme.brandSoft, text: theme.brand },
    new: { background: theme.accentSoft, text: theme.accent },
    neutral: { background: theme.backgroundElement, text: theme.textSecondary },
  };

  const colors = tones[tone];

  return (
    <View
      style={[styles.pill, { backgroundColor: colors.background }, style]}
      // The label is already meaningful text; announce it as-is.
      accessibilityRole="text"
      {...rest}
    >
      <ThemedText type="small" style={[styles.label, { color: colors.text }]}>
        {label}
      </ThemedText>
    </View>
  );
}

export interface CountBadgeProps {
  count: number;
  /** Caps the display, e.g. 99 → "99+". */
  max?: number;
  accessibilityLabel?: string;
}

/** Unread counter. Announced as "N unread" rather than a bare number. */
export function CountBadge({ count, max = 99, accessibilityLabel }: CountBadgeProps) {
  const theme = useTheme();
  if (count <= 0) {
    return null;
  }

  const display = count > max ? `${max}+` : String(count);

  return (
    <View
      style={[styles.count, { backgroundColor: theme.danger }]}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel ?? `${count} unread`}
    >
      <ThemedText type="small" style={[styles.countLabel, { color: '#FFFFFF' }]}>
        {display}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 1,
    borderRadius: Radius.small,
    alignSelf: 'flex-start',
  },
  label: { fontSize: 11, lineHeight: 16, fontWeight: '700' },
  count: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: Spacing.one + 2,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countLabel: { fontSize: 11, lineHeight: 14, fontWeight: '700' },
});
