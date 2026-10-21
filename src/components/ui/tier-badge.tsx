import { StyleSheet, View, type ViewProps } from 'react-native';

import { Radius, Spacing, type TierTintKey } from '@/constants/theme';
import { useTints } from '@/hooks/use-tints';

import { ThemedText } from '../themed-text';
import { GradientFill } from './gradient-fill';
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
 * The reference paints the paid ranks as small metallic capsules rather than
 * outline chips, so the pill carries a two-stop gradient and a light rim. The
 * shape is our own; the tier's *meaning* stays data-driven.
 *
 * Presentation only. Whether a member *holds* a tier is an entitlement the
 * server decides — the badge never implies access by itself.
 */
export function TierBadge({ tier, label, crowned = false, style, ...rest }: TierBadgeProps) {
  const tints = useTints();
  const colors = tints.tier[tier];

  return (
    <View style={[styles.pill, { backgroundColor: colors.from }, style]} {...rest}>
      <GradientFill from={colors.from} to={colors.to} radius={Radius.pill} />
      {crowned ? (
        <Icon name="crown" size={13} strokeWidth={1.5} color={colors.text} fill={colors.text} />
      ) : null}
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
    gap: 4,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2.5,
    // A capsule, so it sits in the identity row as one of the chips.
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.55)',
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  label: { fontSize: 12.5, lineHeight: 18, fontWeight: '800' },
});
