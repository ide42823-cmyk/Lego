import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Radius, Spacing, TouchTarget } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from '../themed-text';
import { Icon } from '../ui/icon';
import { IconButton } from '../ui/icon-button';

export interface SearchFieldProps {
  value: string;
  /** Accessible name, e.g. "Search people". */
  label: string;
  placeholder: string;
  /** Extra guidance for assistive technology, e.g. what is searchable. */
  hint?: string;
  onChangeText: (value: string) => void;
  /** Fired by the keyboard's search key; used to remember the term. */
  onSubmit?: () => void;
  onCancel: () => void;
  autoFocus?: boolean;
}

/**
 * The search header: a pill field, a clear control and Cancel.
 *
 * This is a pushed screen, not a tab, so the field *is* the header — there is no
 * title competing with it. Cancel is a 44-point target and the accessible name
 * says what it cancels ("Cancel search") rather than just "Cancel".
 */
export function SearchField({
  value,
  label,
  placeholder,
  hint,
  onChangeText,
  onSubmit,
  onCancel,
  autoFocus = true,
}: SearchFieldProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.row} accessibilityRole="search">
      <View
        style={[
          styles.field,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: focused ? theme.brand : theme.border,
          },
        ]}
      >
        <Icon name="search" size={18} strokeWidth={2.4} color={theme.textSecondary} />
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
        accessibilityLabel="Cancel search"
        onPress={onCancel}
        hitSlop={4}
        style={({ pressed }) => [styles.cancel, pressed && { opacity: 0.7 }]}
      >
        <ThemedText type="smallBold" style={{ color: theme.brand }}>
          Cancel
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.one,
  },
  field: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minHeight: TouchTarget,
    paddingStart: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.pill,
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    lineHeight: 20,
    paddingVertical: Spacing.two,
    // The pill draws the focus state (brand border). Leaving the browser's own
    // outline on would paint a second, square ring inside the rounded field.
    outlineWidth: 0,
  },
  cancel: {
    minHeight: TouchTarget,
    justifyContent: 'center',
    paddingHorizontal: Spacing.two,
  },
});
