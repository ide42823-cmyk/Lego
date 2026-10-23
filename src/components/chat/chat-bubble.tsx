import { StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import type { ChatMessage } from '@/core/data/types';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from '../themed-text';

export interface ChatBubbleProps {
  message: ChatMessage;
  /** True for the viewer's own bubble. A strict two-party thread has no other authors. */
  mine: boolean;
  peerName: string;
  /** Clock caption printed beneath the cluster's last bubble, ISO-formatted by the caller. */
  time?: string;
}

/**
 * One text bubble. Text only on purpose: media, voice and gift messages are
 * server-phase, and a client fixture for them would imply features the
 * backend has to meter.
 *
 * Outgoing bubbles answer the incoming ones on the brand fill, the way the
 * app's accent languages (Hi, Explore) already answer violet-on-light. Bubbles
 * are not pressable: there is no delivery, copy or reaction state to imply.
 */
export function ChatBubble({ message, mine, peerName, time }: ChatBubbleProps) {
  const theme = useTheme();

  return (
    <View style={[styles.row, mine ? styles.rowMine : styles.rowTheirs]}>
      <View
        accessible
        accessibilityLabel={`${mine ? 'You' : peerName}: ${message.text}${time ? `. ${time}` : ''}`}
        style={[
          styles.bubble,
          {
            maxWidth: '82%',
            backgroundColor: mine ? theme.brand : theme.backgroundElement,
            borderTopEndRadius: mine ? Radius.small : Radius.large,
            borderTopStartRadius: mine ? Radius.large : Radius.small,
          },
        ]}
      >
        <ThemedText type="default" style={{ color: mine ? theme.onBrand : theme.text }} selectable>
          {message.text}
        </ThemedText>
      </View>
      {time ? (
        <ThemedText
          type="small"
          themeColor="textSecondary"
          style={[styles.time, mine ? styles.rowMine : styles.rowTheirs]}
        >
          {time}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'flex-end', gap: Spacing.half },
  rowMine: { alignItems: 'flex-end' },
  rowTheirs: { alignItems: 'flex-start' },
  bubble: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.large,
  },
  time: { marginHorizontal: Spacing.two },
});
