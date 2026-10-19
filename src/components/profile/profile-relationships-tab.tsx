import { ScrollView, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import type { RelationshipRecord, UserProfile } from '@/core/data/types';

import { CouplePanel, FriendCard, RelationshipInviteTile } from './profile-relationship-card';

export interface ProfileRelationshipsTabProps {
  profile: UserProfile;
  onOpenRecord: (record: RelationshipRecord) => void;
  onInvite: () => void;
}

/**
 * The Relationships section (reference screens 018, 021–023).
 *
 * There is no empty state here on purpose. The reference keeps the same two
 * cards whether or not the member has a couple or friends, and the invitation
 * *is* the empty state: the couple card keeps its second slot for the invite, and
 * the friend row keeps its trailing invite tile. A member with nothing yet
 * therefore still sees two live affordances rather than a blank section.
 */
export function ProfileRelationshipsTab({
  profile,
  onOpenRecord,
  onInvite,
}: ProfileRelationshipsTabProps) {
  return (
    <View style={styles.body}>
      <View style={styles.padded}>
        <CouplePanel
          record={profile.couple}
          ownerId={profile.id}
          ownerName={profile.displayName}
          ownerAvatarUrl={profile.avatarUrl}
          onPress={onOpenRecord}
          onInvite={onInvite}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.friendRow}
        accessibilityLabel="Friends"
      >
        {profile.friends.map((record) => (
          <FriendCard key={record.id} record={record} onPress={onOpenRecord} />
        ))}
        <RelationshipInviteTile onPress={onInvite} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { paddingTop: Spacing.three, paddingBottom: Spacing.six, gap: Spacing.three },
  padded: { paddingHorizontal: Spacing.three },
  friendRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    // Room for the card shadow so the scroller does not clip it.
    paddingVertical: Spacing.one,
  },
});
