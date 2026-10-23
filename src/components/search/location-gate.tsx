import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from '../themed-text';
import { Icon } from '../ui/icon';

export interface LocationGateProps {
  /** Fired by the enable control. The client never reads a position itself. */
  onEnable: () => void;
  /** Fired by the settings link from the privacy note. */
  onOpenSettings: () => void;
}

/**
 * The people tab's location ask, which is how the reference's search landing
 * opens: a quiet map pin, one line of explanation, a full-width enable pill
 * and a privacy note that spells out where sharing can be turned off.
 *
 * The client here never measures position — distance stays a data-layer bucket
 * — and the enable control is a fixture affordance: the real permission prompt
 * is backend-phase work, so the screen promises nothing and the toast says so.
 * Copy is our own; the shape is a generic pin, not the reference's artwork.
 */
export function LocationGate({ onEnable, onOpenSettings }: LocationGateProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.pinWrap}>
        <Icon name="address" size={92} strokeWidth={1.6} color={theme.border} />
        <View style={[styles.pinBase, { backgroundColor: theme.border }]} />
      </View>

      <ThemedText themeColor="textSecondary" numberOfLines={1} style={styles.line}>
        Turn on location to see more people nearby
      </ThemedText>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Enable Now"
        onPress={onEnable}
        style={({ pressed }) => [
          styles.enable,
          { backgroundColor: pressed ? theme.brandPressed : theme.brand },
          pressed && { opacity: 0.9 },
        ]}
      >
        <ThemedText style={styles.enableLabel}>Enable Now</ThemedText>
      </Pressable>

      <ThemedText type="small" themeColor="textSecondary" style={styles.note}>
        Location only sorts the list; it is never a position. You can stop sharing at any time from
        Me › Privacy.
      </ThemedText>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel="Go to settings"
        hitSlop={6}
        onPress={onOpenSettings}
        style={({ pressed }) => [styles.settings, pressed && { opacity: 0.7 }]}
      >
        <ThemedText type="small" style={[styles.settingsLabel, { color: theme.brand }]}>
          Go to settings
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: Spacing.two, paddingTop: Spacing.six },
  pinWrap: { alignItems: 'center' },
  // The pin sits on a soft ellipse the way the reference's illustration does.
  pinBase: {
    width: 84,
    height: 9,
    marginTop: -14,
    borderRadius: Radius.pill,
    opacity: 0.4,
  },
  line: { fontSize: 15, lineHeight: 20 },
  enable: {
    alignSelf: 'stretch',
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.four,
    borderRadius: Radius.pill,
  },
  enableLabel: { fontSize: 16, lineHeight: 21, fontWeight: '800' },
  note: {
    textAlign: 'center',
    marginTop: Spacing.three,
    marginBottom: -Spacing.two,
  },
  settings: { minHeight: 44, justifyContent: 'center', paddingHorizontal: Spacing.two },
  settingsLabel: { textDecorationLine: 'underline', fontWeight: '600' },
});
