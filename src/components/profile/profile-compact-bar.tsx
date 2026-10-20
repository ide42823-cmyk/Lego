import { StyleSheet, View } from 'react-native';

import { Spacing, TouchTarget } from '@/constants/theme';
import type { UserProfile } from '@/core/data/types';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from '../themed-text';
import { Avatar } from '../ui/avatar';
import { IconButton } from '../ui/icon-button';
import { MediaThumb } from '../ui/media-thumb';

export const COMPACT_BAR_HEIGHT = 48;

export interface ProfileCompactBarProps {
  profile: UserProfile;
  topInset: number;
  onBack: () => void;
  onShare: () => void;
  onMore: () => void;
}

/**
 * The header that replaces the cover once the profile is scrolled (reference
 * screen 026).
 *
 * It is rendered as an overlay whose opacity is driven by the scroll offset, so
 * the identity stays reachable without a second navigation bar. Identity moves
 * here rather than being duplicated: the avatar and name are the same data the
 * cover block renders.
 */
export function ProfileCompactBar({
  profile,
  topInset,
  onBack,
  onShare,
  onMore,
}: ProfileCompactBarProps) {
  const theme = useTheme();
  const photo = profile.photos?.[0];

  return (
    <View style={[styles.bar, { paddingTop: topInset, height: topInset + COMPACT_BAR_HEIGHT }]}>
      {/*
        Equal-width side groups keep the identity genuinely centred. A `flex: 1`
        centre would sit half a button off-centre, because the trailing group
        holds two controls and the leading group holds one.
      */}
      <View style={styles.side}>
        <IconButton name="back" label="Go back" onPress={onBack} />
      </View>

      <View style={styles.center}>
        {/*
          The first cover thumbnail *is* the avatar — same id, same colour — so
          the compact header cannot disagree with the strip the user just
          scrolled past.
        */}
        {photo ? (
          <MediaThumb
            id={photo.id}
            label=""
            uri={photo.imageUrl}
            placeholderText=""
            style={styles.avatar}
            borderRadius={14}
            accessible={false}
          />
        ) : (
          <Avatar
            id={profile.id}
            name={profile.displayName}
            uri={profile.avatarUrl}
            size={28}
            radius={14}
            frame={profile.avatarFrame}
            style={{ borderColor: theme.border, borderWidth: StyleSheet.hairlineWidth }}
          />
        )}
        <ThemedText type="smallBold" numberOfLines={1} style={styles.name}>
          {profile.displayName}
        </ThemedText>
      </View>

      <View style={[styles.side, styles.sideEnd]}>
        <IconButton name="share" label="Share profile" onPress={onShare} />
        <IconButton name="more" label="More options" onPress={onMore} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.one,
  },
  side: { width: TouchTarget * 2, flexDirection: 'row', alignItems: 'center' },
  sideEnd: { justifyContent: 'flex-end' },
  center: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    height: COMPACT_BAR_HEIGHT,
  },
  name: { flexShrink: 1, fontSize: 15 },
  avatar: { width: 28, height: 28 },
});
