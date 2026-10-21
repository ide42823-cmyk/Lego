import { Pressable, StyleSheet, View } from 'react-native';

import { RankingPalette, Spacing } from '@/constants/theme';
import type { LeaderboardCategory, LeaderboardEntry } from '@/core/data/types';

import { ThemedText } from '../themed-text';
import { Avatar } from '../ui/avatar';
import { Icon } from '../ui/icon';
import { TierBadge } from '../ui/tier-badge';
import { LEADERBOARD_CATEGORY_META, leaderboardTierFor } from './ranking-config';

export interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  category: LeaderboardCategory;
  onOpen: (entry: LeaderboardEntry) => void;
}

/**
 * One rank below the podium.
 *
 * The reference keeps these rows transparent on the night sky: no card, no
 * separators, just airy 76-point rows. The rank and supporting tier stay on the
 * leading edge; only the heart and value are end-aligned. The heart is the
 * board's score mark, not a claim that every category is a currency.
 */
export function LeaderboardRow({ entry, category, onOpen }: LeaderboardRowProps) {
  const meta = LEADERBOARD_CATEGORY_META[category];
  const tier = leaderboardTierFor(entry);
  const supporting = entry.kind === 'room' ? entry.subtitle : null;
  const label = [
    `Rank ${entry.rank}`,
    entry.name,
    tier?.label,
    supporting,
    `${entry.valueLabel} ${meta.metric}`,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => onOpen(entry)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <ThemedText style={styles.rank}>{entry.rank}</ThemedText>

      <Avatar
        id={entry.id}
        name={entry.name}
        uri={entry.avatarUrl}
        size={56}
        radius={entry.kind === 'room' ? 16 : undefined}
        frame={entry.avatarFrame}
        accessible={false}
      />

      <View style={styles.body}>
        <ThemedText numberOfLines={1} style={styles.name}>
          {entry.name}
        </ThemedText>
        {tier ? (
          <TierBadge tier={tier.tier} label={tier.label} crowned style={styles.tier} />
        ) : supporting ? (
          <ThemedText numberOfLines={1} style={styles.supporting}>
            {supporting}
          </ThemedText>
        ) : null}
      </View>

      <View style={styles.value}>
        <Icon
          name="greeting"
          size={15}
          strokeWidth={1}
          color={RankingPalette.heart}
          fill={RankingPalette.heart}
        />
        <ThemedText style={styles.valueText}>{entry.valueLabel}</ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: 10,
    paddingHorizontal: Spacing.three,
  },
  pressed: { opacity: 0.7 },
  rank: {
    width: 30,
    color: RankingPalette.textMuted,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    textAlign: 'start',
    fontVariant: ['tabular-nums'],
  },
  body: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 2,
  },
  name: {
    color: RankingPalette.text,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    maxWidth: '100%',
  },
  tier: { alignSelf: 'flex-start' },
  supporting: {
    color: RankingPalette.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    maxWidth: '100%',
  },
  value: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    minWidth: 64,
  },
  valueText: {
    color: RankingPalette.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
});
