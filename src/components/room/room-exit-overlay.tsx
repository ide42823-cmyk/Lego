import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '../themed-text';
import { Icon } from '../ui/icon';

export interface RoomExitOverlayProps {
  visible: boolean;
  /** Keep = stay mounted in the room; the overlay just closes. */
  onKeep: () => void;
  /** Exit leaves the room; the screen routes back. */
  onExit: () => void;
}

/**
 * The reference's keep-or-exit decision overlay: a dark scrim over the
 * mounted room (never a page swap) with two big round controls — a green
 * `Keep` above a red exit. Keeping keeps seat and audio state untouched,
 * which is why this is a transparent children-modal rather than navigation.
 */
export function RoomExitOverlay({ visible, onKeep, onExit }: RoomExitOverlayProps) {
  return (
    <Modal transparent visible={visible} onRequestClose={onKeep} animationType="fade">
      <View
        accessible
        accessibilityLabel="Leave the room?"
        style={[styles.scrim, { backgroundColor: 'rgba(8, 8, 16, 0.72)' }]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Keep"
          accessibilityHint="Stays in the room"
          onPress={onKeep}
          style={({ pressed }) => [styles.keep, pressed && { opacity: 0.85 }]}
        >
          <Icon name="check" size={34} color="#FFFFFF" strokeWidth={2.6} />
        </Pressable>
        <ThemedText type="smallBold" style={styles.label}>
          Keep
        </ThemedText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Exit"
          accessibilityHint="Leaves the room"
          onPress={onExit}
          style={({ pressed }) => [styles.exit, pressed && { opacity: 0.85 }]}
        >
          <Icon name="power" size={34} color="#FFFFFF" strokeWidth={2.6} />
        </Pressable>
        <ThemedText type="smallBold" style={styles.label}>
          Exit
        </ThemedText>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  keep: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginTop: 90,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exit: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginTop: 34,
    backgroundColor: '#E2374B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: '#FFFFFF',
  },
});
