import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from '../themed-text';

export interface SegmentedTabItem<T extends string> {
  key: T;
  label: string;
}

export interface SegmentedTabsProps<T extends string> {
  items: readonly SegmentedTabItem<T>[];
  value: T;
  onChange: (key: T) => void;
  /** Accessible grouping name, e.g. "People discovery views". */
  label: string;
  /**
   * `underline` matches the directory-style headers (a bold label with a short
   * curved rule beneath it); `bar` is the full-width straight rule used by the
   * profile's section strip; `pill` is for compact inline switches.
   */
  variant?: 'underline' | 'bar' | 'pill';
}

/**
 * Top-level segmented navigation. Scrolls horizontally because Arabic and Latin
 * labels vary a lot in width.
 *
 * The underline variant deliberately does not mark the selected item with
 * colour alone: the label also gains weight, which is what carries the state
 * for anyone who cannot distinguish the two greys.
 */
export function SegmentedTabs<T extends string>({
  items,
  value,
  onChange,
  label,
  variant = 'underline',
}: SegmentedTabsProps<T>) {
  const theme = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      accessibilityRole="tablist"
      accessibilityLabel={label}
    >
      {items.map((item) => {
        const selected = item.key === value;
        return (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={item.label}
            onPress={() => onChange(item.key)}
            style={({ pressed }) => [
              styles.item,
              variant === 'pill' && [
                styles.pill,
                {
                  backgroundColor: selected ? theme.brand : theme.backgroundElement,
                },
              ],
              pressed && { opacity: 0.7 },
            ]}
          >
            <ThemedText
              type={selected ? 'smallBold' : 'small'}
              style={
                variant === 'pill'
                  ? {
                      color: selected ? theme.onBrand : theme.textSecondary,
                      fontWeight: selected ? '700' : '600',
                    }
                  : [
                      styles.tabLabel,
                      {
                        color: selected ? theme.text : theme.textSecondary,
                        fontWeight: selected ? '800' : '600',
                      },
                    ]
              }
            >
              {item.label}
            </ThemedText>
            {variant === 'pill' ? null : (
              <View
                style={[
                  variant === 'bar' ? styles.bar : styles.underline,
                  { borderBottomColor: selected ? theme.text : 'transparent' },
                ]}
              />
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    // Tight on purpose: the mode row shares the width with the header's action
    // controls, so the gap is what decides whether a whole tab or half a word
    // sits at the edge before the row scrolls.
    gap: Spacing.three,
    paddingVertical: Spacing.one,
  },
  item: { paddingBottom: Spacing.one, alignItems: 'center' },
  tabLabel: { fontSize: 17, lineHeight: 24 },
  // The reference marks the active tab with a short, heavy *arc* rather than a
  // full-width rule. A wide, short view whose only bottom border is rounded
  // curves the same way without an SVG per tab.
  underline: {
    width: 30,
    height: 6,
    marginTop: Spacing.one,
    borderBottomWidth: 3,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  // The profile's section strip uses a straight rule that spans the label.
  bar: {
    alignSelf: 'stretch',
    height: 3,
    marginTop: Spacing.two,
    borderBottomWidth: 3,
  },
  pill: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
    paddingBottom: Spacing.two,
  },
});
