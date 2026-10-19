import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { CardShadow, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useTints } from '@/hooks/use-tints';

import { ThemedText } from '../themed-text';

export interface FilterChipItem<T extends string> {
  key: T;
  label: string;
  /** Optional trailing count, e.g. Unread (3). */
  count?: number;
}

export interface FilterChipsProps<T extends string> {
  items: readonly FilterChipItem<T>[];
  value: T;
  onChange: (key: T) => void;
  /** Accessible grouping name, e.g. "Conversation filters". */
  label: string;
}

/**
 * A secondary filter row (All / Online / Most Chatted / Unread). Distinct from
 * `SegmentedTabs`: filters refine the current list, they do not change the
 * screen's primary mode.
 *
 * Selection is shown by an elevated white chip, matching the reference, so the
 * row reads as a set of physical tabs rather than coloured buttons.
 */
export function FilterChips<T extends string>({
  items,
  value,
  onChange,
  label,
}: FilterChipsProps<T>) {
  const theme = useTheme();
  const tints = useTints();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      accessibilityLabel={label}
    >
      {items.map((item) => {
        const selected = item.key === value;
        const text = item.count === undefined ? item.label : `${item.label} (${item.count})`;

        return (
          <Pressable
            key={item.key}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={text}
            onPress={() => onChange(item.key)}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: selected ? theme.surface : theme.backgroundElement,
                opacity: pressed ? 0.7 : 1,
              },
              selected && { ...CardShadow, shadowColor: tints.cardShadow },
            ]}
          >
            <ThemedText
              type="small"
              style={{
                color: selected ? theme.text : theme.textSecondary,
                fontWeight: selected ? '700' : '600',
              }}
            >
              {text}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.two, paddingVertical: Spacing.one },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
  },
});
