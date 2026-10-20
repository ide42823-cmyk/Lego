import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from '../themed-text';

export interface SearchTabItem<T extends string> {
  key: T;
  label: string;
}

export interface SearchTabsProps<T extends string> {
  items: readonly SearchTabItem<T>[];
  value: T;
  onChange: (key: T) => void;
  /** Accessible grouping name, e.g. "Search within". */
  label: string;
}

/**
 * The reference's three equal-width search tabs.
 *
 * Unlike the directory tabs, the selected state is a full-width bar sitting
 * flush with the screen edge and a bolder label, not a short curved rule. The
 * bar lives inside each tab, so it mirrors automatically in RTL.
 */
export function SearchTabs<T extends string>({
  items,
  value,
  onChange,
  label,
}: SearchTabsProps<T>) {
  const theme = useTheme();

  return (
    <View
      style={[styles.row, { borderBottomColor: theme.border }]}
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
            onPress={() => onChange(item.key)}
            style={({ pressed }) => [styles.tab, pressed && { opacity: 0.7 }]}
          >
            <ThemedText
              style={[
                styles.label,
                {
                  color: selected ? theme.text : theme.textSecondary,
                  fontWeight: selected ? 700 : 500,
                },
              ]}
            >
              {item.label}
            </ThemedText>
            {selected ? <View style={[styles.indicator, { backgroundColor: theme.text }]} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flex: 1,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 16, lineHeight: 22 },
  indicator: {
    position: 'absolute',
    bottom: 0,
    start: 0,
    end: 0,
    height: 3,
  },
});
