import { Image } from 'expo-image';
import { StyleSheet, Text, View, type ViewProps } from 'react-native';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useTints } from '@/hooks/use-tints';

import { Icon } from './icon';

export interface AvatarProps extends ViewProps {
  /** Stable id used to pick a deterministic placeholder colour. */
  id: string;
  name: string;
  uri?: string;
  size?: number;
  /** Draws a ring, used for active speakers and selected members. */
  ringColor?: string;
  /** Show a presence dot. */
  online?: boolean;
  /** Show a video-call affordance. */
  videoCall?: boolean;
}

const PLACEHOLDER_COLORS = ['#7C4DF0', '#DB2777', '#0EA5E9', '#F59E0B', '#10B981', '#6366F1'];

function hash(value: string): number {
  let result = 0;
  for (let index = 0; index < value.length; index += 1) {
    result = (result * 31 + value.charCodeAt(index)) | 0;
  }
  return Math.abs(result);
}

function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return '?';
  }
  // Works for Arabic and Latin alike: take the first character of each word.
  return words
    .slice(0, 2)
    .map((word) => Array.from(word)[0] ?? '')
    .join('')
    .toUpperCase();
}

/**
 * Renders a remote image when one exists, otherwise a deterministic monogram.
 * Fixtures ship without image URLs on purpose, so no external image host is
 * needed to review the UI.
 *
 * Presence sits at the logical end edge and is ringed in the page colour so it
 * appears to be cut out of the avatar — the reference's treatment.
 */
export function Avatar({
  id,
  name,
  uri,
  size = 56,
  ringColor,
  online,
  videoCall,
  style,
  ...rest
}: AvatarProps) {
  const theme = useTheme();
  const tints = useTints();

  const backgroundColor = PLACEHOLDER_COLORS[hash(id) % PLACEHOLDER_COLORS.length];
  const ring = ringColor ? { borderWidth: 2, borderColor: ringColor } : null;
  const dot = Math.max(10, Math.round(size * 0.24));

  return (
    <View
      style={[
        styles.wrapper,
        { width: size, height: size, borderRadius: size / 2, backgroundColor },
        ring,
        style,
      ]}
      {...rest}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          contentFit="cover"
          // Purely decorative; the row supplies the accessible name.
          accessible={false}
        />
      ) : (
        <Text
          style={[styles.initials, { fontSize: size * 0.36, lineHeight: size * 0.44 }]}
          accessible={false}
        >
          {initials(name)}
        </Text>
      )}

      {videoCall ? (
        <View
          style={[
            styles.video,
            {
              width: dot + 4,
              height: dot + 4,
              borderRadius: Radius.pill,
              backgroundColor: theme.brand,
              borderColor: theme.background,
            },
          ]}
        >
          <Icon name="video" size={dot - 4} strokeWidth={2.6} color={theme.onBrand} />
        </View>
      ) : null}

      {online ? (
        <View
          style={[
            styles.presence,
            {
              width: dot,
              height: dot,
              borderRadius: Radius.pill,
              backgroundColor: tints.online,
              borderColor: theme.background,
            },
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', justifyContent: 'center', overflow: 'visible' },
  initials: { color: '#FFFFFF', fontWeight: '700' },
  presence: {
    position: 'absolute',
    top: 0,
    end: 0,
    borderWidth: 2,
  },
  video: {
    position: 'absolute',
    bottom: 0,
    end: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
});
