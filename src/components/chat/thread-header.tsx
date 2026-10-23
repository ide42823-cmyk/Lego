import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { countryFlag } from '@/core/format';
import type { ConversationSummary } from '@/core/data/types';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from '../themed-text';
import { Avatar } from '../ui/avatar';
import { Divider } from '../ui/divider';
import { IconButton } from '../ui/icon-button';

export interface ThreadHeaderProps {
  conversation: ConversationSummary;
  onBack: () => void;
  onOpenProfile: () => void;
}

/**
 * The thread's bar, matching the reference: back, the unread total as a small
 * pill, the peer's name centred, and their avatar at the end (a tap into the
 * public profile — the one identity action this screen owns).
 *
 * Deliberately no voice-call or options affordances here: in the reference's
 * anatomy those live on the composer's toolbar, where they can state that
 * calls and wallpapers are backend work.
 */
export function ThreadHeader({ conversation, onBack, onOpenProfile }: ThreadHeaderProps) {
  const theme = useTheme();
  const flag = countryFlag(conversation.locale);
  const unread = conversation.unreadCount;
  const unreadLabel = unread > 99 ? '99+' : `${unread}`;

  return (
    <View>
      <View style={styles.bar}>
        <View style={styles.side}>
          <IconButton name="back" label="Go back" onPress={onBack} />
          {unread > 0 ? (
            <View
              accessible
              accessibilityLabel={`${unread} unread messages`}
              style={[styles.unread, { backgroundColor: theme.backgroundElement }]}
            >
              <ThemedText type="small" style={styles.unreadText}>
                {unreadLabel}
              </ThemedText>
            </View>
          ) : null}
        </View>
        <ThemedText
          accessibilityRole="header"
          numberOfLines={1}
          style={styles.name}
        >
          {conversation.peerName}
          {flag ? (
            <ThemedText type="small" accessible={false} style={styles.flag}>
              {' '}
              {flag}
            </ThemedText>
          ) : null}
        </ThemedText>
        <View style={styles.side}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open ${conversation.peerName}'s profile`}
            onPress={onOpenProfile}
            style={({ pressed }) => [styles.avatarHit, pressed && { opacity: 0.8 }]}
          >
            <Avatar
              id={conversation.peerId}
              name={conversation.peerName}
              uri={conversation.avatarUrl}
              size={36}
              frame={conversation.avatarFrame}
              online={conversation.isOnline}
            />
          </Pressable>
        </View>
      </View>
      <Divider />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingBottom: Spacing.two,
  },
  side: { flexDirection: 'row', alignItems: 'center', gap: Spacing.half, minWidth: 96 },
  name: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '700',
  },
  flag: { fontSize: 12, lineHeight: 16 },
  unread: {
    minWidth: 30,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.one,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  unreadText: { fontSize: 11, lineHeight: 14, fontWeight: '700' },
  avatarHit: { borderRadius: Radius.pill },
});
