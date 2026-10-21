import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { Radius, RankingPalette, Spacing } from '@/constants/theme';
import type { LeaderboardCategory, LeaderboardEntry } from '@/core/data/types';
import { useTints } from '@/hooks/use-tints';

import { ThemedText } from '../themed-text';
import { Avatar } from '../ui/avatar';
import { Icon } from '../ui/icon';
import { TierBadge } from '../ui/tier-badge';
import { LEADERBOARD_CATEGORY_META, leaderboardTierFor } from './ranking-config';

export interface LeaderboardPodiumProps {
  entries: readonly LeaderboardEntry[];
  category: LeaderboardCategory;
  onOpen: (entry: LeaderboardEntry) => void;
}

type MedalKey = 'gold' | 'silver' | 'bronze';

function medalFor(rank: number): MedalKey {
  if (rank === 1) {
    return 'gold';
  }
  return rank === 2 ? 'silver' : 'bronze';
}

/**
 * Ranks 1–3 on the night stage.
 *
 * The display order is second–first–third, with the winner's arch tallest in
 * the centre. Each spot is one button: the crown, portrait, rank medallion,
 * tier, name and score are announced together, starting with the rank.
 *
 * The arches are an original composition. The reference's engraved columns and
 * ornate metal frames are trade dress and are not reproduced; the portraits use
 * the app's own frame art.
 */
export function LeaderboardPodium({ entries, category, onOpen }: LeaderboardPodiumProps) {
  const { width } = useWindowDimensions();
  const compact = width < 380;
  const meta = LEADERBOARD_CATEGORY_META[category];

  if (entries.length === 0) {
    return null;
  }

  const ordered =
    entries.length >= 3
      ? [entries[1], entries[0], entries[2]]
      : entries.length === 2
        ? [entries[1], entries[0]]
        : [entries[0]];

  return (
    <View style={styles.wrap}>
      <View style={styles.stageRow}>
        {ordered.map((entry) =>
          entry ? (
            <PodiumSpot
              key={`${entry.kind}-${entry.id}`}
              entry={entry}
              metric={meta.metric}
              compact={compact}
              onOpen={onOpen}
            />
          ) : null,
        )}
      </View>
      <View style={styles.floor} pointerEvents="none" aria-hidden>
        <View style={styles.floorGlow} />
        <View style={styles.floorInner} />
        <View style={styles.floorRim} />
      </View>
    </View>
  );
}

interface PodiumSpotProps {
  entry: LeaderboardEntry;
  metric: string;
  compact: boolean;
  onOpen: (entry: LeaderboardEntry) => void;
}

function PodiumSpot({ entry, metric, compact, onOpen }: PodiumSpotProps) {
  const tints = useTints();
  const medal = tints.ranking[medalFor(entry.rank)];
  const first = entry.rank === 1;
  const tier = leaderboardTierFor(entry);
  const avatarSize = first ? (compact ? 70 : 78) : compact ? 56 : 62;
  const ringSize = avatarSize + 10;
  const columnHeight = first ? (compact ? 150 : 160) : compact ? 138 : 146;
  const label = [`Rank ${entry.rank}`, entry.name, tier?.label, `${entry.valueLabel} ${metric}`]
    .filter(Boolean)
    .join(', ');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => onOpen(entry)}
      style={({ pressed }) => [
        styles.spot,
        first && styles.firstSpot,
        { maxWidth: first ? 196 : 156 },
        pressed && { opacity: 0.82 },
      ]}
    >
      <View style={styles.head}>
        <View style={styles.crown}>
          {first ? (
            <Icon name="crown" size={19} strokeWidth={1.8} color={RankingPalette.gold} />
          ) : null}
        </View>

        <View
          style={[
            styles.ring,
            {
              width: ringSize,
              height: ringSize,
              borderRadius: entry.kind === 'room' ? 22 : Radius.pill,
              borderColor: medal.ring,
            },
          ]}
        >
          <Avatar
            id={entry.id}
            name={entry.name}
            uri={entry.avatarUrl}
            size={avatarSize}
            radius={entry.kind === 'room' ? 14 : undefined}
            frame={entry.avatarFrame}
            accessible={false}
          />
        </View>

        <View
          style={[styles.medal, { backgroundColor: medal.fill, borderColor: medal.ring }]}
          pointerEvents="none"
        >
          <ThemedText style={[styles.medalText, { color: medal.ink }]}>{entry.rank}</ThemedText>
        </View>
      </View>

      <View
        style={[
          styles.column,
          {
            height: columnHeight,
            borderColor: medal.ring,
          },
        ]}
      >
        <View
          style={[StyleSheet.absoluteFill, { backgroundColor: medal.fill }]}
          pointerEvents="none"
        />
        <View style={styles.columnSheen} pointerEvents="none" />
        <View style={styles.columnContent}>
          <ThemedText numberOfLines={2} style={[styles.name, first && styles.firstName]}>
            {entry.name}
          </ThemedText>
          {tier ? (
            <TierBadge tier={tier.tier} label={tier.label} crowned style={styles.tier} />
          ) : null}
          <View style={styles.valueRow}>
            <Icon
              name="greeting"
              size={first ? 15 : 13}
              strokeWidth={1}
              color={RankingPalette.heart}
              fill={RankingPalette.heart}
            />
            <ThemedText style={[styles.value, first && styles.firstValue]}>
              {entry.valueLabel}
            </ThemedText>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.one,
    zIndex: 1,
  },
  spot: {
    flex: 1,
    alignItems: 'center',
  },
  firstSpot: { flex: 1.16 },
  head: {
    alignItems: 'center',
    marginBottom: -20,
    zIndex: 2,
  },
  crown: { height: 20, alignItems: 'center', justifyContent: 'flex-end' },
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
    borderWidth: 2.5,
    backgroundColor: 'rgba(18, 7, 38, 0.9)',
    overflow: 'visible',
  },
  medal: {
    position: 'absolute',
    bottom: -10,
    minWidth: 22,
    height: 22,
    paddingHorizontal: 5,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medalText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  column: {
    width: '100%',
    borderRadius: Radius.large,
    borderTopLeftRadius: 44,
    borderTopRightRadius: 44,
    borderWidth: 1.5,
    overflow: 'hidden',
    backgroundColor: '#2B1548',
  },
  columnSheen: {
    position: 'absolute',
    top: 0,
    left: 10,
    right: 10,
    height: 26,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
  },
  columnContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 28,
    paddingBottom: Spacing.two + 2,
    paddingHorizontal: 6,
    gap: 4,
  },
  name: {
    color: RankingPalette.text,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: '100%',
  },
  firstName: { fontSize: 14, lineHeight: 18, fontWeight: '700' },
  tier: { alignSelf: 'center' },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    maxWidth: '100%',
  },
  value: {
    color: RankingPalette.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  firstValue: { fontSize: 15, lineHeight: 20 },
  floor: {
    width: '94%',
    height: 54,
    alignSelf: 'center',
    marginTop: -10,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(226, 206, 255, 0.42)',
    backgroundColor: 'rgba(128, 72, 206, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  floorGlow: {
    position: 'absolute',
    top: -7,
    left: -10,
    right: -10,
    bottom: -7,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(176, 122, 255, 0.10)',
  },
  floorInner: {
    width: '90%',
    height: 34,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    backgroundColor: 'rgba(198, 160, 255, 0.07)',
  },
  floorRim: {
    position: 'absolute',
    top: 5,
    width: '62%',
    height: 2,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(246, 198, 83, 0.34)',
  },
});
