import type { ReactElement } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import type { RelationshipRecord } from '@/core/data/types';
import { useTheme } from '@/hooks/use-theme';
import { useTints } from '@/hooks/use-tints';

import { ThemedText } from '../themed-text';
import { Avatar } from '../ui/avatar';
import { Divider } from '../ui/divider';
import { Icon } from '../ui/icon';

/** Cards are a fixed width so a row of them lines up with the reference's grid. */
const CARD_WIDTH = 104;

export interface CouplePanelProps {
  record: RelationshipRecord;
  ownerId: string;
  ownerName: string;
  ownerAvatarUrl?: string;
  onPress: (record: RelationshipRecord) => void;
}

/**
 * The couple panel (reference screens 018, 021–023).
 *
 * The duration is the relationship's own fact, so it is shown between the pair
 * rather than as a badge on either member.
 */
export function CouplePanel({
  record,
  ownerId,
  ownerName,
  ownerAvatarUrl,
  onPress,
}: CouplePanelProps) {
  const tints = useTints();
  const colors = tints.chip.friendship;

  const side = (
    id: string,
    name: string,
    uri: string | undefined,
    withHeart: boolean,
  ): ReactElement => (
    <View style={styles.coupleSide}>
      <Avatar id={id} name={name} uri={uri} size={58} />
      <View style={styles.coupleNameRow}>
        {withHeart ? (
          <Icon name="greeting" size={11} color={colors.text} fill={colors.text} />
        ) : null}
        <ThemedText
          type="small"
          numberOfLines={1}
          style={[styles.coupleName, { color: colors.text }]}
        >
          {name}
        </ThemedText>
      </View>
    </View>
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Couple level ${record.level} with ${record.peerName}, ${record.days} days`}
      onPress={() => onPress(record)}
      style={({ pressed }) => [
        styles.couplePanel,
        { backgroundColor: colors.background, borderColor: colors.text },
        pressed && { opacity: 0.85 },
      ]}
    >
      <View style={[styles.levelPill, { borderColor: colors.text }]}>
        <ThemedText type="small" style={[styles.levelLabel, { color: colors.text }]}>
          {`Couple Lv.${record.level}`}
        </ThemedText>
      </View>

      <View style={styles.coupleRow}>
        {side(ownerId, ownerName, ownerAvatarUrl, true)}
        <View style={styles.emblem}>
          <View style={[styles.emblemCircle, { backgroundColor: colors.text }]}>
            <Icon name="rank" size={22} strokeWidth={2} color="#FFFFFF" />
          </View>
          <View style={styles.daysPill}>
            <ThemedText type="small" style={styles.daysLabel}>
              {`${record.days} days`}
            </ThemedText>
          </View>
        </View>
        {side(record.peerId, record.peerName, undefined, false)}
      </View>
    </Pressable>
  );
}

export interface FriendCardProps {
  record: RelationshipRecord;
  onPress: (record: RelationshipRecord) => void;
}

/** One friend relationship tile. */
export function FriendCard({ record, onPress }: FriendCardProps) {
  const theme = useTheme();
  const tints = useTints();
  const colors = tints.chip.chat;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Friend level ${record.level} with ${record.peerName}, ${record.days} days`}
      onPress={() => onPress(record)}
      style={({ pressed }) => [
        styles.friendCard,
        { backgroundColor: colors.background, borderColor: colors.text },
        pressed && { opacity: 0.8 },
      ]}
    >
      <View style={styles.friendAvatar}>
        <Avatar id={record.peerId} name={record.peerName} size={48} />
        <View
          style={[
            styles.friendBadge,
            { backgroundColor: colors.text, borderColor: theme.background },
          ]}
        >
          <Icon name="rank" size={11} strokeWidth={2.4} color="#FFFFFF" />
        </View>
      </View>

      <ThemedText
        type="small"
        numberOfLines={1}
        style={[styles.friendName, { color: colors.text }]}
      >
        {record.peerName}
      </ThemedText>

      <View style={[styles.friendLevel, { borderColor: colors.text }]}>
        <ThemedText type="small" style={[styles.levelLabel, { color: colors.text }]}>
          {`Friend Lv.${record.level}`}
        </ThemedText>
      </View>

      <Divider />

      <ThemedText type="small" style={[styles.levelLabel, { color: colors.text }]}>
        {`${record.days} days`}
      </ThemedText>
    </Pressable>
  );
}

export interface RelationshipInviteTileProps {
  onPress: () => void;
}

/** The "Invite" tile that ends the relationship row. */
export function RelationshipInviteTile({ onPress }: RelationshipInviteTileProps) {
  const theme = useTheme();
  const tints = useTints();
  const colors = tints.chip.chat;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Invite a member to a relationship"
      onPress={onPress}
      style={({ pressed }) => [
        styles.inviteTile,
        { backgroundColor: colors.background },
        pressed && { opacity: 0.8 },
      ]}
    >
      <View style={[styles.inviteCircle, { backgroundColor: theme.background }]}>
        <Icon name="invite" size={22} strokeWidth={2} color={colors.text} />
      </View>
      <ThemedText type="small" style={[styles.inviteLabel, { color: colors.text }]}>
        Invite
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  couplePanel: {
    borderRadius: Radius.large,
    borderWidth: 1.5,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  levelPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.two,
    paddingVertical: 1,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  levelLabel: { fontSize: 11, lineHeight: 16, fontWeight: '800' },
  coupleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  coupleSide: { flex: 1, alignItems: 'center', gap: Spacing.one },
  coupleNameRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  coupleName: { fontStyle: 'italic', fontWeight: '700' },
  emblem: { alignItems: 'center', gap: Spacing.one },
  emblemCircle: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daysPill: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 1,
    borderRadius: Radius.pill,
    // Neutral chip: the duration is a fact, not a rank, so it takes no tier hue.
    backgroundColor: 'rgba(90, 90, 105, 0.22)',
  },
  daysLabel: { fontSize: 11, lineHeight: 16, fontWeight: '700' },

  friendCard: {
    width: CARD_WIDTH,
    borderRadius: Radius.large,
    borderWidth: 1.5,
    padding: Spacing.two,
    alignItems: 'center',
    gap: Spacing.one,
  },
  friendAvatar: { width: 48, height: 48 },
  friendBadge: {
    position: 'absolute',
    bottom: -2,
    end: -2,
    width: 20,
    height: 20,
    borderRadius: Radius.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendName: { fontStyle: 'italic', fontWeight: '700', maxWidth: '100%' },
  friendLevel: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 1,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },

  inviteTile: {
    width: CARD_WIDTH,
    borderRadius: Radius.large,
    // A filled tile, like the reference: the row ends on an action, not on a
    // dashed placeholder.
    padding: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    minHeight: 148,
  },
  inviteCircle: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteLabel: { fontWeight: '700' },
});
