import { Image } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import type { HonorArt, ProfileEmblem as ProfileEmblemData } from '@/core/data/types';
import { artSource } from '@/core/media/images';

import { Icon, type IconName } from '../ui/icon';
import { DECORATIVE_IMAGE } from '@/components/ui/decorative-image';

/** The reference floats a crest of roughly this size beside the display name. */
export const EMBLEM_SIZE = 84;

/**
 * The generated medal, rendered once. It is our own art (`tools/build-art.mjs`),
 * not a crop of the reference's, and the enamel is deliberately empty so the
 * member's glyph can sit in it.
 */
const CREST = artSource('crest');

/**
 * Meaning → glyph. The data layer names a meaning, the view owns the art.
 */
const ART: Record<HonorArt, IconName> = {
  crown: 'crown',
  star: 'star',
  shield: 'shield',
  trophy: 'trophy',
  gem: 'diamonds',
  sparkle: 'sparkle',
  rank: 'level',
  gift: 'gift',
};

export interface ProfileEmblemProps {
  emblem: ProfileEmblemData;
  style?: StyleProp<ViewStyle>;
}

/**
 * The decorated crest beside a display name (reference screens 001, 027).
 *
 * The reference ships an ornate enamel medal. We keep the *structure* — a large
 * crest floating beside the identity block, carrying the member's own honor
 * glyph — and draw it from our generated art rather than a crop of theirs.
 * Presentation only: it is never an entitlement signal.
 */
export function ProfileEmblem({ emblem, style }: ProfileEmblemProps) {
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={emblem.label}
      style={[styles.root, style]}
    >
      <Image source={CREST} style={styles.art} contentFit="contain" {...DECORATIVE_IMAGE} />
      <View style={styles.glyph} accessible={false}>
        <Icon name={ART[emblem.art]} size={30} strokeWidth={2.2} color="#FFFFFF" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: EMBLEM_SIZE,
    height: EMBLEM_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  art: { position: 'absolute', top: 0, start: 0, end: 0, bottom: 0 },
  /** Sits in the enamel disc, which the art leaves empty for exactly this. */
  glyph: { alignItems: 'center', justifyContent: 'center' },
});
