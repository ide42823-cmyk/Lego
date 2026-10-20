import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { CardShadow, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useTints } from '@/hooks/use-tints';

export interface AppCardProps extends ViewProps {
  children: ReactNode;
  /** Apply the default inner padding. Disable for edge-to-edge content. */
  padded?: boolean;
}

/**
 * A raised surface.
 *
 * The reference uses white cards floating on the tinted page for people and
 * rooms, but flat rows for conversations and posts. This is the card half of
 * that pair; both share the same radius so the two rhythms still read as one
 * system.
 */
export function AppCard({ children, padded = true, style, ...rest }: AppCardProps) {
  const theme = useTheme();
  const tints = useTints();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          shadowColor: tints.cardShadow,
          // A hairline as well as the shadow: on web the shadow is faint, and in
          // the light scheme a white card on a white page would otherwise have
          // no edge at all.
          borderColor: theme.border,
        },
        padded && styles.padded,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.large,
    borderWidth: StyleSheet.hairlineWidth,
    ...CardShadow,
  },
  padded: { padding: Spacing.three },
});
