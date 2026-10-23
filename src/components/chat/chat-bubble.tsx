import { StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import type { ChatMessage } from '@/core/data/types';
import { useTheme } from '@/hooks/use-theme';

import { Icon } from '../ui/icon';
import { ThemedText } from '../themed-text';

export interface ChatBubbleProps {
  message: ChatMessage;
  /** True for the viewer's own bubble. A strict two-party thread has no other authors. */
  mine: boolean;
  peerName: string;
  /** The peer's follow/relationship notice draws the ornamented square shape. */
  ornamented?: boolean;
}

/**
 * One bubble's box. Both sides carry the brand fill, the way the reference
 * reads: incoming rows are the ornamented squares the reference draws for its
 * relationship notices and replies, the viewer's are the softer rounded
 * shapes. Bubbles are not pressable — there is no reaction or copy state to
 * imply — and the author is spoken as words in the label, never a dot.
 */
export function ChatBubble({ message, mine, peerName, ornamented = false }: ChatBubbleProps) {
  const theme = useTheme();

  return (
    <View
      accessible
      accessibilityLabel={`${mine ? 'You' : peerName}: ${message.text}`}
      style={[
        styles.bubble,
        ornamented ? styles.ornamented : null,
        { backgroundColor: theme.brand },
      ]}
    >
      {ornamented ? (
        <>
          {(['topStart', 'topEnd', 'bottomStart', 'bottomEnd'] as const).map((corner) => (
            <View key={corner} style={[styles.ornament, styles[corner]]}>
              <Icon
                name="sparkle"
                size={15}
                strokeWidth={2}
                fill="rgba(255, 255, 255, 0.45)"
                color="rgba(255, 255, 255, 0.45)"
              />
            </View>
          ))}
        </>
      ) : null}
      <ThemedText type="default" style={{ color: theme.onBrand }} selectable>
        {message.text}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    // 82% keeps the author's avatar and the action glyph on screen beside it.
    maxWidth: '78%',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.large,
  },
  ornamented: { borderRadius: Radius.small },
  ornament: { position: 'absolute', opacity: 0.55 },
  topStart: { top: -6, start: -5 },
  topEnd: { top: -6, end: -5 },
  bottomStart: { bottom: -6, start: -5 },
  bottomEnd: { bottom: -6, end: -5 },
});
