import { useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import type { FilterOption, Gender, PeopleFilterOptions, PeopleFilters } from '@/core/data/types';
import { defaultPeopleFilters, isDefaultPeopleFilters } from '@/core/people-filters';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from './themed-text';
import { BottomSheet } from './ui/bottom-sheet';
import { Icon, type IconName } from './ui/icon';
import { RangeSlider } from './ui/range-slider';
import { ErrorState, LoadingSkeleton } from './ui/states';

type PickerKey = 'language' | 'country';

export interface FilterSheetProps {
  visible: boolean;
  /** Facets from the data seam; null while loading or after a failure. */
  options: PeopleFilterOptions | null;
  /** True while the facets are in flight, so a null result can show the right state. */
  optionsLoading: boolean;
  /** Committed filters, or null for the defaults. */
  value: PeopleFilters | null;
  onClose: () => void;
  /** Receives null when the draft is the neutral filter. */
  onApply: (value: PeopleFilters | null) => void;
  onRetryOptions: () => void;
}

/**
 * The people-directory filter sheet.
 *
 * The sheet edits a draft: closing or tapping the scrim discards it, and
 * Confirm is the only path that changes the directory. Reset clears the draft
 * (it does not apply by itself). Every facet is derived from the fixture
 * directory, so a full-range slider means "everyone" rather than an invented
 * scale.
 *
 * VIP/Aristocracy section labels follow the reference. Language and Country are
 * ordinary directory facets in this front-end pass; membership enforcement is a
 * server concern and this sheet neither grants nor claims an entitlement.
 */
export function FilterSheet({
  visible,
  options,
  optionsLoading,
  value,
  onClose,
  onApply,
  onRetryOptions,
}: FilterSheetProps) {
  const theme = useTheme();
  const [draft, setDraft] = useState<PeopleFilters | null>(null);
  const [openPicker, setOpenPicker] = useState<PickerKey | null>(null);
  const [wasVisible, setWasVisible] = useState(visible);

  // Seed/reset the draft when the sheet opens, before the first paint. This is
  // React's "adjust state when a prop changes" pattern; an effect would show
  // the previous draft for a frame while the sheet animates in.
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setDraft(value ?? (options ? defaultPeopleFilters(options) : null));
      setOpenPicker(null);
    }
  }
  if (visible && options && !draft) {
    setDraft(value ?? defaultPeopleFilters(options));
  }

  if (!options || !draft) {
    return (
      <BottomSheet
        visible={visible}
        onClose={onClose}
        title="Filter"
        titleAlign="center"
        maxHeightRatio={0.9}
      >
        <View style={styles.state}>
          {optionsLoading ? (
            <LoadingSkeleton rows={4} />
          ) : (
            <ErrorState
              title="Filters unavailable"
              message="We could not load the filter options."
              onRetry={onRetryOptions}
            />
          )}
        </View>
      </BottomSheet>
    );
  }

  const ageActive = draft.ageMin > options.age.min || draft.ageMax < options.age.max;

  const reset = () => {
    setDraft(defaultPeopleFilters(options));
    setOpenPicker(null);
  };

  const footer = (
    <View style={styles.footer}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Reset filters"
        onPress={reset}
        style={({ pressed }) => [
          styles.footerButton,
          { backgroundColor: theme.brandSoft },
          pressed && { opacity: 0.75 },
        ]}
      >
        <ThemedText style={[styles.footerLabel, { color: theme.brand }]}>Reset</ThemedText>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Apply filters"
        onPress={() => onApply(isDefaultPeopleFilters(draft, options) ? null : draft)}
        style={({ pressed }) => [
          styles.footerButton,
          { backgroundColor: pressed ? theme.brandPressed : theme.brand },
        ]}
      >
        <ThemedText style={[styles.footerLabel, { color: theme.onBrand }]}>Confirm</ThemedText>
      </Pressable>
    </View>
  );

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Filter"
      titleAlign="center"
      footer={footer}
      maxHeightRatio={0.9}
    >
      <View style={styles.content}>
        <View style={styles.section}>
          <ThemedText type="smallBold" accessibilityRole="header">
            Gender
          </ThemedText>
          <View style={styles.genderRow} accessibilityRole="radiogroup" accessibilityLabel="Gender">
            <GenderPill
              gender="male"
              selected={draft.gender === 'male'}
              onPress={() => setDraft({ ...draft, gender: 'male' })}
            />
            <GenderPill
              gender="female"
              selected={draft.gender === 'female'}
              onPress={() => setDraft({ ...draft, gender: 'female' })}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.rangeHeader}>
            <ThemedText type="smallBold">Age</ThemedText>
            <ThemedText type="small" style={{ color: theme.brand, fontWeight: 600 }}>
              {ageActive ? `${draft.ageMin}–${draft.ageMax}` : 'All'}
            </ThemedText>
          </View>
          <RangeSlider
            min={options.age.min}
            max={options.age.max}
            step={options.age.step}
            low={draft.ageMin}
            high={draft.ageMax}
            onChange={({ low, high }) => setDraft({ ...draft, ageMin: low, ageMax: high })}
            label="Age"
            formatValue={(value) => `${value} years`}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.rangeHeader}>
            <ThemedText type="smallBold">Distance</ThemedText>
            <ThemedText type="small" style={{ color: theme.brand, fontWeight: 600 }}>
              {draft.distanceMinKm}–{draft.distanceMaxKm} km
            </ThemedText>
          </View>
          <RangeSlider
            min={options.distanceKm.min}
            max={options.distanceKm.max}
            step={options.distanceKm.step}
            low={draft.distanceMinKm}
            high={draft.distanceMaxKm}
            onChange={({ low, high }) =>
              setDraft({ ...draft, distanceMinKm: low, distanceMaxKm: high })
            }
            label="Distance"
            formatValue={(value) => `${value} kilometres`}
          />
        </View>

        <View style={styles.onlineRow}>
          <ThemedText>Online users only</ThemedText>
          <Switch
            value={draft.onlineOnly}
            onValueChange={(onlineOnly) => setDraft({ ...draft, onlineOnly })}
            accessibilityLabel="Online users only"
            trackColor={{ false: theme.backgroundSelected, true: theme.brand }}
            thumbColor={theme.onBrand}
            ios_backgroundColor={theme.backgroundSelected}
          />
        </View>

        <View style={styles.privilege}>
          <PrivilegeHeader icon="crown">VIP Privileges</PrivilegeHeader>
          <FilterPicker
            label="Language"
            groupLabel="Language"
            icon="globe"
            items={options.languages}
            selected={draft.language ?? ''}
            onSelect={(language) => {
              setDraft({ ...draft, language: language || null });
              setOpenPicker(null);
            }}
            expanded={openPicker === 'language'}
            onToggle={() => setOpenPicker(openPicker === 'language' ? null : 'language')}
          />
        </View>

        <View style={styles.privilege}>
          <PrivilegeHeader icon="shield">Aristocracy Privileges</PrivilegeHeader>
          <FilterPicker
            label="Country"
            groupLabel="Country"
            icon="globe"
            items={options.countries}
            selected={draft.country ?? ''}
            onSelect={(country) => {
              setDraft({ ...draft, country: country || null });
              setOpenPicker(null);
            }}
            expanded={openPicker === 'country'}
            onToggle={() => setOpenPicker(openPicker === 'country' ? null : 'country')}
          />
        </View>
      </View>
    </BottomSheet>
  );
}

