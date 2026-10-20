import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from '../themed-text';
import { Icon } from '../ui/icon';
import { IconButton } from '../ui/icon-button';

export interface SearchBarProps {
  value: string;
  /** Accessible name, e.g. "Search people". */
  label: string;
  placeholder: string;
  /** Extra guidance for assistive technology, e.g. what is searchable. */
  hint?: string;
  onChangeText: (value: string) => void;
  /** Fired by the Search button and the keyboard's search key. */
  onSubmit: () => void;
  autoFocus?: boolean;
}

/**
 * The reference's search row: a pill field and a filled Search button.
 *
 * Results update as the member types, so the button is not the only way to
 * search — it commits the term to the session's recent list and dismisses the
 * keyboard, and it is disabled while the field is empty.
 */
export function SearchBar({
  value,
  label,
  placeholder,
  hint,
  onChangeText,
  onSubmit,
  autoFocus = true,
}: SearchBarProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const disabled = value.trim().length === 0;

  return (
    <View style={styles.row} accessibilityRole="search">
      <View
        style={[
          styles.field,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: focused ? theme.brand : 'transparent',
          },
        ]}
      >
        <Icon name="search" size={20} strokeWidth={2.2} color={theme.text} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          placeholderTextColor={theme.textSecondary}
          accessibilityLabel={label}
          accessibilityHint={hint}
          autoFocus={autoFocus}
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={64}
          returnKeyType="search"
          enterKeyHint="search"
          selectionColor={theme.brand}
          style={[styles.input, { color: theme.text }]}
        />
        {value.length > 0 ? (
          <IconButton
            name="close"
            size={16}
            tone="muted"
            label="Clear search"
            onPress={() => onChangeText('')}
          />
        ) : null}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Search"
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onSubmit}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: disabled
              ? theme.backgroundElement
              : pressed
                ? theme.brandPressed
                : theme.brand,
          },
        ]}
      >
        <ThemedText
          style={[styles.buttonLabel, { color: disabled ? theme.textSecondary : theme.onBrand }]}
        >
          Search
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  field: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    height: 48,
    paddingStart: Spacing.three,
    borderWidth: 1,
    borderRadius: Radius.pill,
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    lineHeight: 20,
    paddingVertical: 0,
    // The pill draws the focus state (brand border). Leaving the browser's own
    // outline on would paint a second, square ring inside the rounded field.
    outlineWidth: 0,
  },
  button: {
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.pill,
  },
  buttonLabel: { fontSize: 15, lineHeight: 20, fontWeight: 700 },
});
