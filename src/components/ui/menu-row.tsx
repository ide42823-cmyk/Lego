import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing, TouchTarget } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

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
  /** Leading icon colour. Defaults to the brand violet. */
  iconColor?: string;
  /** Trailing text value. */
  value?: string;
  /** Draws `value` as a warning chip instead of plain text. */
  valueAttention?: boolean;
  /** Trailing counter. */
  badge?: number;
  /** Trailing short badge label, e.g. NEW. */
  tag?: string;
  /**
   * Draw a trailing chevron. On by default: a row usually leads somewhere. The
   * Me menu is a list of actions, so it turns this off.
   */
  chevron?: boolean;
  onPress?: () => void;
}

export function MenuRow({
  label,
  description,
  name,
  iconColor,
  value,
  valueAttention = false,
  badge,
  tag,
  chevron = true,
  onPress,
}: MenuRowProps) {
  const theme = useTheme();

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
          <Icon name={name} size={22} color={iconColor ?? theme.brand} />
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
      {value && valueAttention ? (
        <View
          style={[styles.attention, { backgroundColor: theme.backgroundElement }]}
          // The chip is part of the row's label; announcing it again would repeat
          // the value screen readers have already heard.
          aria-hidden
        >
          <Icon name="warning" size={12} color={theme.textSecondary} strokeWidth={2.2} />
          <ThemedText type="small" style={[styles.attentionValue, { color: theme.textSecondary }]}>
            {value}
          </ThemedText>
        </View>
      ) : null}
      {value && !valueAttention ? (
        <ThemedText type="small" themeColor="textSecondary">
          {value}
        </ThemedText>
      ) : null}
      {badge ? <CountBadge count={badge} /> : null}
      {chevron ? <Icon name="forward" size={18} color="#9A96A8" /> : null}
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
  attention: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Radius.pill,
  },
  attentionValue: { fontSize: 12, lineHeight: 16, fontWeight: '700' },
});
