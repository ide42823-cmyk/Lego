import { Pressable, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import type { ConversationSummary } from '@/core/data/types';
import { countryFlag, formatRelativeTime } from '@/core/format';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from './themed-text';
import { Avatar } from './ui/avatar';
import { CountBadge } from './ui/badge';

/**
 * One inbox entry (reference screen 082).
 *
 * Flat rather than a card, matching the reference: the inbox is a dense list,
 * so rows separate with spacing instead of adding 14 elevated surfaces.
 *
 * The accessible name carries the unread count as words — a bare red dot is
 * invisible to assistive technology.
 */
export interface ConversationRowProps {
  conversation: ConversationSummary;
  onPress?: (conversationId: string) => void;
}

export function ConversationRow({ conversation, onPress }: ConversationRowProps) {
  const theme = useTheme();
  const time = formatRelativeTime(conversation.lastMessageAt);
  const unread = conversation.unreadCount > 0;
  const flag = countryFlag(conversation.locale);

  const accessibilityLabel = [
    conversation.peerName,
    unread ? `${conversation.unreadCount} unread` : 'no unread messages',
    conversation.snippet,
    time,
  ].join('. ');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={() => onPress?.(conversation.id)}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
    >
      <Avatar
        id={conversation.peerId}
        name={conversation.peerName}
        uri={conversation.avatarUrl}
        size={56}
        online={conversation.isOnline}
      />
      <View style={styles.body}>
        <View style={styles.topLine}>
          <ThemedText type="smallBold" numberOfLines={1} style={styles.name}>
            {conversation.peerName}
          </ThemedText>
          {flag ? (
            <ThemedText type="small" accessible={false}>
              {flag}
            </ThemedText>
          ) : null}
          <ThemedText type="small" themeColor="textSecondary">
            {time}
          </ThemedText>
        </View>
        <View style={styles.bottomLine}>
          <ThemedText
            type="small"
            themeColor="textSecondary"
            numberOfLines={1}
            style={[styles.snippet, unread && { color: theme.text }]}
          >
            {conversation.snippet}
          </ThemedText>
          <CountBadge count={conversation.unreadCount} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
  },
  body: { flex: 1, gap: Spacing.one },
  topLine: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  bottomLine: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  name: { flex: 1 },
  snippet: { flex: 1 },
});
