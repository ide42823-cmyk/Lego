import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { SearchField } from '@/components/search/search-field';
import { SearchLanding } from '@/components/search/search-landing';
import { SearchResults } from '@/components/search/search-results';
import { AppScreen } from '@/components/ui/app-screen';
import { SegmentedTabs, type SegmentedTabItem } from '@/components/ui/segmented-tabs';
import { LoadingSkeleton } from '@/components/ui/states';
import { useToast } from '@/components/ui/toast';
import { Spacing } from '@/constants/theme';
import { fixtureDataSource } from '@/core/data/repository';
import type { RoomSummary, SearchMode, SearchSuggestions } from '@/core/data/types';
import { recentSearches } from '@/core/search-recents';
import { useAsync } from '@/hooks/use-async';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useGreet } from '@/hooks/use-greet';
import { useRecentSearches } from '@/hooks/use-recent-searches';

/**
 * Search — people and rooms (the utility behind both directory headers).
 *
 * One screen serves both directories: the `mode` route param decides which tab
 * opens first, and switching tabs keeps the typed query. Matching and ranking
 * live behind the data seam, so this screen never looks at fixtures.
 *
 * Search history is genuinely account state. Until there is a backend it is
 * kept for the session only (see `core/search-recents`); the screen says
 * "recent searches" and never implies the list is synced.
 */
const MODES: readonly SegmentedTabItem<SearchMode>[] = [
  { key: 'people', label: 'People' },
  { key: 'rooms', label: 'Rooms' },
];

const SEARCH_HINTS: Record<SearchMode, string> = {
  people: 'Names, countries and status lines are searchable.',
  rooms: 'Room names, hosts, topics and descriptions are searchable.',
};

function readMode(value: string | string[] | undefined): SearchMode {
  const first = Array.isArray(value) ? value[0] : value;
  return first === 'rooms' ? 'rooms' : 'people';
}

export default function SearchScreen() {
  const params = useLocalSearchParams<{ mode?: string | string[] }>();
  const router = useRouter();
  const toast = useToast();
  const greet = useGreet();
  const recents = useRecentSearches();

  const [mode, setMode] = useState<SearchMode>(() => readMode(params.mode));
  const [query, setQuery] = useState('');
  const debounced = useDebouncedValue(query.trim(), 250);

  // Suggestions are secondary: the field works whether or not they arrive.
  const suggestions = useAsync<SearchSuggestions>(
    () => fixtureDataSource.getSearchSuggestions(),
    'search-suggestions',
  );

  const hasQuery = query.trim().length > 0;
  // Clearing the field is immediate; typing trails the debounce.
  const shownQuery = hasQuery ? debounced : '';

  const record = useCallback((term: string) => {
    recentSearches.add(term);
  }, []);

  const cancel = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }, [router]);

  const pick = useCallback(
    (term: string) => {
      setQuery(term);
      record(term);
    },
    [record],
  );

  const openProfile = useCallback(
    (userId: string) => {
      record(shownQuery);
      router.push({ pathname: '/person/[id]', params: { id: userId } });
    },
    [record, router, shownQuery],
  );

  const openRoom = useCallback(
    (room: RoomSummary) => {
      record(shownQuery);
      toast.show(`The room screen for “${room.name}” arrives later.`);
    },
    [record, shownQuery, toast],
  );

  return (
    <AppScreen padded={false}>
      <SearchField
        value={query}
        onChangeText={setQuery}
        onSubmit={() => record(query)}
        onCancel={cancel}
        label={mode === 'people' ? 'Search people' : 'Search rooms'}
        placeholder={mode === 'people' ? 'Search people' : 'Search rooms'}
        hint={SEARCH_HINTS[mode]}
      />

      <View style={styles.modes}>
        <SegmentedTabs items={MODES} value={mode} onChange={setMode} label="Search within" />
      </View>

      {!hasQuery ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.landing}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <SearchLanding
            mode={mode}
            recents={recents}
            suggestions={suggestions.status === 'ready' ? suggestions.data : null}
            onPick={pick}
            onRemoveRecent={(term) => recentSearches.remove(term)}
            onClearRecents={() => recentSearches.clear()}
          />
        </ScrollView>
      ) : shownQuery.length === 0 ? (
        <View style={styles.pending}>
          <LoadingSkeleton rows={6} />
        </View>
      ) : (
        <SearchResults
          key={mode}
          mode={mode}
          query={shownQuery}
          onOpenProfile={openProfile}
          onOpenRoom={openRoom}
          onGreet={greet}
          onSwitchMode={() => setMode(mode === 'people' ? 'rooms' : 'people')}
        />
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  modes: { paddingHorizontal: Spacing.three },
  landing: { flexGrow: 1, paddingHorizontal: Spacing.three },
  pending: { paddingHorizontal: Spacing.three, paddingTop: Spacing.two },
});
