import { Pressable, StyleSheet, View } from 'react-native';

import { RoomPalette } from '@/constants/theme';
import type { AvatarFrameKey, RoomSeat as RoomSeatData } from '@/core/data/types';

import { Avatar } from '../ui/avatar';
import { Icon } from '../ui/icon';
import { ThemedText } from '../themed-text';

export interface RoomSeatProps {
  seat: RoomSeatData;
  /** Seats are backend territory: joining, locking and gifting all report out. */
  onPress: (seatIndex: number) => void;
}

/**
 * One numbered voice seat. The reference draws a translucent disc for empty
 * seats with a plus sign, a lock for reserved ones, a member portrait for
 * taken ones, and always a numbered pill beneath the disc. The pill's
 * contribution number is display-only — the ledger is server-owned.
 */
export function RoomSeat({ seat, onPress }: RoomSeatProps) {
  const { index, status, avatarUrl, avatarFrame, contribution } = seat;

  return (
    <View style={styles.cell}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          status === 'occupied'
            ? `Seat ${index} is taken`
            : status === 'locked'
              ? `Seat ${index} is reserved`
              : `Take seat ${index}`
        }
        accessibilityHint="States whether seating is available yet"
        onPress={() => onPress(index)}
        style={({ pressed }) => [styles.target, pressed && { opacity: 0.8 }]}
      >
        {status === 'occupied' ? (
          <Avatar
            id={`seat-${index}`}
            name={`Seat ${index}`}
            uri={avatarUrl}
            size={52}
            frame={avatarFrame as AvatarFrameKey}
          />
        ) : (
          <View style={styles.disc}>
            <Icon
              name={status === 'locked' ? 'lock' : 'plus'}
              size={20}
              color={RoomPalette.textMuted}
              strokeWidth={2}
            />
          </View>
        )}
        <ThemedText type="small" style={styles.number}>
          {index}
        </ThemedText>
        <View style={styles.pill}>
          <ThemedText type="small" style={styles.pillText}>
            {contribution}
          </ThemedText>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  cell: {
    width: '19%',
    alignItems: 'center',
  },
  target: {
    alignItems: 'center',
    minWidth: 60,
  },
  disc: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    color: RoomPalette.text,
    marginTop: 6,
  },
  pill: {
    marginTop: 4,
    minWidth: 58,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: RoomPalette.selection,
    borderStyle: 'solid',
    backgroundColor: 'rgba(10, 10, 20, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: {
    color: RoomPalette.text,
    fontWeight: 700,
  },
});
