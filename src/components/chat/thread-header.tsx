import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { countryFlag, formatElapsedLong } from '@/core/format';
import type { ConversationSummary } from '@/core/data/types';

import { ThemedText } from '../themed-text';
import { Avatar } from '../ui/avatar';
import { Divider } from '../ui/divider';
import { IconButton } from '../ui/icon-button';

export interface ThreadHeaderProps {
  conversation: ConversationSummary;
  onBack: () => void;
  onCall: () => void;
  onMore: () => void;
}

/**
 * The thread's bar: back, the peer with their own directory avatar, and two
 * affordances (voice call and chat options) that are backend-state only, so
 * both state that rather than pretending.
 *
 * Presence uses the same long-form age the profile header uses — "Active now"
 * or "59 minutes ago" — never an online dot that could imply live status the
 * data seam does not deliver.
 */
export function ThreadHeader({ conversation, onBack, onCall, onMore }: ThreadHeaderProps) {
  const flag = countryFlag(conversation.locale);
  const presence = conversation.isOnline
    ? 'Active now'
    : formatElapsedLong(conversation.lastMessageAt);

  return (
    <View>
      <View style={styles.bar}>
        <View style={styles.side}>
          <IconButton name="back" label="Go back" onPress={onBack} />
        </View>
        <View style={styles.identity}>
          <Avatar
            id={conversation.peerId}
            name={conversation.peerName}
            uri={conversation.avatarUrl}
            size={40}
            frame={conversation.avatarFrame}
            online={conversation.isOnline}
          />
          <View style={styles.copy}>
            <ThemedText accessibilityRole="header" numberOfLines={1} style={styles.name}>
              {conversation.peerName}
              {flag ? (
                <ThemedText type="small" accessible={false} style={styles.flag}>
                  {' '}
                  {flag}
                </ThemedText>
              ) : null}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
              {presence}
            </ThemedText>
          </View>
        </View>
        <View style={styles.side}>
          <IconButton name="phone" label="Voice call" onPress={onCall} />
          <IconButton name="more" label="Chat options" onPress={onMore} />
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
    gap: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingBottom: Spacing.two,
  },
  side: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  identity: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  copy: { flex: 1, minWidth: 0 },
  name: { fontSize: 17, lineHeight: 23, fontWeight: '700', flexShrink: 1 },
  flag: { fontSize: 12, lineHeight: 16 },
});
