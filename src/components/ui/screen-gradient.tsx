import { StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

export interface ScreenGradientProps {
  /** Top colour of the wash. The bottom is always fully transparent. */
  color: string;
  height?: number;
}

/**
 * The tinted wash behind a tab's header.
 *
 * Every reference tab opens with its own hue fading into the page. Rendering it
 * as one SVG gradient (rather than stacked translucent views) avoids banding,
 * and it is absolutely positioned and non-interactive so it never affects
 * layout or hit testing.
 */
export function ScreenGradient({ color, height = 240 }: ScreenGradientProps) {
  // Scoped per instance so several tints can coexist on one screen.
  const id = `tint-${color.replace('#', '')}`;

  return (
    <Svg
      width="100%"
      height={height}
      style={styles.backdrop}
      pointerEvents="none"
      accessible={false}
    >
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="1" />
          <Stop offset="0.5" stopColor={color} stopOpacity="0.6" />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0 },
});
