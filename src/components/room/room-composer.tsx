import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { RoomPalette, Spacing } from '@/constants/theme';

import { Icon } from '../ui/icon';
import { IconButton } from '../ui/icon-button';
import { ThemedText } from '../themed-text';

export interface RoomComposerProps {
  /** Hands the draft out; the composer never clears it (no echo, no confirm). */
  onSend: (text: string) => void;
  /** The chat-list bubble entry. */
  onChatList: () => void;
  /** The apps-grid entry. */
  onApps: () => void;
  /** The gift entry — gold. */
  onGift: () => void;
  /** Unread badge value on the chat bubble entry; hidden when zero. */
  unreadCount: number;
}

/**
 * The room's bottom bar, matching the reference row: a light pill field with
 * a pencil, then the chat bubble with its unread badge, then a gold gift
 * bag. Round-room messages send nowhere yet, exactly like the thread
 * composer: the draft is kept, pressing the field's send states the gate.
 */
export function RoomComposer({ onSend, onChatList, onApps, onGift, unreadCount }: RoomComposerProps) {
  const [draft, setDraft] = useState('');

  const commit = () => {
    onSend(draft);
  };

  return (
    <View style={styles.wrap} accessibilityLabel="Discuss in the room">
      <View style={styles.field}>
        <Icon name="pencil" size={17} color={RoomPalette.textMuted} />
        <TextInput
          style={styles.input}
          placeholder="Say something"
          placeholderTextColor={RoomPalette.textMuted}
          accessibilityLabel="Room message draft"
          value={draft}
          onChangeText={setDraft}
          multiline
          maxLength={280}
          returnKeyType="send"
          onSubmitEditing={commit}
        />
        {draft.trim().length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send"
            accessibilityHint="States whether sending is available yet"
            onPress={commit}
            hitSlop={8}
          >
            <Icon name="send" size={18} color={RoomPalette.selection} />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.bubble}>
        <IconButton name="comment" label="Open the room chat" onPress={onChatList} size={22} />
        {unreadCount > 0 ? (
          <View style={[styles.badge, unreadCount >= 99 && styles.badgeWide]}>
            <ThemedText type="small" style={styles.badgeText}>
              {unreadCount >= 99 ? '99+' : unreadCount}
            </ThemedText>
          </View>
        ) : null}
      </View>
      <IconButton name="apps" label="Room utilities" onPress={onApps} size={22} />
      <IconButton
        name="gift"
        label="Send a gift"
        onPress={onGift}
        size={24}
        tone="gold"
        fill={RoomPalette.gold}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minHeight: 56,
    justifyContent: 'space-between',
  },
  field: {
    // The reference's pill is the lightest element on the dark canvas; a
    // near-white fill keeps it legible over any room art.
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
    backgroundColor: 'rgba(244, 244, 248, 0.92)',
    borderRadius: 22,
    paddingHorizontal: Spacing.three,
    height: 44,
  },
  input: {
    flex: 1,
    maxHeight: 96,
  },
  bubble: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    end: -6,
    minWidth: 22,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E11D48',
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeWide: {
    minWidth: 30,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    lineHeight: 12,
    fontWeight: 800,
  },
});
