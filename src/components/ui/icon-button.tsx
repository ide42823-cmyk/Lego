import { Pressable, StyleSheet, type PressableProps } from 'react-native';
import type { SFSymbol } from 'expo-symbols';

import { Radius, TouchTarget } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Icon } from './icon';

export interface IconButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  /**
   * Required. Icon-only controls convey no text to assistive technology, so the
   * accessible name is not optional (see the reference analysis: "accessible
   * labels for icon-only buttons").
   */
  label: string;
  symbol: SFSymbol;
  glyph: string;
  size?: number;
  /** Tint the icon; defaults to primary text. */
  tone?: 'default' | 'accent' | 'brand' | 'muted';
  style?: PressableProps['style'];
}

export function IconButton({
  label,
  symbol,
  glyph,
  size = 20,
  tone = 'default',
  disabled,
  style,
  ...rest
}: IconButtonProps) {
  const theme = useTheme();

  const tones = {
    default: theme.text,
    accent: theme.accent,
    brand: theme.brand,
    muted: theme.textSecondary,
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
        {
          backgroundColor: state.pressed ? theme.backgroundElement : 'transparent',
          opacity: disabled ? 0.4 : 1,
        },
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}
    >
      <Icon symbol={symbol} glyph={glyph} size={size} color={tones[tone]} />
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
