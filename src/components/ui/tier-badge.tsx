import { StyleSheet, View, type ViewProps } from 'react-native';

import { Radius, Spacing, type TierTintKey } from '@/constants/theme';
import { useTints } from '@/hooks/use-tints';

import { ThemedText } from '../themed-text';
import { Icon } from './icon';

export interface TierBadgeProps extends ViewProps {
  tier: TierTintKey;
  label: string;
  /** Prefix a crown. Used for paid tiers only. */
  crowned?: boolean;
}

/**
 * A membership rank pill (VIP, SVIP, Aristocracy).
 *
 * Presentation only. Whether a member *holds* a tier is an entitlement the
 * server decides — the badge never implies access by itself.
 */
export function TierBadge({ tier, label, crowned = false, style, ...rest }: TierBadgeProps) {
  const tints = useTints();
  const colors = tints.tier[tier];

  return (
    <View
      style={[styles.pill, { backgroundColor: colors.from, borderColor: colors.to }, style]}
      {...rest}
    >
      {crowned ? <Icon name="crown" size={11} strokeWidth={2.4} color={colors.text} /> : null}
      <ThemedText type="small" style={[styles.label, { color: colors.text }]}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: Spacing.two,
    paddingVertical: 1,
    borderRadius: Radius.small,
    borderWidth: StyleSheet.hairlineWidth * 2,
    alignSelf: 'flex-start',
  },
  label: { fontSize: 11, lineHeight: 16, fontWeight: '800' },
});
