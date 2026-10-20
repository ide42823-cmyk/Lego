import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { FramedAvatar } from '@/components/ui/framed-avatar';
import { Icon } from '@/components/ui/icon';
import { Radius, Spacing } from '@/constants/theme';
import type { MeDashboard } from '@/core/data/types';
import { useTheme } from '@/hooks/use-theme';

export interface MeHeaderProps {
  me: MeDashboard;
  onPress: () => void;
}

/**
 * The account strip: photo, name, the "view or edit" affordance, and the
 * attention dot that tells the user something on this screen is waiting.
 *
 * The dot lives at the *end* of the row rather than beside the name, as in the
 * reference: it belongs to the whole account, not to the name.
 */
export function MeHeader({ me, onPress }: MeHeaderProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${me.displayName}. View or edit profile`}
      accessibilityHint={
        me.notificationCount > 0 ? `${me.notificationCount} things need attention` : undefined
      }
      onPress={onPress}
      style={({ pressed }) => [styles.root, pressed && styles.pressed]}
    >
      <FramedAvatar
        id={me.userId}
        name={me.displayName}
        size={92}
        uri={me.avatarUrl}
        frame={me.avatarFrame}
      />
      <View style={styles.copy}>
        <View style={styles.nameRow}>
          <ThemedText numberOfLines={1} style={styles.name}>
            {me.displayName}
          </ThemedText>
          {/* A quiet "beloved" mark beside the name, as in the reference. */}
          <Icon name="greeting" size={15} color={theme.textSecondary} strokeWidth={2.2} />
        </View>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
          View or edit profile
        </ThemedText>
      </View>
      <View style={styles.trailing}>
        {me.notificationCount > 0 ? (
          <View style={[styles.dot, { backgroundColor: theme.danger }]} />
        ) : null}
        <Icon name="forward" size={20} color={theme.textSecondary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  pressed: { opacity: 0.7 },
  copy: { flex: 1, gap: Spacing.one },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  name: { flexShrink: 1, fontSize: 22, lineHeight: 28, fontWeight: '800' },
  trailing: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  dot: { width: 9, height: 9, borderRadius: Radius.pill },
});
