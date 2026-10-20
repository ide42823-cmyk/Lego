import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { SearchBar } from '@/components/search/search-bar';
import { SearchHeader } from '@/components/search/search-header';
import { SearchLanding } from '@/components/search/search-landing';
import { SearchResults } from '@/components/search/search-results';
import { SearchTabs, type SearchTabItem } from '@/components/search/search-tabs';
import { AppScreen } from '@/components/ui/app-screen';
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
import { useTheme } from '@/hooks/use-theme';

/**
 * Search — people, rooms and family rooms (the utility behind both directory
 * headers).
 *
 * One screen serves all three directories: the `mode` route param decides which
 * tab opens first, and switching tabs keeps the typed query. Matching and
 * ranking live behind the data seam, so this screen never looks at fixtures.
 * The Families tab is a view of the room directory restricted to the family
 * category; there is no separate family entity yet.
 *
 * Search history is genuinely account state. Until there is a backend it is
 * kept for the session only (see `core/search-recents`); the screen says
 * "recent searches" and never implies the list is synced.
 */
const MODES: readonly SearchTabItem<SearchMode>[] = [
  { key: 'people', label: 'People' },
  { key: 'rooms', label: 'Rooms' },
  { key: 'families', label: 'Families' },
];

const SEARCH_HINTS: Record<SearchMode, string> = {
  people: 'Names, countries and status lines are searchable.',
  rooms: 'Room names, hosts, topics and descriptions are searchable.',
  families: 'Family room names, hosts and topics are searchable.',
};

const FIELD_LABELS: Record<SearchMode, string> = {
  people: 'Search people',
  rooms: 'Search rooms',
  families: 'Search family rooms',
};

function readMode(value: string | string[] | undefined): SearchMode {
  const first = Array.isArray(value) ? value[0] : value;
  if (first === 'rooms') {
    return 'rooms';
  }
  if (first === 'families') {
    return 'families';
  }
  return 'people';
}

export default function SearchScreen() {
  const params = useLocalSearchParams<{ mode?: string | string[] }>();
  const router = useRouter();
  const toast = useToast();
  const greet = useGreet();
  const recents = useRecentSearches();
  const theme = useTheme();

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
      <SearchHeader onBack={cancel} />
      <SearchTabs items={MODES} value={mode} onChange={setMode} label="Search within" />
      <SearchBar
        value={query}
        onChangeText={setQuery}
        onSubmit={() => record(query)}
        label={FIELD_LABELS[mode]}
        placeholder="Search"
        hint={SEARCH_HINTS[mode]}
      />

      <View style={[styles.content, { backgroundColor: theme.surfaceMuted }]}>
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
            onSwitchMode={() =>
              setMode(mode === 'people' ? 'rooms' : mode === 'rooms' ? 'people' : 'rooms')
            }
          />
        )}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flex: 1 },
  landing: { flexGrow: 1, paddingHorizontal: Spacing.three },
  pending: { paddingHorizontal: Spacing.three, paddingTop: Spacing.two },
});
