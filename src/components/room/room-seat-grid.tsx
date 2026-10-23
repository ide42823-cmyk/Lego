import { StyleSheet, View } from 'react-native';

import type { RoomSeat } from '@/core/data/types';

import { RoomSeat as RoomSeatTile } from './room-seat';

export interface RoomSeatGridProps {
  /** Always ten entries: two rows of five, numbered 1–10. */
  seats: RoomSeat[];
  onPressSeat: (seatIndex: number) => void;
}

/**
 * The reference's ten-seat canvas: two fixed rows of five. Seats are laid out
 * in fixture order, so the grid never needs to derive positions — absent
 * members stay open discs, which is exactly how the reference reads.
 */
export function RoomSeatGrid({ seats, onPressSeat }: RoomSeatGridProps) {
  return (
    <View>
      <View style={styles.row}>
        {seats.slice(0, 5).map((seat) => (
          <RoomSeatTile key={seat.index} seat={seat} onPress={onPressSeat} />
        ))}
      </View>
      <View style={styles.row}>
        {seats.slice(5, 10).map((seat) => (
          <RoomSeatTile key={seat.index} seat={seat} onPress={onPressSeat} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
});
