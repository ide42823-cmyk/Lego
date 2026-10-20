import { Image } from 'expo-image';
import { StyleSheet, View, type ViewProps } from 'react-native';

import type { AvatarFrameKey } from '@/core/data/types';
import { AVATAR_FRAME_SCALE, artSource } from '@/core/media/images';

import { Avatar } from './avatar';

/** Generated once by `tools/build-art.mjs`. */
const FRAME = artSource('avatarFrame');

/**
 * The ring sits at ~94% of the art's box, so the photo is inset a little and the
 * frame lands just outside its edge rather than on top of the face.
 */
const RING_SCALE = 1.36;

export interface FramedAvatarProps extends ViewProps {
  /** Stable id used to pick a deterministic placeholder colour. */
  id: string;
  name: string;
  uri?: string;
  /** Diameter of the photo itself; the frame adds the margin around it. */
  size?: number;
  /** A frame the member owns. Falls back to the app's own ring. */
  frame?: AvatarFrameKey;
}

/**
 * A photo inside a decorative avatar frame.
 *
 * The frame is bundled art, so it costs one draw and no layout: everything the
 * caller sees is still a plain avatar box of `size` inside a slightly larger one.
 * The outer box follows the frame's own ratio, so an owned frame and the default
 * ring can sit side by side without crowding each other's faces.
 */
export function FramedAvatar({
  id,
  name,
  uri,
  size = 56,
  frame,
  style,
  ...rest
}: FramedAvatarProps) {
  const scale = frame ? AVATAR_FRAME_SCALE[frame] : RING_SCALE;
  const outer = Math.round(size * scale);

  return (
    <View
      style={[styles.root, { width: outer, height: outer }, style]}
      accessible={false}
      {...rest}
    >
      {/* `Avatar` draws an owned frame itself, bleeding outward by its ratio. */}
      <Avatar id={id} name={name} uri={uri} size={size} frame={frame} />
      {frame ? null : (
        <Image
          source={FRAME}
          style={StyleSheet.absoluteFill}
          contentFit="contain"
          accessible={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center' },
});
