import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import type { RoomSummary } from '@/core/data/types';
import { formatCompactCount } from '@/core/format';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from './themed-text';
import { MediaThumb } from './ui/media-thumb';
import { TagChip } from './ui/tag-chip';

/**
 * A room in any directory (reference screens 090–094).
 *
 * `list` covers Recommend / New / Joined / Global rows; `grid` is the two-column
 * Video discovery layout. Both carry the same information, so switching between
 * them never hides the participant count or the host.
 */
export type RoomCardVariant = 'list' | 'grid';

export interface RoomCardProps {
  room: RoomSummary;
  variant?: RoomCardVariant;
  onPress?: (roomId: string) => void;
}

const CATEGORY_LABELS: Record<RoomSummary['category'], string> = {
  chat: 'Chat',
  families: 'Families',
  video: 'Video',
};

function ParticipantCount({ count }: { count: number }) {
  return (
    <View
      style={styles.count}
      accessibilityRole="text"
      accessibilityLabel={`${count} people in this room`}
    >
      <ThemedText type="small" themeColor="textSecondary" style={styles.countText}>
        {`👥 ${formatCompactCount(count)}`}
      </ThemedText>
    </View>
  );
}

export function RoomCard({ room, variant = 'list', onPress }: RoomCardProps) {
  const theme = useTheme();
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
            style={styles.gridCover}
          />
          <View style={[styles.gridCount, { backgroundColor: theme.overlay }]}>
            <ThemedText type="small" style={styles.gridCountText}>
              {`👥 ${formatCompactCount(room.participantCount)}`}
            </ThemedText>
          </View>
        </View>
        <ThemedText type="smallBold" numberOfLines={2}>
          {room.name}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
          {`${room.hostName} · Lv ${room.hostLevel}`}
        </ThemedText>
        {room.tags.length > 0 ? (
          <View style={styles.tagRow}>
            {room.tags.slice(0, 2).map((tag) => (
              <TagChip key={tag} label={tag} />
            ))}
          </View>
        ) : null}
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={() => onPress?.(room.id)}
      style={({ pressed }) => [styles.listCard, pressed && { opacity: 0.8 }]}
    >
      <MediaThumb
        id={room.id}
        label={`${room.name} cover`}
        uri={room.coverUrl}
        style={styles.listCover}
      />
      <View style={styles.listBody}>
        <ThemedText type="smallBold" numberOfLines={1}>
          {room.name}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
          {room.description}
        </ThemedText>
        <View style={styles.listMeta}>
          <TagChip label={CATEGORY_LABELS[room.category]} />
          {room.country ? <TagChip label={room.country} /> : null}
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1} style={styles.host}>
            {`${room.hostName} · Lv ${room.hostLevel}`}
          </ThemedText>
        </View>
      </View>
      <ParticipantCount count={room.participantCount} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
  },
  listCover: { width: 64, height: 64, borderRadius: Radius.medium },
  listBody: { flex: 1, gap: Spacing.half },
  listMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, flexWrap: 'wrap' },
  host: { flexShrink: 1 },
  count: { minWidth: 52, alignItems: 'flex-end' },
  countText: { fontSize: 12 },
  gridCard: { flex: 1, gap: Spacing.one },
  gridCoverWrapper: { position: 'relative' },
  gridCover: { width: '100%', aspectRatio: 3 / 4 },
  gridCount: {
    position: 'absolute',
    top: Spacing.two,
    end: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Radius.pill,
  },
  gridCountText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  tagRow: { flexDirection: 'row', gap: Spacing.one, flexWrap: 'wrap' },
});
