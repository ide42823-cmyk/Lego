import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Icon } from '../ui/icon';

export interface ChatComposerProps {
  /** Fired by the send control. The composer never clears the draft itself: */
  /** the send action owns the draft life cycle and, without a backend, never confirms. */
  onSend: (text: string) => void;
  onPickEmoji: () => void;
}

/**
 * The chat's input row: a pill field with an emoji affordance and one round
 * send control.
 *
 * Sending is deliberately not a client feature — nothing is appended to the
 * thread, no bubble is local-echoed, and no "delivered" state exists. The
 * composer only carries the draft; pressing send hands the text to the screen,
 * which states that sending is backend work. Because the draft is never
 * confirmed or discarded here, the field keeps it so the member does not lose
 * what they typed.
 */
export function ChatComposer({ onSend, onPickEmoji }: ChatComposerProps) {
  const theme = useTheme();
  const [draft, setDraft] = useState('');

  const commit = () => {
    onSend(draft);
  };

  return (
    <View
      style={[styles.row, { backgroundColor: theme.background }]}
      accessibilityLabel="Write a message"
    >
      <View style={[styles.field, { backgroundColor: theme.backgroundElement }]}>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder="Write a message"
          placeholderTextColor={theme.textSecondary}
          accessibilityLabel="Message draft"
          value={draft}
          onChangeText={setDraft}
          multiline
          maxLength={500}
          returnKeyType="send"
          onSubmitEditing={commit}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Pick an emoji"
          hitSlop={6}
          onPress={onPickEmoji}
          style={({ pressed }) => [styles.emoji, pressed && { opacity: 0.7 }]}
        >
          <Icon name="smile" size={22} strokeWidth={2} color={theme.textSecondary} />
        </Pressable>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Send"
        accessibilityHint="States whether sending is available yet"
        onPress={commit}
        style={({ pressed }) => [
          styles.send,
          { backgroundColor: theme.brand },
          pressed && { opacity: 0.8 },
        ]}
      >
        <Icon name="send" size={21} strokeWidth={2.2} color={theme.onBrand} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  field: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.one,
    borderRadius: Radius.large,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.one,
    paddingBottom: Spacing.half,
    minHeight: 44,
  },
  input: { flex: 1, fontSize: 16, lineHeight: 22 },
  emoji: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  send: {
    width: 46,
    height: 46,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
