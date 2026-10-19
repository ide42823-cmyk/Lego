import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing, type ChipTintKey } from '@/constants/theme';
import type { ProfileShortcut } from '@/core/data/types';
import { useTints } from '@/hooks/use-tints';

import { ThemedText } from '../themed-text';
import { Icon, type IconName } from '../ui/icon';

/**
 * Room and family tiles are the same component in the reference, distinguished
 * only by hue, so the tone is mapped here rather than stored as a colour.
 */
const TONES: Record<ProfileShortcut['tone'], ChipTintKey> = {
  room: 'chat',
  family: 'video',
};

const ART: Record<ProfileShortcut['tone'], IconName> = {
  room: 'rooms',
  family: 'rank',
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
 * Read-only metadata plus a deep link: the member count is decorative weight, and
 * nothing here is actionable except opening the entity.
 */
export function ProfileShortcutTile({ shortcut, ownerName, onPress }: ProfileShortcutTileProps) {
  const tints = useTints();
  const colors = tints.chip[TONES[shortcut.tone]];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${ownerName}'s ${shortcut.label}. ${shortcut.memberCount} members`}
      onPress={() => onPress(shortcut)}
      style={({ pressed }) => [
        styles.tile,
        { backgroundColor: colors.background },
        pressed && { opacity: 0.75 },
      ]}
    >
      <View style={[styles.thumb, { backgroundColor: `${colors.text}1F` }]}>
        <Icon name={ART[shortcut.tone]} size={20} strokeWidth={2.2} color={colors.text} />
      </View>
      <View style={styles.copy}>
        <ThemedText type="smallBold" numberOfLines={1} style={{ color: colors.text }}>
          {shortcut.label}
        </ThemedText>
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
    width: 40,
    height: 40,
    borderRadius: Radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, gap: Spacing.half },
  countRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, opacity: 0.9 },
});
