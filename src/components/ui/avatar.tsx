import { Image } from 'expo-image';
import { StyleSheet, Text, View, type ViewProps } from 'react-native';

import { Radius } from '@/constants/theme';
import type { AvatarFrameKey } from '@/core/data/types';
import { AVATAR_FRAME_FIT, frameSource, imageSource } from '@/core/media/images';
import { useTheme } from '@/hooks/use-theme';
import { useTints } from '@/hooks/use-tints';

import { Icon } from './icon';
import { DECORATIVE_IMAGE } from '@/components/ui/decorative-image';

export interface AvatarProps extends ViewProps {
  /** Stable id used to pick a deterministic placeholder colour. */
  id: string;
  name: string;
  uri?: string;
  size?: number;
  /** Corner radius. Defaults to a circle; the profile avatar is a rounded square. */
  radius?: number;
  /** Draws a ring, used for active speakers and selected members. */
  ringColor?: string;
  /** Show a presence dot. */
  online?: boolean;
  /** Show a video-call affordance. */
  videoCall?: boolean;
  /**
   * A decorative frame the member owns.
   *
   * Frames are square canvases with a transparent hole, so each one carries its
   * own ratio. The art is drawn *outside* the avatar's box (the box itself never
   * changes), which is why the wrapper must not clip.
   */
  frame?: AvatarFrameKey;
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
 * Renders a photograph when one exists, otherwise a deterministic monogram.
 * `uri` may be a remote URL or a bundled `asset:` reference; the registry in
 * `core/media/images` resolves both, so screens never care which one they hold.
 *
 * Presence sits at the logical end edge and is ringed in the page colour so it
 * appears to be cut out of the avatar — the reference's treatment.
 */
export function Avatar({
  id,
  name,
  uri,
  size = 56,
  radius,
  ringColor,
  online,
  videoCall,
  frame,
  style,
  ...rest
}: AvatarProps) {
  const theme = useTheme();
  const tints = useTints();

  const source = imageSource(uri);
  const backgroundColor = PLACEHOLDER_COLORS[hash(id) % PLACEHOLDER_COLORS.length];
  const corner = radius ?? size / 2;
  const ring = ringColor ? { borderWidth: 2, borderColor: ringColor } : null;
  // The reference's presence mark is a neat dot ringed in the page colour —
  // roughly a sixth of the portrait, not the quarter-sized beacons an earlier
  // pass drew. The video affordance keeps its own, slightly larger badge.
  const dot = Math.max(9, Math.round(size * 0.16));
  const mediaDot = Math.max(14, Math.round(size * 0.26));
  /**
   * The frame is drawn larger than the photo and nudged so that its transparent
   * hole lands exactly on the avatar — the art's hole is not centred in its
   * canvas (see `AVATAR_FRAME_FIT`).
   */
  const fit = frame ? AVATAR_FRAME_FIT[frame] : null;
  const art = fit ? size * fit.scale : 0;
  const artStyle = fit
    ? {
        position: 'absolute' as const,
        width: art,
        height: art,
        left: (size - art) / 2 - fit.offsetX * art,
        top: (size - art) / 2 - fit.offsetY * art,
      }
    : null;

  return (
    <View
      style={[
        styles.wrapper,
        { width: size, height: size, borderRadius: corner, backgroundColor },
        ring,
        style,
      ]}
      {...rest}
    >
      {source ? (
        <Image
          source={source}
          style={{ width: size, height: size, borderRadius: corner }}
          contentFit="cover"
          // Purely decorative; the row supplies the accessible name.
          {...DECORATIVE_IMAGE}
        />
      ) : (
        <Text
          style={[styles.initials, { fontSize: size * 0.36, lineHeight: size * 0.44 }]}
          accessible={false}
        >
          {initials(name)}
        </Text>
      )}

      {frame && artStyle ? (
        <Image
          // Decoration, and the one place the animated frame may appear: on a
          // single avatar. Lists never get the animated key.
          source={frameSource(frame)}
          style={artStyle}
          contentFit="contain"
          {...DECORATIVE_IMAGE}
        />
      ) : null}

      {videoCall ? (
        <View
          style={[
            styles.video,
            {
              width: mediaDot + 4,
              height: mediaDot + 4,
              borderRadius: Radius.pill,
              backgroundColor: theme.brand,
              borderColor: theme.background,
            },
          ]}
        >
          <Icon name="video" size={mediaDot - 6} strokeWidth={2.6} color={theme.onBrand} />
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
