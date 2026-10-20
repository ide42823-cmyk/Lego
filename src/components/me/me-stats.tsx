import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { MeDashboard } from '@/core/data/types';
import { formatCompactCount } from '@/core/format';

export interface MeStatsProps {
  me: MeDashboard;
}

/**
 * Following / Friends / Followers.
 *
 * These are counts of relationships, never permissions, so they render as plain
 * text rather than as links. Screen readers get "Friends: 42" in one utterance
 * instead of a number followed by a label.
 */
export function MeStats({ me }: MeStatsProps) {
  const metrics = [
    { key: 'following', label: 'Following', value: me.followingCount },
    { key: 'friends', label: 'Friends', value: me.friendCount },
    { key: 'followers', label: 'Followers', value: me.followersCount },
  ];

  return (
    <View style={styles.root}>
      {metrics.map((metric) => (
        <View
          key={metric.key}
          style={styles.metric}
          accessibilityRole="text"
          accessibilityLabel={`${metric.label}: ${metric.value}`}
        >
          <ThemedText style={styles.value}>{formatCompactCount(metric.value)}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {metric.label}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    gap: Spacing.three,
    paddingVertical: Spacing.four,
  },
  metric: { flex: 1, alignItems: 'center', gap: Spacing.half },
  value: { fontSize: 21, lineHeight: 28, fontWeight: '800' },
});
