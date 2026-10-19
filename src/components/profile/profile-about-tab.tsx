import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import type { ProfileInfoRow, ProfileShortcut, UserProfile } from '@/core/data/types';
import { textAlignFor } from '@/core/i18n';

import { ThemedText } from '../themed-text';
import { Divider } from '../ui/divider';
import { TagChip } from '../ui/tag-chip';
import { ProfileInfoRow as InfoRow } from './profile-info-row';
import { ProfileShortcutTile } from './profile-shortcut-tile';

export interface ProfileAboutTabProps {
  profile: UserProfile;
  onOpenShortcut: (shortcut: ProfileShortcut) => void;
  onCopy: (row: ProfileInfoRow) => void;
}

/**
 * The Profile section: shortcuts, interests, and the information stack
 * (reference screens 001, 026, 027).
 */
export function ProfileAboutTab({ profile, onOpenShortcut, onCopy }: ProfileAboutTabProps) {
  const shortcuts = [profile.roomShortcut, profile.familyShortcut].filter(
    (shortcut): shortcut is ProfileShortcut => Boolean(shortcut),
  );

  return (
    <View style={styles.body}>
      {shortcuts.length > 0 ? (
        <View style={styles.shortcuts}>
          {shortcuts.map((shortcut) => (
            <ProfileShortcutTile
              key={shortcut.kind}
              shortcut={shortcut}
              ownerName={profile.displayName}
              onPress={onOpenShortcut}
            />
          ))}
        </View>
      ) : null}

      {profile.tags.length > 0 ? (
        <>
          <Divider inset />
          <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionTitle}>
            Profile Tags
          </ThemedText>
          <View style={styles.tags}>
            {profile.tags.map((tag) => (
              <TagChip key={tag.label} emoji={tag.emoji} label={tag.label} size="medium" />
            ))}
          </View>
        </>
      ) : null}

      <Divider inset />
      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionTitle}>
        Information
      </ThemedText>

      {profile.signature ? (
        <ThemedText
          type="default"
          themeColor="textSecondary"
          style={[styles.signature, { textAlign: textAlignFor(profile.signature) }]}
        >
          {profile.signature}
        </ThemedText>
      ) : null}

      {profile.info.map((row) => (
        <InfoRow key={row.key} row={row} onCopy={onCopy} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: Spacing.three, paddingBottom: Spacing.four },
  shortcuts: { flexDirection: 'row', gap: Spacing.three, paddingTop: Spacing.three },
  // The reference sets these as quiet labels, not as headings: the rows below
  // are the content, and a bold heading would outrank them.
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  signature: { paddingBottom: Spacing.two, lineHeight: 26 },
});
