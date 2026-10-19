import { StyleSheet, Text, View, type ViewProps } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from '../themed-text';

export interface TagChipProps extends ViewProps {
  label: string;
  /**
   * Leading emoji. Decorative only — the label always carries the meaning, so a
   * reader that cannot render the glyph loses nothing.
   */
  emoji?: string;
  /**
   * `small` is the inline metadata chip (room language, relationship type).
   * `medium` is the profile tag pill, which is a full-height rounded chip.
   */
  size?: 'small' | 'medium';
}

/** Static classification chip. Read-only — never a control. */
export function TagChip({ label, emoji, size = 'small', style, ...rest }: TagChipProps) {
  const theme = useTheme();
  const medium = size === 'medium';

  return (
    <View
      style={[
        styles.chip,
        medium ? styles.medium : styles.small,
        { backgroundColor: theme.backgroundElement },
        style,
      ]}
      {...rest}
    >
      {emoji ? (
        <Text style={[styles.emoji, medium && styles.emojiMedium]} accessible={false}>
          {emoji}
        </Text>
      ) : null}
      <ThemedText
        type="small"
        themeColor="textSecondary"
        style={medium ? styles.labelMedium : styles.label}
      >
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  small: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Radius.small,
  },
  medium: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
  },
  label: { fontSize: 11, lineHeight: 16, fontWeight: '600' },
  labelMedium: { fontSize: 13, lineHeight: 18, fontWeight: '600' },
  emoji: { fontSize: 12, lineHeight: 16 },
  emojiMedium: { fontSize: 15, lineHeight: 20 },
});
