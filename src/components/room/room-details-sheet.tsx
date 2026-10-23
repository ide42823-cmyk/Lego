import { StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import type { LiveRoomDetails, RoomHost } from '@/core/data/types';

import { Avatar } from '../ui/avatar';
import { AppButton } from '../ui/app-button';
import { BottomSheet } from '../ui/bottom-sheet';
import { Icon } from '../ui/icon';
import { IconButton } from '../ui/icon-button';
import { ThemedText } from '../themed-text';

const TINTS = {
  violet: '#7C4DF0',
  blue: '#4D8DF0',
} as const;

export interface RoomDetailsSheetProps {
  visible: boolean;
  onClose: () => void;
  host: RoomHost;
  details: LiveRoomDetails;
  /** True when opened from inside a joined room (this phase): Join renders taken. */
  joined: boolean;
  /** Copying the room id is a client action; the screen owns the clipboard. */
  onCopyId: () => void;
  onShare: () => void;
  onFavorite: () => void;
  onJoin: () => void;
  onMembers: () => void;
  onAchievements: () => void;
  onInfo: () => void;
}

/**
 * The reference's Room Details sheet: the owner row with its copy affordance
 * and level crest, the achievements card with our own medal art, the members
 * card with mic/headset badges, the standing info text, and the footer of
 * share, favourite and Join. Chevrons and deeper lists are backend surfaces
 * and report out; nothing here meters coins (all value labels stay text).
 */
export function RoomDetailsSheet({
  visible,
  onClose,
  host,
  details,
  joined,
  onCopyId,
  onShare,
  onFavorite,
  onJoin,
  onMembers,
  onAchievements,
  onInfo,
}: RoomDetailsSheetProps) {
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Room Details"
      titleAlign="center"
      footer={
        <View style={styles.footer}>
          <IconButton name="share" label="Share this room" onPress={onShare} size={22} />
          <IconButton name="greeting" label="Follow this room" onPress={onFavorite} size={22} />
          <AppButton
            label={joined ? 'Joined' : 'Join'}
            variant="secondary"
            disabled={joined}
            onPress={onJoin}
            style={[styles.join, styles.joinSkin]}
          />
        </View>
      }
    >
      <View style={styles.ownerRow}>
        <Avatar id={host.id} name={host.displayName} uri={host.avatarUrl} size={64} radius={18} />
        <View style={styles.ownerTexts}>
          <ThemedText type="default" style={styles.ownerName} numberOfLines={1}>
            {host.displayName}
          </ThemedText>
          <View style={styles.idRow}>
            <ThemedText type="small" themeColor="textSecondary">
              {host.idLabel}
            </ThemedText>
            <IconButton
              name="copy"
              label="Copy the room id"
              onPress={onCopyId}
              size={15}
              compact
              tone="muted"
            />
          </View>
        </View>
        <View style={styles.levelBlock}>
          <View style={[styles.levelMedal, { backgroundColor: TINTS.violet }]}>
            <ThemedText type="smallBold" style={styles.levelValue} accessible={false}>
              {details.level}
            </ThemedText>
            <Icon name="crown" size={11} color="#FFE9A8" fill="#FFE9A8" />
          </View>
          <View style={styles.levelTexts}>
            <ThemedText type="small" themeColor="textSecondary">
              Level
            </ThemedText>
            <View style={styles.levelTrack}>
              <View
                style={[styles.levelFill, { width: `${Math.round(details.levelProgress * 100)}%` }]}
              />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardTitleRow}>
          <ThemedText type="default" style={styles.cardTitle}>
            {`Room Achievements(${details.achievements.length})`}
          </ThemedText>
          <IconButton
            name="forward"
            label="Open the achievements"
            onPress={onAchievements}
            size={18}
            tone="muted"
            compact
          />
        </View>
        <View style={styles.achievementRow}>
          {details.achievements.map((achievement) => (
            <View key={achievement.id} style={styles.achievement}>
              <View style={styles.medalWrap}>
                <View style={[styles.medal, { backgroundColor: TINTS[achievement.tone] }]}>
                  <ThemedText type="default" style={styles.medalValue} accessible={false}>
                    {achievement.valueLabel}
                  </ThemedText>
                  <Icon name="mic" size={13} color="#FFFFFF" fill="#FFFFFF" />
                </View>
                <View style={styles.tierChip}>
                  <ThemedText type="small" style={styles.tierText} accessible={false}>
                    {achievement.tierLabel}
                  </ThemedText>
                </View>
              </View>
              <ThemedText type="small" themeColor="textSecondary" style={styles.caption}>
                {achievement.caption}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardTitleRow}>
          <ThemedText type="default" style={styles.cardTitle}>
            {`Room Members(${details.members.length})`}
          </ThemedText>
          <IconButton
            name="forward"
            label="Open the member list"
            onPress={onMembers}
            size={18}
            tone="muted"
            compact
          />
        </View>
        <View style={styles.memberRow}>
          {details.members.map((member) => (
            <View key={member.id} style={styles.member}>
              <Avatar
                id={member.id}
                name=""
                uri={member.avatarUrl}
                size={52}
                frame={member.avatarFrame}
              />
              {member.badge ? (
                <View style={[styles.badgeDot, styles[member.badge]]}>
                  <Icon
                    name={member.badge === 'mic' ? 'mic' : 'headset'}
                    size={9}
                    color="#FFFFFF"
                    strokeWidth={2.6}
/>
                </View>
              ) : null}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardTitleRow}>
          <ThemedText type="default" style={styles.cardTitle}>
            Room Info
          </ThemedText>
          <IconButton
            name="forward"
            label="Open the room info"
            onPress={onInfo}
            size={18}
            tone="muted"
            compact
          />
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          {details.info}
        </ThemedText>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingTop: Spacing.two,
  },
  join: {
    flex: 1,
  },
  // The reference's Join pill reads muted; ours parks on a quiet grey.
  joinSkin: {
    backgroundColor: '#E4E4EA',
  },

  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  ownerTexts: {
    flex: 1,
    gap: 2,
  },
  ownerName: {
    fontWeight: 800,
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  // The crest is a shape of our own — a rounded octagon, not the reference's art.
  levelMedal: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  levelValue: {
    color: '#FFFFFF',
    fontWeight: 900,
  },
  levelTexts: {
    gap: 4,
    minWidth: 56,
  },
  levelTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(120, 120, 140, 0.22)',
    overflow: 'hidden',
  },
  levelFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#34B96F',
  },

  card: {
    backgroundColor: 'rgba(122, 112, 160, 0.07)',
    borderRadius: Radius.large,
    borderWidth: 0,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    marginBottom: Spacing.two,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  cardTitle: {
    fontWeight: 700,
  },

  achievementRow: {
    flexDirection: 'row',
    gap: Spacing.four,
  },
  achievement: {
    alignItems: 'center',
    gap: 4,
  },
  medalWrap: {
    position: 'relative',
  },
  medal: {
    width: 62,
    height: 62,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  medalValue: {
    color: '#FFFFFF',
    fontWeight: 900,
  },
  tierChip: {
    position: 'absolute',
    top: -6,
    end: -10,
    backgroundColor: '#FFFFFF',
    borderRadius: 9,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    borderStyle: 'solid',
  },
  tierText: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: 700,
    // Pinned: the chip stays white in both schemes, so dark-theme text would vanish.
    color: '#3A3A44',
  },
  caption: {
    textAlign: 'center',
  },

  memberRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  member: {
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    bottom: -2,
    end: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: '#FFFFFF',
  },
  mic: {
    backgroundColor: '#22C55E',
  },
  headset: {
    backgroundColor: '#F5B301',
  },
});
