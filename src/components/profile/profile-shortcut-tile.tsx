import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing, type ChipTintKey } from '@/constants/theme';
import type { ProfileShortcut } from '@/core/data/types';
import { useTints } from '@/hooks/use-tints';

import { ThemedText } from '../themed-text';
import { Icon } from '../ui/icon';
import { MediaThumb } from '../ui/media-thumb';

/**
 * Room and family tiles are the same component in the reference, distinguished
 * only by hue, so the tone is mapped here rather than stored as a colour.
 */
const TONES: Record<ProfileShortcut['tone'], ChipTintKey> = {
  room: 'chat',
  family: 'video',
};

export interface ProfileShortcutTileProps {
  shortcut: ProfileShortcut;
  /** Whose tile this is, for the accessible name. */
  ownerName: string;
  onPress: (shortcut: ProfileShortcut) => void;
}

/**
 * The "Her Room" / "Her family" tile (reference screens 001, 027).
 *
 * The reference leads each tile with a *photo thumbnail*, not a glyph — the tile
 * is a preview of a place with people in it. The thumbnail is keyed off the
 * entity id so it is stable across renders; fixtures have no image host, so the
 * shared `MediaThumb` placeholder stands in.
 *
 * Read-only metadata plus a deep link: the member count is decorative weight,
 * and nothing here is actionable except opening the entity.
 */
export function ProfileShortcutTile({ shortcut, ownerName, onPress }: ProfileShortcutTileProps) {
  const tints = useTints();
  const colors = tints.chip[TONES[shortcut.tone]];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${ownerName}. ${shortcut.label}. ${shortcut.memberCount} members${
        shortcut.verified ? ', verified' : ''
      }`}
      onPress={() => onPress(shortcut)}
      style={({ pressed }) => [
        styles.tile,
        { backgroundColor: colors.background },
        pressed && { opacity: 0.75 },
      ]}
    >
      <MediaThumb
        id={`shortcut-${shortcut.kind}-${shortcut.id}`}
        label=""
        placeholderText=""
        borderRadius={Radius.medium}
        accessible={false}
        style={styles.thumb}
      />
      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <ThemedText
            type="smallBold"
            numberOfLines={1}
            style={[styles.title, { color: colors.text }]}
          >
            {shortcut.label}
          </ThemedText>
          {shortcut.verified ? (
            <Icon name="verified" size={13} strokeWidth={2.4} color={colors.text} />
          ) : null}
        </View>
        <View style={styles.countRow}>
          <Icon name="friends" size={13} strokeWidth={2.4} color={colors.text} />
          <ThemedText type="small" numberOfLines={1} style={{ color: colors.text }}>
            {shortcut.memberCount}
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.two,
    borderRadius: Radius.large,
  },
  thumb: {
    width: 46,
    height: 46,
    borderRadius: Radius.medium,
  },
  copy: { flex: 1, gap: Spacing.one },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  title: { fontSize: 15, flexShrink: 1 },
  countRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, opacity: 0.9 },
});
