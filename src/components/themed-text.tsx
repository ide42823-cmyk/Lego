import { Platform, StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { Fonts, ThemeColor } from '@/constants/theme';
import { typefaceForWeight } from '@/constants/typography';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
};

/**
 * The theme's text. The family always comes from the bundled Cairo faces:
 * whatever weight the merged style eventually carries (a screen's inline
 * `fontWeight: 700` included) is matched to the exact static face, so
 * deliberate weights render as printed rather than falling back to the OS.
 * Sizes stay overridable inline; the reference's caption tier is 13.
 */
export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  const flat = style ? StyleSheet.flatten(style as TextStyle) : undefined;
  const fontFamily = typefaceForWeight(flat?.fontWeight);

  return (
    <Text
      style={[{ color: theme[themeColor ?? 'text'] }, styles[type], { fontFamily }, style as TextStyle]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  /**
   * Caption tier. The reference runs its pills, counts and meta lines a notch
   * smaller than the body and at least semi-bold.
   */
  small: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: 500,
  },
  smallBold: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: 700,
  },
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 500,
  },
  title: {
    fontSize: 48,
    fontWeight: 600,
    lineHeight: 52,
  },
  subtitle: {
    fontSize: 32,
    lineHeight: 44,
    fontWeight: 600,
  },
  link: {
    lineHeight: 30,
    fontSize: 14,
  },
  linkPrimary: {
    lineHeight: 30,
    fontSize: 14,
    color: '#3c87f7',
  },
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: 700 }) ?? 500,
    fontSize: 12,
  },
});
