import { Platform } from 'react-native';

/**
 * Props that keep a decorative image out of the accessibility tree.
 *
 * `accessible={false}` is the React Native spelling, but `expo-image` forwards it
 * to the DOM node on web, where React rejects it as an invalid attribute (and
 * flags a hydration mismatch). An empty `alt` is the HTML way to say "ignore
 * this image", so each platform gets its own spelling.
 *
 * Spread it: `<Image {...DECORATIVE_IMAGE} source={...} />`.
 */
export const DECORATIVE_IMAGE =
  Platform.OS === 'web' ? ({ alt: '' } as const) : ({ accessible: false } as const);
