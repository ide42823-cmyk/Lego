import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import type { FilterOption } from '@/core/data/types';
import { countryFlag } from '@/core/format';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from '../themed-text';
import { BottomSheet } from '../ui/bottom-sheet';
import { Icon } from '../ui/icon';

export interface RegionSheetProps {
  visible: boolean;
  regions: readonly FilterOption[];
  value: string | null;
  onClose: () => void;
  onChange: (region: string | null) => void;
}

/**
 * Region picker for Regional Rank.
 *
 * The board supplies the options, so the sheet can never offer a place with no
 * ranked members or rooms. `All regions` is the null choice and always first.
 */
export function RegionSheet({ visible, regions, value, onClose, onChange }: RegionSheetProps) {
  const theme = useTheme();

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Region" titleAlign="center">
      <View style={styles.list}>
        <RegionRow
          label="All regions"
          selected={value === null}
          onPress={() => onChange(null)}
          leading={<Icon name="globe" size={18} strokeWidth={2} color={theme.textSecondary} />}
        />
        {regions.map((region) => (
          <RegionRow
            key={region.value}
            label={region.label}
            flag={countryFlag(region.value)}
            selected={value === region.value}
            onPress={() => onChange(region.value)}
          />
        ))}
      </View>
    </BottomSheet>
  );
}

interface RegionRowProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  flag?: string;
  leading?: ReactNode;
}

function RegionRow({ label, selected, onPress, flag, leading }: RegionRowProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}${selected ? ', selected' : ''}`}
      accessibilityState={{ selected }}
      aria-selected={selected}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: theme.border },
        pressed && { backgroundColor: theme.backgroundElement },
      ]}
    >
      <View style={styles.leading}>
        {flag ? <ThemedText style={styles.flag}>{flag}</ThemedText> : leading}
      </View>
      <ThemedText type="small" numberOfLines={1} style={styles.label}>
        {label}
      </ThemedText>
      {selected ? <Icon name="check" size={18} strokeWidth={2.4} color={theme.brand} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: Spacing.two },
  row: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.one,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  leading: { width: 24, alignItems: 'center', justifyContent: 'center' },
  flag: { fontSize: 18, lineHeight: 24 },
  label: { flex: 1 },
});
