import { StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import type { UserProfile } from '@/core/data/types';
import { formatElapsedLong } from '@/core/format';
import { useTints } from '@/hooks/use-tints';

import { ThemedText } from '../themed-text';
import { UserBadges } from '../user-badges';
import { AgePill } from '../ui/age-pill';
import { CategoryChip } from '../ui/category-chip';
import { TierBadge } from '../ui/tier-badge';
import { ProfileAgencyChip } from './profile-agency-chip';
import { ProfileEmblem } from './profile-emblem';

export interface ProfileIdentityProps {
  profile: UserProfile;
}

/**
 * The identity block: name, presence, crest and the stat row (reference screens
 * 001, 027).
 *
 * Three details follow the reference rather than the rest of the app:
 *
 *  1. There is no avatar here. The member's photos live on the cover, and a
 *     second avatar below it would be a second identity.
 *  2. The crest floats at the end of the block, overlapping the name and
 *     presence rows, so it reads as decoration rather than as a badge in a row.
 *  3. The stat row is age · charm · wealth · tier · agency. The gold level
 *     crest belongs to the discovery rows, not to the profile.
 */
export function ProfileIdentity({ profile }: ProfileIdentityProps) {
  const tints = useTints();
  // A level crest next to the name would compete with the charm/wealth chips and
  // is not what the reference prints, so the profile drops that one badge.
  const nameBadges = profile.badges.filter((badge) => badge !== 'level');
  const presence = formatElapsedLong(profile.lastActiveAt);

  return (
    <View style={styles.identity}>
      {profile.emblem ? <ProfileEmblem emblem={profile.emblem} style={styles.emblem} /> : null}

      <View style={[styles.nameRow, profile.emblem ? styles.nameRowWithEmblem : null]}>
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
        <UserBadges
          badges={nameBadges}
          level={profile.level}
          vipTier={profile.vipTier}
          variant="status"
        />
      </View>

      {/*
        Presence is one line. The reference prints only the elapsed time; the dot
        restores the online/offline signal the removed avatar used to carry, and
        folds it into the line's accessible name rather than being a bare shape.
      */}
      <View
        accessible
        accessibilityLabel={profile.isOnline ? `Online, ${presence}` : presence}
        style={styles.presenceRow}
      >
        {profile.isOnline ? (
          <View style={[styles.onlineDot, { backgroundColor: tints.online }]} />
        ) : null}
        <ThemedText type="small" themeColor="textSecondary">
          {presence}
        </ThemedText>
      </View>

      <View style={styles.chipRow}>
        {profile.age === undefined ? null : <AgePill age={profile.age} gender={profile.gender} />}
        {profile.charmLevel === undefined ? null : (
          <CategoryChip
            tone="charm"
            icon="diamonds"
            pill
            label={String(profile.charmLevel)}
            accessibilityLabel={`Charm level ${profile.charmLevel}`}
          />
        )}
        {profile.wealthLevel === undefined ? null : (
          <CategoryChip
            tone="wealth"
            icon="star"
            pill
            label={String(profile.wealthLevel)}
            accessibilityLabel={`Wealth level ${profile.wealthLevel}`}
          />
        )}
        {profile.vipTier ? <TierBadge tier="vip" label={`VIP${profile.vipTier}`} crowned /> : null}
        {profile.agency ? (
          <ProfileAgencyChip rank={profile.agency.rank} name={profile.agency.name} />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  identity: { paddingHorizontal: Spacing.three, paddingTop: Spacing.two, gap: Spacing.one },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    flexWrap: 'wrap',
  },
  /** Keeps a long name clear of the crest floating over this block. */
  nameRowWithEmblem: { paddingEnd: 88 },
  name: { fontSize: 24, lineHeight: 30, fontWeight: '800', flexShrink: 1 },
  presenceRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  onlineDot: { width: 6, height: 6, borderRadius: Radius.pill },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.one,
    // The reference gives the stat row its own band rather than stacking it
    // straight onto the presence line.
    paddingTop: Spacing.three,
  },
  emblem: { position: 'absolute', top: -Spacing.one, end: Spacing.three },
});
