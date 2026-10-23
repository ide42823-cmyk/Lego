import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { countryFlag } from '@/core/format';
import type { UserSummaryIdentity } from '@/core/data/types';
import { useTheme } from '@/hooks/use-theme';

import { Icon } from '../ui/icon';
import { MediaThumb } from '../ui/media-thumb';
import { AgePill } from '../ui/age-pill';
import { TierBadge } from '../ui/tier-badge';
import { ThemedText } from '../themed-text';

export interface ThreadProfileCardProps {
  peer: UserSummaryIdentity;
  /** The pinned "status" line the card quotes. */
  status: string;
  /** "Active now" / long-form age, prepared by the screen. */
  presence: string;
  /** Relationship level. Server-owned; shown, never incremented here. */
  intimacyLevel: number;
  /** Two to four stills the peer presents; the slot count follows the data. */
  peerMedia: string[];
  onOpenProfile: () => void;
}

/**
 * The peer card under the bar, matching the reference's anatomy: name with
 * flag and bloom, the age and tier pills, presence in words, the quoted
 * status, and the photo strip on the left — with the pink intimacy heart and
 * its level pill answering on the right.
 *
 * The card taps into the public profile, the deep link the app already owns.
 * The intimacy level is server-owned presentation; nothing here computes it.
 */
export function ThreadProfileCard({
  peer,
  status,
  presence,
  intimacyLevel,
  peerMedia,
  onOpenProfile,
}: ThreadProfileCardProps) {
  const theme = useTheme();
  const flag = countryFlag(peer.locale);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${peer.displayName}'s profile`}
      onPress={onOpenProfile}
      style={({ pressed }) => [styles.card, { backgroundColor: theme.backgroundElement }, pressed && { opacity: 0.9 }]}
    >
      <View style={styles.main}>
        <View style={styles.nameRow}>
          <ThemedText style={styles.name} numberOfLines={1} accessible={false}>
            {peer.displayName}
          </ThemedText>
          {flag ? (
            <ThemedText type="small" accessible={false} style={styles.small}>
              {' '}
              {flag}
            </ThemedText>
          ) : null}
          <Icon name="flower" size={13} strokeWidth={2} color={theme.accent} />
        </View>
        <View style={styles.pillsRow}>
          {peer.age ? <AgePill age={peer.age} gender={peer.gender} /> : null}
          {peer.vipTier ? (
            <TierBadge tier="vip" label={`VIP${peer.vipTier}`} crowned />
          ) : null}
        </View>
        <ThemedText type="small" themeColor="textSecondary" accessible={false}>
          {presence}
        </ThemedText>
        <ThemedText
          type="small"
          themeColor="textSecondary"
          numberOfLines={2}
          accessible={false}
          style={styles.status}
        >
          {status}
        </ThemedText>
        <View
          accessible
          accessibilityLabel={`${peerMedia.length} photos of ${peer.displayName}`}
          style={styles.mediaRow}
        >
          {peerMedia.map((uri, index) => (
            <MediaThumb
              key={uri}
              id={uri}
              label={`Photo ${index + 1}`}
              uri={uri}
              borderRadius={Radius.small}
              style={styles.thumb}
            />
          ))}
        </View>
      </View>
      <View
        accessible
        accessibilityLabel={`Intimacy level ${intimacyLevel} with ${peer.displayName}`}
        style={styles.intimacy}
      >
        <Icon name="greeting" size={40} strokeWidth={1.4} color={theme.accent} fill={theme.accent} />
        <View style={[styles.levelPill, { backgroundColor: theme.accent }]}>
          <ThemedText type="small" style={styles.levelText}>
            {intimacyLevel}
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    marginHorizontal: Spacing.three,
    marginTop: Spacing.two,
    padding: Spacing.two,
    borderRadius: Radius.large,
  },
  main: { flex: 1, minWidth: 0, gap: Spacing.one },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
  },
  name: { fontSize: 15, lineHeight: 21, fontWeight: '700', flexShrink: 1 },
  small: { fontSize: 12, lineHeight: 16 },
  pillsRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, flexWrap: 'wrap' },
  status: { opacity: 0.8 },
  mediaRow: {
    flexDirection: 'row',
    gap: Spacing.one,
    marginTop: Spacing.half,
  },
  thumb: { width: 62, aspectRatio: 1, borderRadius: Radius.small },
  intimacy: {
    alignItems: 'center',
    gap: Spacing.one,
    paddingTop: Spacing.two,
  },
  levelPill: {
    minWidth: 30,
    alignItems: 'center',
    paddingHorizontal: Spacing.one,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  levelText: { color: '#FFFFFF', fontSize: 12, lineHeight: 16, fontWeight: '800' },
});
