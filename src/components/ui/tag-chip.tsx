import { StyleSheet, View, type ViewProps } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from '../themed-text';

export interface TagChipProps extends ViewProps {
  label: string;
}

/** Static classification chip (room category, language, relationship type). */
export function TagChip({ label, style, ...rest }: TagChipProps) {
  const theme = useTheme();

  return (
    <View style={[styles.chip, { backgroundColor: theme.backgroundElement }, style]} {...rest}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Radius.small,
  },
  label: { fontSize: 11, lineHeight: 16, fontWeight: '600' },
});
