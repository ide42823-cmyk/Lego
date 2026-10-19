import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type PressableProps } from 'react-native';

import { Radius, Spacing, TouchTarget } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from '../themed-text';

export type AppButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost';
export type AppButtonSize = 'medium' | 'large';

export interface AppButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  label: string;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  /** Shows a spinner and blocks interaction. */
  loading?: boolean;
  fullWidth?: boolean;
  leading?: ReactNode;
  style?: PressableProps['style'];
}

interface VariantColors {
  background: string;
  backgroundPressed: string;
  text: string;
  border?: string;
}

/**
 * The single button primitive. Variants map to the reference visual language:
 * `primary` for Join/Accept/Connect, `accent` for greeting and intimacy actions,
 * `secondary` for neutral surfaces.
 */
export function AppButton({
  label,
  variant = 'primary',
  size = 'medium',
  loading = false,
  fullWidth = false,
  leading,
  disabled,
  style,
  ...rest
}: AppButtonProps) {
  const theme = useTheme();

  const variants: Record<AppButtonVariant, VariantColors> = {
    primary: {
      background: theme.brand,
      backgroundPressed: theme.brandPressed,
      text: theme.onBrand,
    },
    accent: {
      background: theme.accent,
      backgroundPressed: theme.accentPressed,
      text: theme.onAccent,
    },
    secondary: {
      background: theme.surface,
      backgroundPressed: theme.backgroundSelected,
      text: theme.text,
      border: theme.border,
    },
    ghost: {
      background: 'transparent',
      backgroundPressed: theme.backgroundElement,
      text: theme.brand,
    },
  };

  const colors = variants[variant];
  const isBlocked = Boolean(disabled) || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isBlocked, busy: loading }}
      disabled={isBlocked}
      style={(state) => [
        styles.base,
        size === 'large' ? styles.large : styles.medium,
        fullWidth && styles.fullWidth,
        {
          backgroundColor: state.pressed ? colors.backgroundPressed : colors.background,
          borderColor: colors.border ?? 'transparent',
          borderWidth: colors.border ? StyleSheet.hairlineWidth : 0,
          opacity: isBlocked ? 0.5 : 1,
        },
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.text} />
      ) : (
        <>
          {leading ? <View>{leading}</View> : null}
          <ThemedText type="smallBold" style={{ color: colors.text }}>
            {label}
          </ThemedText>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderRadius: Radius.pill,
    minHeight: TouchTarget,
  },
  medium: { paddingHorizontal: Spacing.four, paddingVertical: Spacing.two },
  large: { paddingHorizontal: Spacing.five, paddingVertical: Spacing.three },
  fullWidth: { alignSelf: 'stretch' },
});
