import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface AppScreenProps extends ViewProps {
  children: ReactNode;
  /** Wrap children in a vertical ScrollView. */
  scroll?: boolean;
  /** Add default horizontal padding. Disable for full-bleed lists. */
  padded?: boolean;
}

/**
 * The root container for every screen. Owns background colour, safe areas and
 * optional scrolling so individual screens never re-implement it.
 */
export function AppScreen({
  children,
  scroll = false,
  padded = true,
  style,
  ...rest
}: AppScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const content = (
    <View style={[padded && styles.padded, style]} {...rest}>
      {children}
    </View>
  );

  if (!scroll) {
    return <View style={[styles.flex, { backgroundColor: theme.background }]}>{content}</View>;
  }

  return (
    <ScrollView
      style={[styles.flex, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.six }]}
      keyboardShouldPersistTaps="handled"
    >
      {content}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  padded: { paddingHorizontal: Spacing.three },
});
