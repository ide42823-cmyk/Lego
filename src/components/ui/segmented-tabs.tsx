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
   * `underline` matches the directory-style headers (strong underline on the
   * active item); `pill` is for compact inline switches.
   */
  variant?: 'underline' | 'pill';
}

/**
 * Top-level segmented navigation. Scrolls horizontally because Arabic and Latin
 * labels vary a lot in width.
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
              style={{
                color:
                  variant === 'pill'
                    ? selected
                      ? theme.onBrand
                      : theme.textSecondary
                    : selected
                      ? theme.text
                      : theme.textSecondary,
              }}
            >
              {item.label}
            </ThemedText>
            {variant === 'underline' ? (
              <View
                style={[
                  styles.underline,
                  { backgroundColor: selected ? theme.brand : 'transparent' },
                ]}
              />
            ) : null}
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
    gap: Spacing.three,
    paddingVertical: Spacing.one,
  },
  item: { paddingBottom: Spacing.one, alignItems: 'center' },
  underline: { height: 3, width: '100%', borderRadius: Radius.pill, marginTop: Spacing.one },
  pill: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
    paddingBottom: Spacing.two,
  },
});
