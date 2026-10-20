import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';

import { ThemedText } from '../themed-text';
import { IconButton } from '../ui/icon-button';

export interface SearchHeaderProps {
  onBack: () => void;
}

/**
 * The pushed screen's title bar: a back control and a centred "Search".
 *
 * The title is centred against the screen rather than against the space left
 * over by the back button, which is what the reference does and what keeps the
 * heading from drifting when the trailing side is empty.
 */
export function SearchHeader({ onBack }: SearchHeaderProps) {
  return (
    <View style={styles.header}>
      <IconButton name="back" label="Go back" size={26} onPress={onBack} />
      <ThemedText accessibilityRole="header" style={styles.title}>
        Search
      </ThemedText>
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 19,
    lineHeight: 26,
    fontWeight: 700,
  },
  spacer: { width: 44 },
});
