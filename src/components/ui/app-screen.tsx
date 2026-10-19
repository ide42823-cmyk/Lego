import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing, type TabTintKey } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useTints } from '@/hooks/use-tints';

import { ScreenGradient } from './screen-gradient';

export interface AppScreenProps extends ViewProps {
  children: ReactNode;
  /** Wrap children in a vertical ScrollView. */
  scroll?: boolean;
  /** Add default horizontal padding. Disable for full-bleed lists. */
  padded?: boolean;
  /**
   * Header wash for this tab. Primary tabs each carry their own hue; pushed
   * screens leave it unset.
   */
  tint?: TabTintKey;
}

/**
 * The root container for every screen. Owns background colour, the top safe
 * area, the optional header wash and optional scrolling, so individual screens
 * never re-implement any of it.
 */
export function AppScreen({
  children,
  scroll = false,
  padded = true,
  tint,
  style,
  ...rest
}: AppScreenProps) {
  const theme = useTheme();
  const tints = useTints();
  const insets = useSafeAreaInsets();

  const body = (flex: boolean) => (
    <View style={[flex && styles.flex, padded && styles.padded, style]} {...rest}>
      {children}
    </View>
  );

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      {tint ? <ScreenGradient color={tints.tab[tint]} /> : null}
      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top, paddingBottom: insets.bottom + Spacing.six },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {body(false)}
        </ScrollView>
      ) : (
        <View style={[styles.flex, { paddingTop: insets.top }]}>{body(true)}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  padded: { paddingHorizontal: Spacing.three },
});
