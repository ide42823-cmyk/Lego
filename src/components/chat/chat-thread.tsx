import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { formatClusterStamp } from '@/core/format';
import type { ChatMessage, ConversationThread } from '@/core/data/types';
import { useTheme } from '@/hooks/use-theme';

import { Avatar } from '../ui/avatar';
import { Icon } from '../ui/icon';
import { ThemedText } from '../themed-text';
import { ChatBubble } from './chat-bubble';

const STAMP_GAP_MS = 10 * 60 * 1000;

export interface ChatThreadProps {
  thread: ConversationThread;
  /** The translation affordance on the peer's rows; the client never translates. */
  onTranslate: () => void;
}

/**
 * The thread's scroll body, matching the reference's anatomy: an absolute
 * `2026/10/17 17:20` stamp above every cluster that follows a ten-minute lull,
 * the peer's rows on the ornamented square with their avatar in front and the
 * translate affordance behind, the viewer's rows carrying the seam-confirmed
 * check and their own avatar.
 *
 * The check is history, not delivery: those bubbles are confirmed facts the
 * data seam already owns, like the like-counts elsewhere in the fixtures. A
 * bubble composed here gets no check, because sending is backend work — and a
 * `milestone` strip belongs to nobody, so it draws centred and bare.
 */
export function ChatThread({ thread, onTranslate }: ChatThreadProps) {
  const theme = useTheme();
  const { conversation, messages } = thread;

  return (
    <View style={styles.body}>
      {messages.map((message, index) => {
        const previous = index > 0 ? (messages[index - 1] as ChatMessage) : undefined;
        const mine = message.authorId !== '' && message.authorId !== conversation.peerId;
        const newCluster =
          !previous ||
          new Date(message.sentAt).getTime() - new Date(previous.sentAt).getTime() >= STAMP_GAP_MS;
        const header = newCluster && previous ? <ClusterStamp sentAt={message.sentAt} /> : null;

        if (message.kind === 'milestone') {
          return (
            <View key={message.id}>
              {header}
              <View style={[styles.strip, { backgroundColor: theme.backgroundElement }]}>
                <ThemedText type="small" themeColor="textSecondary" style={styles.stripText}>
                  {message.text}
                </ThemedText>
              </View>
            </View>
          );
        }

        return (
          <View key={message.id}>
            {header}
            {mine ? (
              <View style={[styles.row, styles.rowMine]}>
                <View style={[styles.check, { backgroundColor: theme.success }]}>
                  {/* Decorative: the accessible sentence is on the bubble. */}
                  <Icon name="check" size={11} strokeWidth={3.4} color="#FFFFFF" />
                </View>
                <ChatBubble message={message} mine peerName={conversation.peerName} />
                <Avatar
                  id={conversation.peerId}
                  name="You"
                  uri={thread.viewer.avatarUrl}
                  size={40}
                  frame={thread.viewer.avatarFrame}
                />
              </View>
            ) : (
              <View style={[styles.row, styles.rowTheirs]}>
                <Avatar
                  id={conversation.peerId}
                  name={conversation.peerName}
                  uri={conversation.avatarUrl}
                  size={40}
                  frame={conversation.avatarFrame}
                />
                <ChatBubble message={message} mine={false} peerName={conversation.peerName} ornamented />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Translate this message"
                  onPress={onTranslate}
                  style={({ pressed }) => [
                    styles.translate,
                    { borderColor: theme.border },
                    pressed && { opacity: 0.6 },
                  ]}
                >
                  <Icon name="sparkle" size={13} strokeWidth={2} color={theme.textSecondary} />
                </Pressable>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

/** The centred `2026/10/17 17:20` strip above a cluster. */
function ClusterStamp({ sentAt }: { sentAt: string }) {
  const label = formatClusterStamp(sentAt);

  return (
    <ThemedText
      type="small"
      themeColor="textSecondary"
      style={styles.stamp}
      accessibilityLabel={`Messages from ${label}`}
    >
      {label}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  body: { gap: Spacing.two, paddingHorizontal: Spacing.three, paddingVertical: Spacing.three },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.two },
  rowMine: { alignSelf: 'flex-end' },
  rowTheirs: { alignSelf: 'flex-start' },
  check: {
    width: 18,
    height: 18,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  translate: {
    width: 26,
    height: 26,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  stamp: { textAlign: 'center', marginTop: Spacing.two, marginBottom: Spacing.half },
  strip: {
    alignSelf: 'center',
    maxWidth: '94%',
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  stripText: { textAlign: 'center' },
});
