import { StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

export interface GradientFillProps {
  from: string;
  to: string;
  /** Diagonal (bottom-left to top-right) or straight down. */
  diagonal?: boolean;
}

/**
 * A rounded surface's gradient, drawn behind its children.
 *
 * `ScreenGradient` is the page wash; this is the tile-sized one — membership
 * tiles, game covers, honour plaques. It paints the *whole* box and lets the
 * parent's `overflow: hidden` + radius do the clipping, so one component works
 * for every shape.
 */
export function GradientFill({ from, to, diagonal = true }: GradientFillProps) {
  // Scoped by the colour pair: two tiles sharing a gradient share the def, which
  // is harmless, and different pairs never collide.
  const id = `tile-${from.replace('#', '')}-${to.replace('#', '')}`;

  return (
    <Svg
      style={StyleSheet.absoluteFill}
      width="100%"
      height="100%"
      pointerEvents="none"
      aria-hidden
    >
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2={diagonal ? '1' : '0'} y2="1">
          <Stop offset="0" stopColor={from} />
          <Stop offset="1" stopColor={to} />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}
