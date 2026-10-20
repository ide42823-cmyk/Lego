import { Pressable, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import type { UserSummary } from '@/core/data/types';
import { formatDistanceKm } from '@/core/format';
import { useTints } from '@/hooks/use-tints';

import { ThemedText } from './themed-text';
import { RANK_BADGES, UserBadgeItem, UserBadges } from './user-badges';
import { AgePill } from './ui/age-pill';
import { AppCard } from './ui/app-card';
import { Avatar } from './ui/avatar';
import { HiButton } from './ui/hi-button';
import { Icon } from './ui/icon';

/**
 * One person in a discovery directory (reference screens 097–100).
 *
 * The row is split into two sibling hit areas — opening the profile and sending
 * a greeting — rather than nesting one pressable inside another, so the
 * accessibility tree stays flat and both targets are unambiguous.
 *
 * Anatomy follows the reference: avatar, then name with gender and rank marks,
 * then the age/rank pills, then distance and status. The greeting fills the
 * trailing edge.
 */
export interface PeopleRowProps {
  user: UserSummary;
  onOpenProfile?: (userId: string) => void;
  onGreet?: (userId: string) => void;
}

export function PeopleRow({ user, onOpenProfile, onGreet }: PeopleRowProps) {
  const tints = useTints();
  const rank = RANK_BADGES.find((badge) => user.badges.includes(badge));
  const distance = user.distanceKm === undefined ? null : formatDistanceKm(user.distanceKm);
  const genderColor = user.gender ? tints.gender[user.gender] : undefined;

  return (
    <AppCard style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={[user.displayName, user.status].filter(Boolean).join('. ')}
        onPress={() => onOpenProfile?.(user.id)}
        style={({ pressed }) => [styles.main, pressed && { opacity: 0.7 }]}
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
            <ThemedText type="smallBold" numberOfLines={1} style={styles.name}>
              {user.displayName}
            </ThemedText>
            {user.gender ? (
              <Icon name={user.gender} size={13} strokeWidth={2.6} color={genderColor} />
            ) : null}
            <UserBadges
              badges={user.badges}
              level={user.level}
              vipTier={user.vipTier}
              variant="status"
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

          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
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
  card: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  main: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  text: { flex: 1, gap: Spacing.one },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, flexWrap: 'wrap' },
  name: { fontSize: 16, lineHeight: 22, flexShrink: 1 },
  pillRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, flexWrap: 'wrap' },
});
