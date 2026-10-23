import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, RoomPalette } from '@/constants/theme';
import { imageSource } from '@/core/media/images';

import { Icon } from '../ui/icon';
import { ThemedText } from '../themed-text';

export interface RoomEventCardProps {
  title: string;
  countdownLabel: string;
  artUrl: string;
  /** Opening an event flow is backend work; the card reports the gate. */
  onPress: () => void;
}

/**
 * The floating promo card that sits right of the chat overlay in the
 * reference: a remaining-time chip over event art. Taps report out because
 * event entry is a backend flow.
 */
export function RoomEventCard({ title, countdownLabel, artUrl, onPress }: RoomEventCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${countdownLabel} remaining`}
      accessibilityHint="Opens the event when the backend phase arrives"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
    >
      <Image source={imageSource(artUrl)} style={styles.art} contentFit="cover" />
      <View style={styles.scrim} />
      <View style={styles.titleRow}>
        <ThemedText type="small" style={styles.title} numberOfLines={1}>
          {title}
        </ThemedText>
      </View>
      <View style={styles.clockRow}>
        <Icon name="history" size={10} color={RoomPalette.text} />
        <ThemedText type="small" style={styles.clock} numberOfLines={1}>
          {countdownLabel}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 112,
    borderRadius: Radius.medium,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderStyle: 'solid',
    overflow: 'hidden',
    backgroundColor: RoomPalette.surfaceStrong,
    aspectRatio: 1.55,
  },
  art: {
    ...StyleSheet.absoluteFill,
    opacity: 0.85,
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(6, 6, 14, 0.34)',
  },
  titleRow: {
    position: 'absolute',
    top: 6,
    start: 0,
    end: 0,
    alignItems: 'center',
  },
  title: {
    color: RoomPalette.text,
    fontWeight: 600,
  },
  clockRow: {
    position: 'absolute',
    bottom: 6,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(6, 6, 14, 0.6)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  clock: {
    color: RoomPalette.text,
    fontWeight: 700,
    fontSize: 11,
    lineHeight: 14,
  },
});
