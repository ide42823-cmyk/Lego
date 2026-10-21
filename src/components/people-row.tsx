import { Pressable, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import type { UserSummary } from '@/core/data/types';
import { formatDistanceKm } from '@/core/format';

import { ThemedText } from './themed-text';
import { RANK_BADGES, UserBadgeItem, UserBadges } from './user-badges';
import { AgePill } from './ui/age-pill';
import { AppCard } from './ui/app-card';
import { Avatar } from './ui/avatar';
import { HiButton } from './ui/hi-button';

/**
 * One person in a discovery directory (reference screens 097–100).
 *
 * The row is split into two sibling hit areas — opening the profile and sending
 * a greeting — rather than nesting one pressable inside another, so the
 * accessibility tree stays flat and both targets are unambiguous.
 *
 * Anatomy follows the reference card: a large portrait with the presence cut
 * into its top corner, a decorated name with the verified seal and charm
 * flower, the age/gender pill beside the paid tier, then distance and status.
 * The greeting fills the trailing edge as a pink gradient pill.
 */
export interface PeopleRowProps {
  user: UserSummary;
  onOpenProfile?: (userId: string) => void;
  onGreet?: (userId: string) => void;
}

export function PeopleRow({ user, onOpenProfile, onGreet }: PeopleRowProps) {
  const rank = RANK_BADGES.find((badge) => user.badges.includes(badge));
  const distance = user.distanceKm === undefined ? null : formatDistanceKm(user.distanceKm);

  return (
    <AppCard style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={[user.displayName, user.status].filter(Boolean).join('. ')}
        onPress={() => onOpenProfile?.(user.id)}
        style={({ pressed }) => [styles.main, pressed && styles.pressed]}
      >
        <Avatar
          id={user.id}
          name={user.displayName}
          uri={user.avatarUrl}
          size={60}
          frame={user.avatarFrame}
          online={user.isOnline}
          videoCall={user.videoCall}
        />
        <View style={styles.text}>
          <View style={styles.nameRow}>
            <ThemedText type="smallBold" numberOfLines={2} style={styles.name}>
              {user.displayName}
            </ThemedText>
            <UserBadges
              badges={user.badges}
              level={user.level}
              vipTier={user.vipTier}
              variant="status"
              presentation="directory"
            />
          </View>

          {user.age === undefined && !rank ? null : (
            <View style={styles.pillRow}>
              {user.age === undefined ? null : <AgePill age={user.age} gender={user.gender} />}
              {rank ? (
                <UserBadgeItem badge={rank} level={user.level} vipTier={user.vipTier} />
              ) : null}
            </View>
          )}

          <ThemedText
            type="small"
            themeColor="textSecondary"
            numberOfLines={1}
            style={styles.status}
          >
            {distance ? `${distance} · ` : ''}
            {user.status}
          </ThemedText>
        </View>
      </Pressable>

      <HiButton name={user.displayName} onPress={() => onGreet?.(user.id)} />
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, borderRadius: 22 },
  main: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  pressed: { opacity: 0.7 },
  text: { flex: 1, gap: 5, minWidth: 0 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flexWrap: 'nowrap',
    minWidth: 0,
  },
  name: { fontSize: 17, lineHeight: 22, flexShrink: 1, minWidth: 0 },
  pillRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  status: { lineHeight: 19, opacity: 0.9, marginTop: 1 },
});
