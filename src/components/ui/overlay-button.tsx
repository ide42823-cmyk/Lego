import { Pressable, StyleSheet, type PressableProps } from 'react-native';

import { Radius, TouchTarget } from '@/constants/theme';

import { Icon, type IconName } from './icon';

export interface OverlayButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  /** Required: an icon-only control has no text of its own. */
  label: string;
  name: IconName;
  size?: number;
}

/**
 * A control that floats over imagery (a profile cover, a room header, a media
 * viewer).
 *
 * It cannot use the page's text colour, because the pixels underneath are
 * arbitrary. Instead it carries its own translucent scrim, which is what keeps
 * the glyph above the 3:1 contrast floor whether the photo behind it is a bright
 * sky or a dark room.
 */
export function OverlayButton({ label, name, size = 22, ...rest }: OverlayButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={({ pressed }) => [styles.base, { opacity: pressed ? 0.7 : 1 }]}
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
    // Not theme-aware on purpose: this sits on a photograph, not on the page.
    backgroundColor: 'rgba(0, 0, 0, 0.32)',
  },
});
