import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import type { UserProfile } from '@/core/data/types';
import { formatElapsedLong } from '@/core/format';
import { useTheme } from '@/hooks/use-theme';
import { useTints } from '@/hooks/use-tints';

import { ThemedText } from '../themed-text';
import { RANK_BADGES, UserBadgeItem, UserBadges } from '../user-badges';
import { AgePill } from '../ui/age-pill';
import { Avatar } from '../ui/avatar';
import { CategoryChip } from '../ui/category-chip';
import { Icon } from '../ui/icon';
import { LevelEmblem } from '../ui/level-emblem';

export interface ProfileIdentityProps {
  profile: UserProfile;
  /** How far the avatar overlaps the cover above it. */
  overlap?: number;
}

/**
 * The identity block: avatar, name, presence and the rank chip row (reference
 * screens 001, 027).
 *
 * The avatar deliberately overlaps the cover. The reference does the same, and it
 * is what stops a short cover from reading as a separate, detached band.
 *
 * The rank is rendered outside the badge cluster (`variant="status"`) so the chip
 * row keeps the reference's order: age, level, rank, family.
 */
export function ProfileIdentity({ profile, overlap = 30 }: ProfileIdentityProps) {
  const theme = useTheme();
  const tints = useTints();

  const genderColor = profile.gender ? tints.gender[profile.gender] : undefined;
  const rank = RANK_BADGES.find((badge) => profile.badges.includes(badge));

  return (
    <View style={[styles.identity, { marginTop: -overlap }]}>
      <Avatar
        id={profile.id}
        name={profile.displayName}
        uri={profile.avatarUrl}
        size={68}
        radius={20}
        online={profile.isOnline}
        style={{
          borderWidth: 3,
          borderColor: theme.background,
        }}
      />

      <View style={styles.nameRow}>
        <ThemedText
          accessibilityRole="header"
          numberOfLines={1}
          style={styles.name}
          // The status line is the member's own words; it belongs in the name's
          // accessible sentence rather than being a separate unlabelled node.
          accessibilityLabel={[profile.displayName, profile.status].filter(Boolean).join('. ')}
        >
          {profile.displayName}
        </ThemedText>
        {profile.gender ? (
          <Icon name={profile.gender} size={16} strokeWidth={2.6} color={genderColor} />
        ) : null}
        <UserBadges
          badges={profile.badges}
          level={profile.level}
          vipTier={profile.vipTier}
          variant="status"
        />
      </View>

      <ThemedText type="small" themeColor="textSecondary">
        {formatElapsedLong(profile.lastActiveAt)}
      </ThemedText>

      <View style={styles.chipRow}>
        {profile.age === undefined ? null : <AgePill age={profile.age} gender={profile.gender} />}
        {profile.level === undefined ? null : <LevelEmblem level={profile.level} />}
        {rank ? (
          <UserBadgeItem badge={rank} level={profile.level} vipTier={profile.vipTier} />
        ) : null}
        {profile.familyName ? (
          <CategoryChip tone="families" icon="rank" label={profile.familyName} />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  identity: { paddingHorizontal: Spacing.three, gap: Spacing.one },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    flexWrap: 'wrap',
    paddingTop: Spacing.two,
  },
  name: { fontSize: 24, lineHeight: 30, fontWeight: '800', flexShrink: 1 },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.one,
    paddingTop: Spacing.one,
  },
});
