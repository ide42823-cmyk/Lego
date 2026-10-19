import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import type { UserProfile } from '@/core/data/types';
import { useTints } from '@/hooks/use-tints';

import { MediaThumb } from '../ui/media-thumb';
import { OverlayButton } from '../ui/overlay-button';
import { ScreenGradient } from '../ui/screen-gradient';

export interface ProfileCoverProps {
  profile: UserProfile;
  height: number;
  /** Status-bar inset, so the controls clear the clock. */
  topInset: number;
  onBack: () => void;
  onShare: () => void;
  onMore: () => void;
}

/**
 * The full-bleed cover at the head of a profile (reference screens 001, 027).
 *
 * Fixtures ship without image URLs, so the fallback is a flat block under the
 * page's lavender wash rather than a grey rectangle — a profile with no photo
 * should still read as a designed surface, not as a failed image.
 */
export function ProfileCover({
  profile,
  height,
  topInset,
  onBack,
  onShare,
  onMore,
}: ProfileCoverProps) {
  const tints = useTints();

  return (
    <View style={{ height }}>
      <MediaThumb
        id={`cover-${profile.id}`}
        label={`${profile.displayName}'s cover`}
        uri={profile.coverUrl}
        // No letter block: the wash below supplies the surface.
        placeholderText=""
        borderRadius={0}
        style={StyleSheet.absoluteFill}
      />
      <ScreenGradient color={tints.tab.moments} height={height} />

      <View style={[styles.controls, { paddingTop: topInset + Spacing.two }]}>
        <OverlayButton name="back" label="Go back" onPress={onBack} />
        <View style={styles.trailing}>
          <OverlayButton name="share" label="Share profile" onPress={onShare} />
          <OverlayButton name="more" label="More options" onPress={onMore} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  controls: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
  },
  trailing: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
});
