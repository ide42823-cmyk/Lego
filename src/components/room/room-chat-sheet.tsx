import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radius, Spacing } from '@/constants/theme';
import type { RoomInboxModel, RoomInboxSystem } from '@/core/data/types';
import { formatInboxTime } from '@/core/format';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

import { Avatar } from '../ui/avatar';
import { CountBadge } from '../ui/badge';
import { GradientFill } from '../ui/gradient-fill';
import { Icon } from '../ui/icon';
import { ThemedText } from '../themed-text';

/**
 * The reference sheet carries its own light identity while the room behind
 * stays dark, so the palette is fixed here rather than read from the scheme.
 */
const INK = {
  title: '#141416',
  name: '#2A2A30',
  subtle: '#8A8A90',
  gradientTop: '#F9DDBE',
  gradientBottom: '#EAE7EA',
  disc: '#8B7CF7',
  discSoft: '#A99BF8',
  verified: '#4D8DF0',
  grabber: '#3A3A40',
  danger: '#F0441C',
} as const;

export interface RoomChatSheetProps {
  visible: boolean;
  onClose: () => void;
  inbox: RoomInboxModel;
  /** A conversation row opens its thread; the screen navigates. */
  onOpenConversation: (conversationId: string) => void;
  /** Moments is a real client route in this phase. */
  onOpenMoments: () => void;
  /** Interaction notifications and the team account are backend surfaces. */
  onSystemEntry: (entry: RoomInboxSystem) => void;
}

const SYSTEM_GLYPHS = {
  interactions: 'bell',
  team: 'shield',
  moments: 'globe',
} as const;

/**
 * The reference's room-context Messages sheet (screen 014): the three system
 * rows on the warm cream wash, then the latest conversations with avatars,
 * snippets, timestamps, online dots and unread stacks. Unread counts are
 * server state and are only ever displayed. Conversations open real threads;
 * the two gated system rows report out; Moments navigates like the page does.
 */
export function RoomChatSheet({
  visible,
  onClose,
  inbox,
  onOpenConversation,
  onOpenMoments,
  onSystemEntry,
}: RoomChatSheetProps) {
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const { height } = useWindowDimensions();

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType={reducedMotion ? 'none' : 'slide'}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.root} accessibilityViewIsModal>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          style={styles.scrim}
          onPress={onClose}
        />
        <View
          style={[
            styles.sheet,
            { maxHeight: height * 0.82, paddingBottom: insets.bottom + Spacing.three },
          ]}
        >
          <GradientFill from={INK.gradientTop} to={INK.gradientBottom} vertical />

          <ThemedText style={styles.title}>Messages</ThemedText>
          <ScrollView
            contentContainerStyle={styles.body}
            showsVerticalScrollIndicator={false}
          >
            {inbox.system.map((entry) => {
              const gated = entry.key !== 'moments';
              const onPress = () =>
                gated
                  ? onSystemEntry(entry)
                  : onOpenMoments();
              const time = entry.lastMessageAt
                ? formatInboxTime(entry.lastMessageAt)
                : null;

              return (
                <Pressable
                  key={entry.id}
                  accessibilityRole="button"
                  accessibilityLabel={[
                    entry.title,
                    entry.subtitle,
                    time ?? '',
                    entry.badge ? `${entry.badge} unread` : '',
                  ]
                    .filter(Boolean)
                    .join('. ')}
                  onPress={onPress}
                  style={({ pressed }) => [styles.row, pressed && { opacity: 0.75 }]}
                >
                  <View
                    style={[
                      styles.disc,
                      entry.key === 'moments' && { backgroundColor: INK.discSoft },
                    ]}
                  >
                    <Icon name={SYSTEM_GLYPHS[entry.key]} size={26} color="#FFFFFF" strokeWidth={2.1} />
                  </View>
                  <View style={styles.rowBody}>
                    <View style={styles.topLine}>
                      <ThemedText type="smallBold" numberOfLines={1} style={styles.name}>
                        {entry.title}
                      </ThemedText>
                      {entry.key === 'team' ? (
                        <Icon name="shield" size={16} color={INK.verified} strokeWidth={2.4} />
                      ) : null}
                      {time ? (
                        <ThemedText type="small" style={styles.subtle}>
                          {time}
                        </ThemedText>
                      ) : null}
                    </View>
                    <View style={styles.bottomLine}>
                      <ThemedText
                        type="small"
                        numberOfLines={1}
                        style={[styles.subtle, styles.snippet]}
                      >
                        {entry.subtitle}
                      </ThemedText>
                      {entry.badge ? (
                        <View style={styles.stack}>
                          <ThemedText type="small" style={styles.stackLabel}>
                            {entry.badge}
                          </ThemedText>
                        </View>
                      ) : null}
                    </View>
                  </View>
                </Pressable>
              );
            })}
            {inbox.conversations.map((conversation) => (
              <Pressable
                key={conversation.id}
                accessibilityRole="button"
                accessibilityLabel={[
                  conversation.peerName,
                  conversation.unreadCount > 0
                    ? `${conversation.unreadCount} unread`
                    : 'no unread messages',
                  conversation.snippet,
                  formatInboxTime(conversation.lastMessageAt),
                ].join('. ')}
                onPress={() => onOpenConversation(conversation.id)}
                style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
              >
                <Avatar
                  id={conversation.peerId}
                  name={conversation.peerName}
                  uri={conversation.avatarUrl}
                  size={56}
                  frame={conversation.avatarFrame}
                  online={conversation.isOnline}
                />
                <View style={styles.rowBody}>
                  <View style={styles.topLine}>
                    <ThemedText type="smallBold" numberOfLines={1} style={styles.name}>
                      {conversation.peerName}
                    </ThemedText>
                    <ThemedText type="small" style={styles.subtle}>
                      {formatInboxTime(conversation.lastMessageAt)}
                    </ThemedText>
                  </View>
                  <View style={styles.bottomLine}>
                    <ThemedText
                      type="small"
                      numberOfLines={1}
                      style={[
                        styles.subtle,
                        conversation.unreadCount > 0 && { color: INK.name },
                      ]}
                    >
                      {conversation.snippet}
                    </ThemedText>
                    <CountBadge count={conversation.unreadCount} />
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView>
          <View style={styles.grabber} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(6, 6, 10, 0.5)',
  },
  sheet: {
    borderTopStartRadius: Radius.xlarge,
    borderTopEndRadius: Radius.xlarge,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
  },
  title: {
    color: INK.title,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    marginBottom: Spacing.two,
  },
  body: {
    gap: Spacing.two,
    paddingBottom: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  disc: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: INK.disc,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: {
    flex: 1,
    gap: 4,
  },
  topLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    color: INK.name,
    fontSize: 16,
    fontWeight: '600',
    flexShrink: 1,
  },
  subtle: {
    color: INK.subtle,
    marginLeft: 'auto',
  },
  snippet: {
    color: INK.subtle,
    flex: 1,
    marginLeft: 0,
  },
  bottomLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  stack: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: Spacing.one,
    borderRadius: Radius.pill,
    backgroundColor: INK.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stackLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  grabber: {
    alignSelf: 'center',
    width: 120,
    height: 4,
    borderRadius: 2,
    backgroundColor: INK.grabber,
    marginTop: Spacing.three,
  },
});
