import { StyleSheet, View, type ViewProps } from 'react-native';

import { Radius, Spacing, type ChipTintKey } from '@/constants/theme';
import { useTints } from '@/hooks/use-tints';

import { ThemedText } from '../themed-text';
import { Icon, type IconName } from './icon';

export interface CategoryChipProps extends ViewProps {
  label: string;
  tone?: ChipTintKey;
  icon?: IconName;
}

/**
 * The classification chip under a room's description.
 *
 * Tone carries the meaning (a family room is green, a video room blue), so the
 * chip stays readable when the label is translated and changes width.
 */
export function CategoryChip({ label, tone = 'neutral', icon, style, ...rest }: CategoryChipProps) {
  const tints = useTints();
  const colors = tints.chip[tone];

  return (
    <View style={[styles.chip, { backgroundColor: colors.background }, style]} {...rest}>
      {icon ? <Icon name={icon} size={11} strokeWidth={2.6} color={colors.text} /> : null}
      <ThemedText type="small" style={[styles.label, { color: colors.text }]}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: Radius.small,
    alignSelf: 'flex-start',
  },
  label: { fontSize: 11, lineHeight: 16, fontWeight: '700' },
});
