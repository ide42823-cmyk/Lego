import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing, type ChipTintKey } from '@/constants/theme';
import type { RoomBadge, RoomCategory, RoomSummary } from '@/core/data/types';
import { formatCompactCount } from '@/core/format';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from './themed-text';
import { AppCard } from './ui/app-card';
import { CategoryChip } from './ui/category-chip';
import { Icon, type IconName } from './ui/icon';
import { LevelEmblem } from './ui/level-emblem';
import { MediaThumb } from './ui/media-thumb';

/**
 * A room in any directory (reference screens 090–094).
 *
 * `list` is the card used by every text directory; `grid` is the two-column
 * Video discovery layout. Both carry the same information, so switching between
 * them never hides the participant count or the host.
 */
export type RoomCardVariant = 'list' | 'grid';

export interface RoomCardProps {
  room: RoomSummary;
  variant?: RoomCardVariant;
  onPress?: (roomId: string) => void;
}

const CATEGORY_LABELS: Record<RoomCategory, string> = {
  chat: 'Chat',
  families: 'Families',
  friendship: 'Friendship',
  video: 'Video',
};

const BADGE_LABELS: Record<RoomBadge, string> = {
  official: 'Official',
  featured: 'Featured',
  trending: 'Trending',
};

const BADGE_ICONS: Record<RoomBadge, IconName> = {
  official: 'verified',
  featured: 'star',
  trending: 'trending',
};

function ParticipantCount({ count }: { count: number }) {
  const theme = useTheme();

  return (
    <View
      style={styles.count}
      accessibilityRole="text"
      accessibilityLabel={`${count} people in this room`}
    >
      <Icon name="rooms" size={16} strokeWidth={2.4} color={theme.brand} />
      <ThemedText type="small" style={[styles.countText, { color: theme.brand }]}>
        {formatCompactCount(count)}
      </ThemedText>
    </View>
  );
}

function RoomMeta({ room }: { room: RoomSummary }) {
  return (
    <View style={styles.chipRow}>
      <CategoryChip label={CATEGORY_LABELS[room.category]} tone={room.category as ChipTintKey} />
      {(room.badges ?? []).map((badge) => (
        <CategoryChip
          key={badge}
          label={BADGE_LABELS[badge]}
          tone={badge as ChipTintKey}
          icon={BADGE_ICONS[badge]}
        />
      ))}
    </View>
  );
}

export function RoomCard({ room, variant = 'list', onPress }: RoomCardProps) {
  const accessibilityLabel = `${room.name}. ${CATEGORY_LABELS[room.category]} room hosted by ${room.hostName}, ${room.participantCount} people. ${room.description}`;

  if (variant === 'grid') {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={() => onPress?.(room.id)}
        style={({ pressed }) => [styles.gridCard, pressed && { opacity: 0.8 }]}
      >
        <View style={styles.gridCoverWrapper}>
          <MediaThumb
            id={room.id}
            label={`${room.name} cover`}
            uri={room.coverUrl}
            borderRadius={Radius.large}
            style={styles.gridCover}
          />
          <View style={styles.gridCount}>
            <ParticipantCount count={room.participantCount} />
          </View>
        </View>
        <View style={styles.gridTitleRow}>
          <ThemedText type="smallBold" numberOfLines={1} style={styles.title}>
            {room.name}
          </ThemedText>
          <LevelEmblem level={room.hostLevel} size={18} />
        </View>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
          {room.hostName}
        </ThemedText>
        <RoomMeta room={room} />
      </Pressable>
    );
  }

  return (
    <AppCard padded={false} style={styles.listCard}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={() => onPress?.(room.id)}
        style={({ pressed }) => [styles.listInner, pressed && { opacity: 0.8 }]}
      >
        <MediaThumb
          id={room.id}
          label={`${room.name} cover`}
          uri={room.coverUrl}
          style={styles.listCover}
        />
        <View style={styles.listBody}>
          <View style={styles.titleRow}>
            <ThemedText type="smallBold" numberOfLines={1} style={styles.title}>
              {room.name}
            </ThemedText>
            <LevelEmblem level={room.hostLevel} size={18} />
          </View>
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            {room.description}
          </ThemedText>
          <RoomMeta room={room} />
        </View>
        <ParticipantCount count={room.participantCount} />
      </Pressable>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  listCard: { borderRadius: Radius.large },
  listInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.two + 2,
  },
  listCover: { width: 84, height: 84, borderRadius: Radius.medium },
  listBody: { flex: 1, gap: Spacing.one },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  title: { fontSize: 16, lineHeight: 22, flexShrink: 1 },
  chipRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, flexWrap: 'wrap' },
  count: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingEnd: Spacing.one },
  countText: { fontSize: 12, fontWeight: '700' },

  gridCard: { flex: 1, gap: Spacing.one },
  gridCoverWrapper: { position: 'relative' },
  gridCover: { width: '100%', aspectRatio: 3 / 4 },
  gridCount: {
    position: 'absolute',
    bottom: Spacing.two,
    end: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(12, 8, 24, 0.55)',
  },
  gridTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
});