function GenderPill({
  gender,
  selected,
  onPress,
}: {
  gender: Gender;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const label = gender === 'male' ? 'Male' : 'Female';

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected }}
      aria-checked={selected}
      onPress={onPress}
      style={({ pressed }) => [
        styles.genderPill,
        {
          backgroundColor: selected ? theme.brandSoft : theme.backgroundElement,
          borderColor: selected ? theme.brand : 'transparent',
        },
        pressed && { opacity: 0.75 },
      ]}
    >
      <Icon
        name={gender}
        size={18}
        strokeWidth={2.2}
        color={selected ? theme.brand : theme.textSecondary}
      />
      <ThemedText
        type="small"
        style={{ color: selected ? theme.brand : theme.text, fontWeight: 600 }}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}

function PrivilegeHeader({ icon, children }: { icon: IconName; children: string }) {
  const theme = useTheme();

  return (
    <View style={styles.privilegeHeader}>
      <Icon name={icon} size={15} strokeWidth={2.2} color={theme.gold} />
      <ThemedText type="smallBold" accessibilityRole="header" style={{ color: theme.gold }}>
        {children}
      </ThemedText>
    </View>
  );
}

function FilterPicker({
  label,
  groupLabel,
  icon,
  items,
  selected,
  onSelect,
  expanded,
  onToggle,
}: {
  label: string;
  groupLabel: string;
  icon: IconName;
  items: readonly FilterOption[];
  /** Empty string means "All". */
  selected: string;
  onSelect: (value: string) => void;
  expanded: boolean;
  onToggle: () => void;
}) {
  const theme = useTheme();
  const choices: FilterOption[] = [{ value: '', label: 'All' }, ...items];
  const selectedLabel = choices.find((choice) => choice.value === selected)?.label ?? 'All';

  return (
    <View style={styles.picker}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${selectedLabel}`}
        accessibilityState={{ expanded }}
        aria-expanded={expanded}
        onPress={onToggle}
        style={({ pressed }) => [styles.pickerRow, pressed && { opacity: 0.7 }]}
      >
        <Icon name={icon} size={18} strokeWidth={2.2} color={theme.textSecondary} />
        <ThemedText style={styles.pickerLabel}>{label}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {selectedLabel}
        </ThemedText>
        <Icon
          name={expanded ? 'expand' : 'forward'}
          size={16}
          strokeWidth={2.2}
          color={theme.textSecondary}
        />
      </Pressable>

      {expanded ? (
        <View style={styles.options} accessibilityRole="radiogroup" accessibilityLabel={groupLabel}>
          {choices.map((choice) => {
            const checked = choice.value === selected;

            return (
              <Pressable
                key={choice.value || 'all'}
                accessibilityRole="radio"
                accessibilityLabel={choice.label}
                accessibilityState={{ checked }}
                aria-checked={checked}
                onPress={() => onSelect(choice.value)}
                style={({ pressed }) => [
                  styles.option,
                  {
                    backgroundColor: checked ? theme.brandSoft : theme.backgroundElement,
                    borderColor: checked ? theme.brand : 'transparent',
                  },
                  pressed && { opacity: 0.75 },
                ]}
              >
                <ThemedText
                  type="small"
                  style={{
                    color: checked ? theme.brand : theme.text,
                    fontWeight: checked ? 700 : 500,
                  }}
                >
                  {choice.label}
                </ThemedText>
                {checked ? <Icon name="check" size={14} color={theme.brand} /> : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  state: { paddingHorizontal: Spacing.two },
  content: { gap: Spacing.four, paddingTop: Spacing.two, paddingBottom: Spacing.two },
  section: { gap: Spacing.two },
  genderRow: { flexDirection: 'row', gap: Spacing.two },
  genderPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: Radius.pill,
  },
  rangeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    minHeight: 44,
  },
  privilege: { gap: Spacing.one },
  privilegeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    minHeight: 24,
  },
  picker: { gap: Spacing.one },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minHeight: 48,
  },
  pickerLabel: { flex: 1 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, paddingBottom: Spacing.two },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    minHeight: 44,
    paddingHorizontal: Spacing.three,
    borderWidth: 1,
    borderRadius: Radius.pill,
  },
  footer: { flexDirection: 'row', gap: Spacing.two },
  footerButton: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
  },
  footerLabel: { fontSize: 15, lineHeight: 20, fontWeight: 700 },
});
