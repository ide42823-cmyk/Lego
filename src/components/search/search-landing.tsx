import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import type { SearchMode, SearchSuggestions } from '@/core/data/types';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from '../themed-text';
import { Icon } from '../ui/icon';
import { IconButton } from '../ui/icon-button';

export interface SearchLandingProps {
  mode: SearchMode;
  recents: readonly string[];
  /** Null while suggestions are loading or when they failed; the field still works. */
  suggestions: SearchSuggestions | null;
  onPick: (term: string) => void;
  onRemoveRecent: (term: string) => void;
  onClearRecents: () => void;
}

/**
 * What the search screen shows before a query is typed: the session's recent
 * searches and a few terms that are guaranteed to have results.
 *
 * Recents are removable one by one and all at once. Because they are session
 * state rather than account state, the screen never claims they are synced.
 */
export function SearchLanding({
  mode,
  recents,
  suggestions,
  onPick,
  onRemoveRecent,
  onClearRecents,
}: SearchLandingProps) {
  const theme = useTheme();
  const terms = suggestions ? suggestions[mode] : [];

  return (
    <View style={styles.container}>
      {recents.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="smallBold" accessibilityRole="header">
              Recent searches
            </ThemedText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear recent searches"
              onPress={onClearRecents}
              hitSlop={4}
              style={({ pressed }) => [styles.clear, pressed && { opacity: 0.7 }]}
            >
              <ThemedText type="small" themeColor="textSecondary">
                Clear
              </ThemedText>
            </Pressable>
          </View>

          {recents.map((term) => (
            <View key={term} style={styles.recentRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Search for ${term}`}
                onPress={() => onPick(term)}
                style={({ pressed }) => [styles.recentMain, pressed && { opacity: 0.7 }]}
              >
                <Icon name="history" size={18} strokeWidth={2.2} color={theme.textSecondary} />
                <ThemedText numberOfLines={1} style={styles.recentText}>
                  {term}
                </ThemedText>
              </Pressable>
              <IconButton
                name="close"
                size={16}
                tone="muted"
                label={`Remove ${term} from recent searches`}
                onPress={() => onRemoveRecent(term)}
              />
            </View>
          ))}
        </View>
      ) : null}

      {terms.length > 0 ? (
        <View style={styles.section}>
          <ThemedText type="smallBold" accessibilityRole="header">
            {mode === 'people' ? 'Popular places' : 'Popular topics'}
          </ThemedText>
          <View style={styles.chips}>
            {terms.map((term) => (
              <Pressable
                key={term}
                accessibilityRole="button"
                accessibilityLabel={`Search for ${term}`}
                onPress={() => onPick(term)}
                style={({ pressed }) => [
                  styles.chip,
                  { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Icon
                  name={mode === 'people' ? 'globe' : 'trending'}
                  size={15}
                  strokeWidth={2.2}
                  color={theme.textSecondary}
                />
                <ThemedText type="small">{term}</ThemedText>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
        {mode === 'people'
          ? 'Search by name, country or status line.'
          : 'Search by room name, host, topic or description.'}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.four, paddingTop: Spacing.three, paddingBottom: Spacing.six },
  section: { gap: Spacing.one },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  clear: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: Spacing.one,
  },
  recentRow: { flexDirection: 'row', alignItems: 'center' },
  recentMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minHeight: 44,
  },
  recentText: { flex: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, paddingTop: Spacing.one },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    minHeight: 44,
    paddingHorizontal: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.pill,
  },
  hint: {
    textAlign: 'center',
    paddingHorizontal: Spacing.three,
  },
});
