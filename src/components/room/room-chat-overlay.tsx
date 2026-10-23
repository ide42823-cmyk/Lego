import { Pressable, StyleSheet, View } from 'react-native';

import { RoomPalette, Spacing } from '@/constants/theme';
import type { RoomFeedNotice } from '@/core/data/types';

import { Icon } from '../ui/icon';
import { ThemedText } from '../themed-text';

export interface RoomChatOverlayProps {
  welcomeText: string;
  introduction: string;
  eventNotices: RoomFeedNotice[];
  /** The GO chips jump into event flows; all events are backend-gated. */
  onPressEvent: () => void;
}

/**
 * The room's chat overlay, pinned above the composer: the pinned welcome
 * rules, the host's introduction card, then event notices with GO chips.
 * The welcome copy deliberately reads as a system stream (its own tint) so
 * it cannot be mistaken for member chat.
 */
export function RoomChatOverlay({ welcomeText, introduction, eventNotices, onPressEvent }: RoomChatOverlayProps) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.card, styles.welcome]}>
        <ThemedText type="small" style={styles.welcomeText}>
          {welcomeText}
        </ThemedText>
      </View>
      <View style={[styles.card, styles.intro]}>
        <View style={styles.introTitleRow}>
          <Icon name="megaphone" size={14} color={RoomPalette.gold} fill={RoomPalette.gold} />
          <ThemedText type="smallBold" style={styles.introTitle}>
            Room introduction
          </ThemedText>
        </View>
        <ThemedText type="small" style={styles.introText}>
          {introduction}
        </ThemedText>
      </View>
      {eventNotices.map((notice) => (
        <View key={notice.id} style={[styles.card, styles.event]}>
          <ThemedText type="smallBold" style={styles.eventTitle}>
            {notice.title}
          </ThemedText>
          <View style={styles.eventRow}>
            <ThemedText type="small" style={styles.eventText} numberOfLines={3}>
              {notice.text}
            </ThemedText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Open ${notice.title ?? 'the event'}`}
              accessibilityHint="Opens the event when the backend phase arrives"
              onPress={onPressEvent}
              style={({ pressed }) => [styles.go, pressed && { opacity: 0.8 }]}
            >
              <ThemedText type="small" style={styles.goText}>
                GO
              </ThemedText>
            </Pressable>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.two,
    flexShrink: 1,
  },
  card: {
    borderRadius: 14,
    backgroundColor: 'rgba(10, 10, 20, 0.44)',
    padding: Spacing.two,
  },
  welcome: {
    maxHeight: 150,
  },
  welcomeText: {
    color: '#4ADE80',
  },
  intro: {
    alignSelf: 'flex-start',
  },
  introTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  introTitle: {
    color: RoomPalette.gold,
    fontWeight: 800,
  },
  introText: {
    color: RoomPalette.text,
  },
  event: {
    gap: 2,
  },
  eventTitle: {
    color: RoomPalette.gold,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
  },
  eventText: {
    color: RoomPalette.textMuted,
    flex: 1,
  },
  go: {
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: Spacing.three,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goText: {
    color: RoomPalette.text,
    fontWeight: 800,
  },
});
