import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Icon } from '../ui/icon';
import { IconButton } from '../ui/icon-button';

export interface ChatComposerProps {
  /** Fired by the send control. The composer never clears the draft itself.
   *  The send action owns the draft life cycle and, without a backend, never confirms. */
  onSend: (text: string) => void;
  onProfile: () => void;
  onPhoto: () => void;
  onGift: () => void;
  onCall: () => void;
  onEmoji: () => void;
}

/**
 * The chat's input, matching the reference's two rows: a pill field with a
 * round send control inside it, then a five-icon toolbar (profile, photo,
 * gift, call, emoji) spaced evenly beneath.
 *
 * Sending is deliberately not a client feature — nothing is appended to the
 * thread, no bubble is local-echoed, and no "delivered" state exists. The
 * composer only carries the draft; pressing send hands the text to the screen,
 * which states that sending is backend work. Because the draft is never
 * confirmed or discarded here, the field keeps it so the member does not lose
 * what they typed. The gift entry wears gold because it is a paid action; the
 * phone keeps its red in the reference — ours stays on text so it does not
 * read as an active-state control.
 */
export function ChatComposer({
  onSend,
  onProfile,
  onPhoto,
  onGift,
  onCall,
  onEmoji,
}: ChatComposerProps) {
  const theme = useTheme();
  const [draft, setDraft] = useState('');
  const armed = draft.trim().length > 0;

  const commit = () => {
    onSend(draft);
  };

  return (
    <View
      style={[styles.wrap, { backgroundColor: theme.background }]}
      accessibilityLabel="Write a message"
    >
      <View style={[styles.field, { backgroundColor: theme.backgroundElement }]}>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder="Say something"
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
          accessibilityLabel="Send"
          accessibilityHint="States whether sending is available yet"
          onPress={commit}
          style={({ pressed }) => [
            styles.send,
            { backgroundColor: armed ? theme.brand : theme.border },
            pressed && { opacity: 0.8 },
          ]}
        >
          <Icon
            name="send"
            size={18}
            strokeWidth={2.2}
            color={armed ? theme.onBrand : theme.background}
          />
        </Pressable>
      </View>
      <View style={styles.toolbar}>
        <IconButton name="account" label="Open profile" onPress={onProfile} size={24} />
        <IconButton name="image" label="Send a photo" onPress={onPhoto} size={24} />
        <IconButton
          name="gift"
          label="Send a gift"
          onPress={onGift}
          size={24}
          tone="gold"
          fill={theme.gold}
        />
        <IconButton name="phone" label="Voice call" onPress={onCall} size={24} />
        <IconButton name="smile" label="Pick an emoji" onPress={onEmoji} size={24} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: Spacing.two,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.one,
    borderRadius: Radius.large,
    marginHorizontal: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.half,
    paddingBottom: Spacing.half,
    minHeight: 44,
  },
  input: { flex: 1, fontSize: 16, lineHeight: 22 },
  send: {
    width: 34,
    height: 34,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingTop: Spacing.one,
    paddingBottom: Spacing.one,
  },
});
