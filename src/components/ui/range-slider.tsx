import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Radius } from '@/constants/theme';
import { moveRangeValue, pickRangeHandle, type RangeHandle } from '@/core/range';
import { useTheme } from '@/hooks/use-theme';

const THUMB_SIZE = 22;
const THUMB_RADIUS = THUMB_SIZE / 2;
const HANDLE_SIZE = 44;

export interface RangeSliderProps {
  min: number;
  max: number;
  step: number;
  low: number;
  high: number;
  onChange: (value: { low: number; high: number }) => void;
  /** Prefix for the two handles' accessible names, e.g. "Age". */
  label: string;
  /** Formats one value for accessibility, e.g. 20 -> "20 km". */
  formatValue: (value: number) => string;
}

/**
 * A dual-handle range input drawn with Views.
 *
 * A native slider package would add a prebuild dependency for one control, so
 * this uses the responder system: a touch picks the nearer handle, and dragging
 * moves it without crossing the other. Both handles are 44-point accessible
 * targets and expose increment/decrement actions for assistive technology.
 *
 * The numeric axis stays left-to-right (minimum at the left) in every locale;
 * only the surrounding labels mirror. Numeric scales read the same way in the
 * app's English and Arabic copy.
 */
export function RangeSlider({
  min,
  max,
  step,
  low,
  high,
  onChange,
  label,
  formatValue,
}: RangeSliderProps) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);
  const drag = useRef<RangeHandle | null>(null);

  const span = max - min;
  const lowRatio = span > 0 ? (low - min) / span : 0;
  const highRatio = span > 0 ? (high - min) / span : 1;
  const lowX = lowRatio * width;
  const highX = highRatio * width;

  const updateFromTouch = (locationX: number, fresh: boolean) => {
    if (width <= 0) {
      return;
    }

    const ratio = Math.min(1, Math.max(0, locationX / width));
    if (fresh || !drag.current) {
      drag.current = pickRangeHandle({ low, high }, ratio, min, max);
    }

    const raw = min + ratio * span;
    onChange(moveRangeValue({ low, high }, drag.current, raw, min, max, step));
  };

  const nudge = (handle: RangeHandle, direction: 1 | -1) => {
    const current = handle === 'low' ? low : high;
    onChange(moveRangeValue({ low, high }, handle, current + direction * step, min, max, step));
  };

  const adjust = (handle: RangeHandle) => (event: { nativeEvent: { actionName: string } }) => {
    if (event.nativeEvent.actionName === 'increment') {
      nudge(handle, 1);
    } else if (event.nativeEvent.actionName === 'decrement') {
      nudge(handle, -1);
    }
  };

  const handles: {
    key: RangeHandle;
    value: number;
    x: number;
    name: string;
  }[] = [
    { key: 'low', value: low, x: lowX, name: `${label} minimum` },
    { key: 'high', value: high, x: highX, name: `${label} maximum` },
  ];

  return (
    <View style={styles.container}>
      <View
        style={styles.touchArea}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={(event) => updateFromTouch(event.nativeEvent.locationX, true)}
        onResponderMove={(event) => updateFromTouch(event.nativeEvent.locationX, false)}
        onResponderRelease={() => {
          drag.current = null;
        }}
        onResponderTerminate={() => {
          drag.current = null;
        }}
      >
        <View style={[styles.track, { backgroundColor: theme.backgroundSelected }]} />
        {width > 0 ? (
          <View
            style={[
              styles.fill,
              {
                backgroundColor: theme.brand,
                left: lowX,
                width: Math.max(0, highX - lowX),
              },
            ]}
          />
        ) : null}

        {handles.map((handle) => (
          <View
            key={handle.key}
            accessible
            accessibilityRole="adjustable"
            accessibilityLabel={handle.name}
            accessibilityValue={{
              min,
              max,
              now: handle.value,
              text: formatValue(handle.value),
            }}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={handle.value}
            aria-valuetext={formatValue(handle.value)}
            accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
            onAccessibilityAction={adjust(handle.key)}
            pointerEvents="none"
            style={[styles.handle, { left: handle.x - HANDLE_SIZE / 2 }]}
          >
            <View
              style={[styles.thumb, { borderColor: theme.brand, backgroundColor: theme.surface }]}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: THUMB_RADIUS },
  touchArea: { height: 44, justifyContent: 'center' },
  track: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    borderRadius: Radius.pill,
  },
  fill: {
    position: 'absolute',
    height: 4,
    borderRadius: Radius.pill,
  },
  handle: {
    position: 'absolute',
    top: 0,
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: Radius.pill,
    borderWidth: 3,
    shadowColor: '#000000',
    shadowOpacity: 0.14,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
});
