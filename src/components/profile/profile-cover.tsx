import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import type { ProfilePhoto, UserProfile } from '@/core/data/types';
import { useTints } from '@/hooks/use-tints';

import { MediaThumb } from '../ui/media-thumb';
import { OverlayButton } from '../ui/overlay-button';
import { ScreenGradient } from '../ui/screen-gradient';

const PHOTO_WIDTH = 40;
const PHOTO_HEIGHT = 44;

export interface ProfileCoverProps {
  profile: UserProfile;
  height: number;
  /** Status-bar inset, so the controls clear the clock. */
  topInset: number;
  onBack: () => void;
  onShare: () => void;
  onMore: () => void;
  onOpenPhoto: (photo: ProfilePhoto) => void;
}

/**
 * The full-bleed cover at the head of a profile (reference screens 001, 027).
 *
 * Two details are load-bearing in the reference. The controls are *bare* white
 * glyphs sitting on the photo rather than circles, and the member's photos are a
 * pair of small framed thumbnails at the bottom-left — not a detached avatar
 * below the cover. So the cover owns its own top scrim (which is what keeps bare
 * glyphs legible over any art) and owns the thumbnail strip.
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
  onOpenPhoto,
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
      {/*
        Bare white controls need a surface that can hold them. This is the
        reference's invisible technique, not a visible plate.
      */}
      <ScreenGradient color="#000000" height={topInset + 132} opacity={0.38} />

      <View style={[styles.controls, { paddingTop: topInset + Spacing.two }]}>
        <OverlayButton name="back" label="Go back" onPress={onBack} />
        <View style={styles.trailing}>
          <OverlayButton name="share" label="Share profile" onPress={onShare} />
          <OverlayButton name="more" label="More options" onPress={onMore} />
        </View>
      </View>

      {profile.photos && profile.photos.length > 0 ? (
        <View style={styles.album}>
          {profile.photos.slice(0, 2).map((photo) => (
            <Pressable
              key={photo.id}
              accessibilityRole="button"
              accessibilityLabel={`Open a photo of ${profile.displayName}`}
              onPress={() => onOpenPhoto(photo)}
              style={({ pressed }) => [styles.frame, pressed && { opacity: 0.8 }]}
            >
              <MediaThumb
                id={photo.id}
                label=""
                uri={photo.imageUrl}
                placeholderText=""
                borderRadius={Radius.small}
                accessible={false}
                style={styles.photo}
              />
            </Pressable>
          ))}
        </View>
      ) : null}
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
  album: {
    position: 'absolute',
    start: Spacing.three,
    bottom: Spacing.four,
    flexDirection: 'row',
    gap: Spacing.two,
  },
  frame: {
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: Radius.small + 2,
    padding: 1.5,
  },
  photo: { width: PHOTO_WIDTH, height: PHOTO_HEIGHT },
});
