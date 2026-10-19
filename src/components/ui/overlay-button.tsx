import {
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Radius, TouchTarget } from '@/constants/theme';

import { Icon, type IconName } from './icon';

export interface OverlayButtonProps extends Omit<PressableProps, 'children'> {
  /** Required: an icon-only control has no text of its own. */
  label: string;
  name: IconName;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * A control that floats over imagery (a profile cover, a room header, a media
 * viewer).
 *
 * It cannot use the page's text colour, because the pixels underneath are
 * arbitrary. It therefore stays *bare* — the reference draws white glyphs
 * directly on the photo — and the surface underneath owes it contrast: the
 * profile cover paints a soft top scrim for exactly this reason. A caller with
 * no such scrim should pass a translucent `style`.
 *
 * The 44pt target is kept even though nothing is painted at that size.
 */
export function OverlayButton({ label, name, size = 22, style, ...rest }: OverlayButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={({ pressed }) => [styles.base, style, { opacity: pressed ? 0.7 : 1 }]}
      {...rest}
    >
      <Icon name={name} size={size} color="#FFFFFF" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minWidth: TouchTarget,
    minHeight: TouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
  },
});
