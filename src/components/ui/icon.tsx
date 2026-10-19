import { Platform, Text, type TextStyle } from 'react-native';
import { SymbolView, type SFSymbol } from 'expo-symbols';

/**
 * A single place to swap the icon strategy.
 *
 * We do NOT ship a proprietary icon set: the reference app's iconography is
 * protected trade dress, so P3 uses neutral glyph placeholders. On iOS we use
 * the platform's own SF Symbols; elsewhere we fall back to a plain glyph so the
 * layout, hit targets and accessibility labels can all be reviewed now.
 *
 * Replacing this file with a commissioned icon font should not require touching
 * any screen.
 */

export interface IconProps {
  /** SF Symbol name (iOS). */
  symbol: SFSymbol;
  /** Cross-platform placeholder glyph. */
  glyph: string;
  size?: number;
  color?: string;
  style?: TextStyle;
}

export function Icon({ symbol, glyph, size = 20, color, style }: IconProps) {
  if (Platform.OS === 'ios') {
    return (
      <SymbolView
        name={symbol}
        size={size}
        tintColor={color}
        fallback={<Text style={[{ fontSize: size, color }, style]}>{glyph}</Text>}
      />
    );
  }

  return (
    <Text
      style={[{ fontSize: size, lineHeight: size * 1.2, color }, style]}
      // Decorative: the surrounding control supplies the accessible name.
      accessible={false}
    >
      {glyph}
    </Text>
  );
}
