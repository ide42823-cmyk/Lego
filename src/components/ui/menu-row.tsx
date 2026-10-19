import { Pressable, StyleSheet, View } from 'react-native';

import { Spacing, TouchTarget } from '@/constants/theme';

import { ThemedText } from '../themed-text';
import { Badge, CountBadge } from './badge';
import { Icon, type IconName } from './icon';

/**
 * A standard navigational row (account tools, settings, feature directories).
 *
 * The trailing value/badge is part of the label rather than a separate node, so
 * screen readers announce "My Level, 12" instead of just "My Level".
 */
export interface MenuRowProps {
  label: string;
  /** Short description under the label. */
  description?: string;
  /** Leading icon; decorative. */
  name?: IconName;
  /** Trailing text value. */
  value?: string;
  /** Trailing counter. */
  badge?: number;
  /** Trailing short badge label, e.g. NEW. */
  tag?: string;
  onPress?: () => void;
}

export function MenuRow({ label, description, name, value, badge, tag, onPress }: MenuRowProps) {
  const accessibleLabel = [label, description, value, badge ? `${badge} unread` : null]
    .filter(Boolean)
    .join('. ');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibleLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}
    >
      {name ? (
        <View style={styles.iconSlot}>
          <Icon name={name} size={22} color="#7C4DF0" />
        </View>
      ) : null}
      <View style={styles.copy}>
        <ThemedText type="default" numberOfLines={1}>
          {label}
        </ThemedText>
        {description ? (
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            {description}
          </ThemedText>
        ) : null}
      </View>
      {tag ? <Badge tone="new" label={tag} /> : null}
      {value ? (
        <ThemedText type="small" themeColor="textSecondary">
          {value}
        </ThemedText>
      ) : null}
      {badge ? <CountBadge count={badge} /> : null}
      <Icon name="forward" size={18} color="#9A96A8" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    minHeight: TouchTarget,
    paddingVertical: Spacing.two,
  },
  iconSlot: { width: 26, alignItems: 'center' },
  copy: { flex: 1, gap: Spacing.half },
});
