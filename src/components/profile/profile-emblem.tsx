import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Radius } from '@/constants/theme';
import type { HonorArt, ProfileEmblem as ProfileEmblemData } from '@/core/data/types';
import { useTints } from '@/hooks/use-tints';

import { Icon, type IconName } from '../ui/icon';

/** The reference floats a crest of roughly this size beside the display name. */
export const EMBLEM_SIZE = 84;

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
 * circular crest overlapping the identity block, tinted like a paid tier — and
 * draw it flat from theme tints and our own glyph set. Presentation only: it is
 * never an entitlement signal.
 */
export function ProfileEmblem({ emblem, style }: ProfileEmblemProps) {
  const tints = useTints();

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={emblem.label}
      style={[
        styles.ring,
        { backgroundColor: tints.tier.vip.from, borderColor: tints.tier.vip.to },
        style,
      ]}
    >
      <View style={[styles.disc, { backgroundColor: tints.age.background }]}>
        <Icon name={ART[emblem.art]} size={34} strokeWidth={2.2} color={tints.age.text} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    width: EMBLEM_SIZE,
    height: EMBLEM_SIZE,
    borderRadius: Radius.pill,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disc: {
    width: EMBLEM_SIZE - 18,
    height: EMBLEM_SIZE - 18,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
