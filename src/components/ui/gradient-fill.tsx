import { useId } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

export interface GradientFillProps extends ViewProps {
  from: string;
  to: string;
  /** Corner radius. Pass the parent's radius so the wash is clipped to it. */
  radius?: number;
  /** Top-to-bottom instead of the default start-to-end. */
  vertical?: boolean;
}

/**
 * A flat, two-stop gradient painted behind a control.
 *
 * The project deliberately avoids adding `expo-linear-gradient` (it would need
 * a native rebuild for the already-installed dev client). `react-native-svg` is
 * already a dependency, so the same wash is drawn as one absolutely positioned
 * rect. The parent must be `position: relative` and clip its corners.
 *
 * The layer is non-interactive: presses always reach the control underneath.
 */
export function GradientFill({
  from,
  to,
  radius = 0,
  vertical = false,
  style,
  ...rest
}: GradientFillProps) {
  // `useId` is stable across re-renders and unique per instance, so several
  // gradients on one screen cannot resolve each other's paint.
  const id = `gradient-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, styles.clip, { borderRadius: radius }, style]}
      {...rest}
    >
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2={vertical ? '0' : '1'} y2={vertical ? '1' : '0'}>
            <Stop offset="0" stopColor={from} />
            <Stop offset="1" stopColor={to} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" rx={radius} fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
});
