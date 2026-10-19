import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { AppButton } from '../ui/app-button';
import { Icon, type IconName } from '../ui/icon';

export interface ProfileActionBarProps {
  name: string;
  /** The greeting has been confirmed. A client never sets this on its own. */
  greeted: boolean;
  /** A greeting request is in flight. */
  greeting?: boolean;
  onCall: () => void;
  onMessage: () => void;
  onGreet: () => void;
}

/** A circular icon action. Muted fill, so the greeting stays the loudest control. */
function RoundAction({
  name,
  label,
  onPress,
}: {
  name: IconName;
  label: string;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.round,
        { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <Icon name={name} size={22} color={theme.text} />
    </Pressable>
  );
}

/**
 * The persistent contact bar (reference screens 001, 024–027).
 *
 * Sticky by design: the reference keeps call, message and greet reachable at
 * every scroll offset, so a visitor never has to scroll back to the top to make
 * contact.
 */
export function ProfileActionBar({
  name,
  greeted,
  greeting = false,
  onCall,
  onMessage,
  onGreet,
}: ProfileActionBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
          paddingBottom: insets.bottom + Spacing.two,
        },
      ]}
    >
      <RoundAction name="phone" label={`Call ${name}`} onPress={onCall} />
      <RoundAction name="messages" label={`Message ${name}`} onPress={onMessage} />
      <AppButton
        label={greeted ? 'Greeted' : 'Say hi'}
        accessibilityLabel={greeted ? `Greeted ${name}` : `Say hi to ${name}`}
        variant="accent"
        size="large"
        loading={greeting}
        disabled={greeted}
        onPress={onGreet}
        style={styles.greet}
        leading={
          <Icon
            name={greeted ? 'check' : 'greeting'}
            size={18}
            strokeWidth={2.4}
            color={theme.onAccent}
            fill={greeted ? 'none' : theme.onAccent}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  round: {
    width: 52,
    height: 52,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greet: { flex: 1 },
});
