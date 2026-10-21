import { Pressable, StyleSheet, type PressableProps } from 'react-native';

import { Radius, TouchTarget } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Icon, type IconName } from './icon';

export interface IconButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  /**
   * Required. Icon-only controls convey no text to assistive technology, so the
   * accessible name is not optional (see the reference analysis: "accessible
   * labels for icon-only buttons").
   */
  label: string;
  name: IconName;
  size?: number;
  /** Fill the glyph, e.g. the solid gold ranking cup. */
  fill?: string;
  /** Tint the icon; defaults to primary text. */
  tone?: 'default' | 'accent' | 'brand' | 'muted' | 'gold';
  /**
   * Shrink the layout box to 40 pt while keeping the 44 pt touch target through
   * hitSlop. Used where three header actions share a row with four scrollable
   * tabs on a 384 pt phone.
   */
  compact?: boolean;
  style?: PressableProps['style'];
}

export function IconButton({
  label,
  name,
  size = 22,
  fill,
  tone = 'default',
  disabled,
  compact = false,
  style,
  ...rest
}: IconButtonProps) {
  const theme = useTheme();

  const tones = {
    default: theme.text,
    accent: theme.accent,
    brand: theme.brand,
    muted: theme.textSecondary,
    gold: theme.gold,
  } as const;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      hitSlop={8}
      style={(state) => [
        styles.base,
        compact && styles.compact,
        {
          backgroundColor: state.pressed ? theme.backgroundElement : 'transparent',
          opacity: disabled ? 0.4 : 1,
        },
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}
    >
      <Icon name={name} size={size} color={tones[tone]} fill={fill} />
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
  compact: { minWidth: TouchTarget - 4, minHeight: TouchTarget - 4 },
});
