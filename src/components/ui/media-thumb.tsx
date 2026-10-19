import { Image } from 'expo-image';
import { StyleSheet, Text, View, type ViewProps } from 'react-native';

import { Radius } from '@/constants/theme';
import { imageSource } from '@/core/media/images';

export interface MediaThumbProps extends ViewProps {
  /** Stable id used to pick a deterministic placeholder colour. */
  id: string;
  /** Human-readable label; used for the accessible name. */
  label: string;
  uri?: string;
  /** Shows this text in the placeholder instead of the label's initial. */
  placeholderText?: string;
  borderRadius?: number;
}

const PLACEHOLDER_COLORS = ['#7C4DF0', '#DB2777', '#0EA5E9', '#F59E0B', '#10B981', '#6366F1'];

function hash(value: string): number {
  let result = 0;
  for (let index = 0; index < value.length; index += 1) {
    result = (result * 31 + value.charCodeAt(index)) | 0;
  }
  return Math.abs(result);
}

/**
 * Rectangular cover/thumbnail. Like `Avatar`, it resolves either a remote URL or
 * a bundled `asset:` reference, and falls back to a deterministic colour block so
 * a missing photo is never a broken image.
 */
export function MediaThumb({
  id,
  label,
  uri,
  placeholderText,
  borderRadius = Radius.medium,
  style,
  ...rest
}: MediaThumbProps) {
  const source = imageSource(uri);
  const backgroundColor = PLACEHOLDER_COLORS[hash(id) % PLACEHOLDER_COLORS.length];
  const text = placeholderText ?? Array.from(label.trim())[0]?.toUpperCase() ?? '?';

  return (
    <View
      style={[styles.thumb, { backgroundColor, borderRadius }, style]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={label}
      {...rest}
    >
      {source ? (
        <Image
          source={source}
          style={[styles.image, { borderRadius }]}
          contentFit="cover"
          accessible={false}
        />
      ) : (
        <Text style={styles.placeholder} accessible={false}>
          {text}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  thumb: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
  placeholder: { color: 'rgba(255,255,255,0.85)', fontSize: 22, fontWeight: '800' },
});
