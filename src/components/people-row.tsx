import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import type { UserSummary } from '@/core/data/types';
import { formatDistanceKm } from '@/core/format';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from './themed-text';
import { Avatar } from './ui/avatar';
import { UserBadges } from './user-badges';

/**
 * One person in a discovery directory (reference screens 097–100).
 *
 * The row is split into two sibling hit areas — opening the profile and sending
 * a greeting — rather than nesting one pressable inside another, so the
 * accessibility tree stays flat and both targets are unambiguous.
 */
export interface PeopleRowProps {
  user: UserSummary;
  onOpenProfile?: (userId: string) => void;
  onGreet?: (userId: string) => void;
}

export function PeopleRow({ user, onOpenProfile, onGreet }: PeopleRowProps) {
  const theme = useTheme();

  const meta = [
    user.locale,
    user.distanceKm === undefined ? null : formatDistanceKm(user.distanceKm),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${user.displayName}. ${user.status}`}
        onPress={() => onOpenProfile?.(user.id)}
        style={({ pressed }) => [styles.main, pressed && { opacity: 0.7 }]}
      >
        <Avatar
          id={user.id}
          name={user.displayName}
          uri={user.avatarUrl}
          size={48}
          online={user.isOnline}
        />
        <View style={styles.text}>
          <View style={styles.nameRow}>
            <ThemedText type="smallBold" numberOfLines={1} style={styles.name}>
              {user.displayName}
            </ThemedText>
            <UserBadges badges={user.badges} level={user.level} />
          </View>
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            {user.status}
          </ThemedText>
          {meta ? (
            <ThemedText
              type="small"
              themeColor="textSecondary"
              numberOfLines={1}
              style={styles.meta}
            >
              {meta}
            </ThemedText>
          ) : null}
        </View>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Say hi to ${user.displayName}`}
        onPress={() => onGreet?.(user.id)}
        hitSlop={6}
        style={({ pressed }) => [
          styles.greet,
          { backgroundColor: theme.accent, opacity: pressed ? 0.75 : 1 },
        ]}
      >
        <ThemedText type="small" style={[styles.greetLabel, { color: theme.onAccent }]}>
          HI
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  main: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  text: { flex: 1, gap: Spacing.half },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, flexWrap: 'wrap' },
  name: { flexShrink: 1 },
  meta: { fontSize: 12 },
  greet: {
    minWidth: 44,
    minHeight: 32,
    paddingHorizontal: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
  },
  greetLabel: { fontWeight: '800', fontSize: 12 },
});
