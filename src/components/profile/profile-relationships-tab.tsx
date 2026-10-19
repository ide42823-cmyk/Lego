import { ScrollView, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import type { RelationshipRecord, UserProfile } from '@/core/data/types';

import { EmptyState } from '../ui/states';
import { CouplePanel, FriendCard, RelationshipInviteTile } from './profile-relationship-card';

export interface ProfileRelationshipsTabProps {
  profile: UserProfile;
  onOpenRecord: (record: RelationshipRecord) => void;
  onInvite: () => void;
}

/**
 * The Relationships section (reference screens 018, 021–023).
 *
 * A member with no couple and no friends gets a real empty state with the invite
 * affordance, rather than a blank section — the fixture data deliberately
 * includes both shapes so this path is exercised, not hypothetical.
 */
export function ProfileRelationshipsTab({
  profile,
  onOpenRecord,
  onInvite,
}: ProfileRelationshipsTabProps) {
  const empty = !profile.couple && profile.friends.length === 0;

  if (empty) {
    return (
      <View style={styles.emptyBody}>
        <EmptyState
          title="No relationships yet"
          message="Relationships appear here once an invitation is accepted. Nothing is created until both members agree."
          actionLabel="Invite"
          onAction={onInvite}
        />
      </View>
    );
  }

  return (
    <View style={styles.body}>
      {profile.couple ? (
        <View style={styles.padded}>
          <CouplePanel
            record={profile.couple}
            ownerId={profile.id}
            ownerName={profile.displayName}
            ownerAvatarUrl={profile.avatarUrl}
            onPress={onOpenRecord}
          />
        </View>
      ) : null}

      {profile.friends.length > 0 ? (
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
      ) : (
        <RelationshipInviteTile onPress={onInvite} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  body: { paddingTop: Spacing.three, paddingBottom: Spacing.six, gap: Spacing.three },
  emptyBody: { paddingHorizontal: Spacing.three, paddingTop: Spacing.three },
  padded: { paddingHorizontal: Spacing.three },
  friendRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    // Room for the card shadow so the scroller does not clip it.
    paddingVertical: Spacing.one,
  },
});
