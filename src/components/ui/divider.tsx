import { StyleSheet, View, type ViewProps } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface DividerProps extends ViewProps {
  /** Add vertical breathing room around the rule. */
  inset?: boolean;
}

export function Divider({ inset = false, style, ...rest }: DividerProps) {
  const theme = useTheme();

  return (
    <View
      // Decorative rule: no accessible role, it conveys no information.
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[styles.rule, { backgroundColor: theme.border }, inset && styles.inset, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  rule: { height: StyleSheet.hairlineWidth, width: '100%' },
  inset: { marginVertical: Spacing.two },
});
