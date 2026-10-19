import { Image } from 'expo-image';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { artSource } from '@/core/media/images';

import { Avatar } from './avatar';

/** Generated once by `tools/build-art.mjs`. */
const FRAME = artSource('avatarFrame');

/**
 * The ring sits at ~94% of the art's box, so the photo is inset a little and the
 * frame lands just outside its edge rather than on top of the face.
 */
const FRAME_SCALE = 1.36;

export interface FramedAvatarProps extends ViewProps {
  /** Stable id used to pick a deterministic placeholder colour. */
  id: string;
  name: string;
  uri?: string;
  /** Diameter of the photo itself; the frame adds the margin around it. */
  size?: number;
}

/**
 * A photo inside the decorative avatar ring.
 *
 * The frame is bundled art, so it costs one draw and no layout: everything the
 * caller sees is still a plain avatar box of `size` inside a slightly larger one.
 * Used where the reference decorates a photo — the couple panel and friend cards.
 */
export function FramedAvatar({ id, name, uri, size = 56, style, ...rest }: FramedAvatarProps) {
  const outer = Math.round(size * FRAME_SCALE);

  return (
    <View
      style={[styles.root, { width: outer, height: outer }, style]}
      accessible={false}
      {...rest}
    >
      <Avatar id={id} name={name} uri={uri} size={size} />
      <Image
        source={FRAME}
        style={StyleSheet.absoluteFill}
        contentFit="contain"
        accessible={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center' },
});
