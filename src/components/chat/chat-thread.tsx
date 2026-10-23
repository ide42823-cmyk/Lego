import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { formatDayDivider, formatInboxTime } from '@/core/format';
import type { ChatMessage, ConversationSummary } from '@/core/data/types';

import { ThemedText } from '../themed-text';
import { ChatBubble } from './chat-bubble';

export interface ChatThreadProps {
  conversation: ConversationSummary;
  /** oldest first, exactly as the seam returns them. */
  messages: ChatMessage[];
}

/**
 * The thread's scroll body: day dividers between bubble clusters, a clock
 * caption under the last bubble of each cluster, and nothing else — no read
 * receipts or delivery ticks, because neither state is client-owned.
 *
 * A strict two-party conversation lets `authorId !== peerId` mean "mine"
 * without the screen needing the viewer's identity at all.
 */
export function ChatThread({ conversation, messages }: ChatThreadProps) {
  return (
    <View style={styles.body}>
      {messages.map((message, index) => {
        const previous = index > 0 ? (messages[index - 1] as ChatMessage) : undefined;
        const next = index < messages.length - 1 ? (messages[index + 1] as ChatMessage) : undefined;
        const newDay =
          !previous || formatDayDivider(previous.sentAt) !== formatDayDivider(message.sentAt);
        // The clock rides the bubble that closes its cluster: the last one an
        // author sent before the turn changes or the day rolls over.
        const mine = message.authorId !== conversation.peerId;
        const nextIsMine = next ? next.authorId !== conversation.peerId : mine;
        const nextNewDay = next
          ? formatDayDivider(next.sentAt) !== formatDayDivider(message.sentAt)
          : true;
        const showTime = !next || nextIsMine !== mine || nextNewDay;

        return (
          <View key={message.id}>
            {newDay ? (
              <ThemedText
                type="small"
                themeColor="textSecondary"
                style={styles.divider}
                accessibilityLabel={`Messages from ${formatDayDivider(message.sentAt)}`}
              >
                {formatDayDivider(message.sentAt)}
              </ThemedText>
            ) : null}
            <ChatBubble
              message={message}
              mine={mine}
              peerName={conversation.peerName}
              time={showTime ? formatInboxTime(message.sentAt) : undefined}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  body: { gap: Spacing.two, paddingHorizontal: Spacing.three, paddingVertical: Spacing.three },
  divider: {
    textAlign: 'center',
    marginTop: Spacing.three,
    marginBottom: Spacing.one,
  },
});
