import { StyleSheet, View, type ViewProps } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTints } from '@/hooks/use-tints';

import { ThemedText } from '../themed-text';
import { Icon } from '../ui/icon';

export interface ProfileAgencyChipProps extends ViewProps {
  /** Position within the agency, e.g. 5. */
  rank: number;
  /** Agency name, printed in small caps. */
  name: string;
}

/**
 * The agency/rank chip (reference screens 001, 027).
 *
 * The reference sets a small figure beside a wordmark, so the figure carries the
 * emphasis and the name is set smaller — reading it as a badge rather than as a
 * sentence. Presentation only.
 */
export function ProfileAgencyChip({ rank, name, style, ...rest }: ProfileAgencyChipProps) {
  const tints = useTints();
  const colors = tints.chip.rank;

  return (
    <View
      accessible
      accessibilityLabel={`Agency ${name}, rank ${rank}`}
      style={[styles.chip, { backgroundColor: colors.background }, style]}
      {...rest}
    >
      <Icon name="level" size={11} strokeWidth={2.6} color={colors.text} />
      <ThemedText type="small" style={[styles.rank, { color: colors.text }]}>
        {rank}
      </ThemedText>
      <ThemedText type="small" numberOfLines={1} style={[styles.name, { color: colors.text }]}>
        {name}
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
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
  },
  rank: { fontSize: 11, lineHeight: 16, fontWeight: '800' },
  name: { fontSize: 9, lineHeight: 16, fontWeight: '800', letterSpacing: 0.6 },
});
