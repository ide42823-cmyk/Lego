import { Pressable, StyleSheet } from 'react-native';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { CountBadge } from './badge';
import { Icon, type IconName } from './icon';

export interface FloatingActionProps {
  /** Accessible name; icon-only controls must not rely on the glyph. */
  label: string;
  name: IconName;
  onPress?: () => void;
  /** Optional counter, rendered as a badge on the corner. */
  badge?: number;
}

/**
 * The round action that floats above the bottom of a list.
 *
 * Positioned by its parent so each screen decides which corner it belongs in;
 * this component only owns appearance and the hit target.
 */
export function FloatingAction({ label, name, onPress, badge }: FloatingActionProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.brand, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <Icon name={name} size={24} color={theme.onBrand} />
      {badge && badge > 0 ? <CountBadge count={badge} accessibilityLabel={`${badge} new`} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 54,
    height: 54,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    // Keeps the badge from being clipped by the circular clip.
    overflow: 'visible',
  },
});
