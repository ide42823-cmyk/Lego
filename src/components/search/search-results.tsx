import { FlatList, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { fixtureDataSource } from '@/core/data/repository';
import type { RoomSummary, SearchMode, UserSummary } from '@/core/data/types';
import { usePaginated } from '@/hooks/use-async';

import { PeopleRow } from '../people-row';
import { RoomCard } from '../room-card';
import { ThemedText } from '../themed-text';
import { EmptyState, ErrorState, LoadingSkeleton } from '../ui/states';

/** One page of results, tagged so the list can render either kind safely. */
type SearchResult = { kind: 'person'; user: UserSummary } | { kind: 'room'; room: RoomSummary };

const PAGE_SIZE = 12;

export interface SearchResultsProps {
  mode: SearchMode;
  /** Already trimmed and debounced; never empty. */
  query: string;
  onOpenProfile: (userId: string) => void;
  onOpenRoom: (room: RoomSummary) => void;
  onGreet: (userId: string, displayName: string) => void;
  /** Empty-result escape hatch: run the same query against the other kind. */
  onSwitchMode: () => void;
}

/**
 * Results for one mode and one query.
 *
 * The component is keyed by mode at the call site, so switching People/Rooms
 * starts a fresh list rather than carrying a scroll position across. Every
 * request state is rendered: skeleton, retry, no matches, and the page itself.
 */
export function SearchResults({
  mode,
  query,
  onOpenProfile,
  onOpenRoom,
  onGreet,
  onSwitchMode,
}: SearchResultsProps) {
  const list = usePaginated<SearchResult>((cursor) => {
    if (mode === 'people') {
      return fixtureDataSource.searchPeople(query, { cursor, limit: PAGE_SIZE }).then((page) => ({
        ...page,
        items: page.items.map((user): SearchResult => ({ kind: 'person', user })),
      }));
    }

    return fixtureDataSource.searchRooms(query, { cursor, limit: PAGE_SIZE }).then((page) => ({
      ...page,
      items: page.items.map((room): SearchResult => ({ kind: 'room', room })),
    }));
  }, `search:${mode}:${query}`);

  if (list.status === 'loading') {
    return (
      <View style={styles.message}>
        <LoadingSkeleton rows={6} />
      </View>
    );
  }

  if (list.status === 'error') {
    return <ErrorState onRetry={list.reload} />;
  }

  if (list.items.length === 0) {
    return (
      <EmptyState
        title={mode === 'people' ? 'No people found' : 'No rooms found'}
        message={
          mode === 'people'
            ? `Nothing matches “${query}”. Try a shorter word, or search rooms instead.`
            : `Nothing matches “${query}”. Try a shorter word, or search people instead.`
        }
        actionLabel={mode === 'people' ? 'Search rooms' : 'Search people'}
        onAction={onSwitchMode}
      />
    );
  }

  const total = list.total ?? list.items.length;
  const noun = mode === 'people' ? 'person' : 'room';
  const countLabel = `${total} ${noun}${total === 1 ? '' : 's'}`;

  return (
    <View style={styles.container}>
      <View style={styles.countRow} accessibilityLiveRegion="polite">
        <ThemedText type="smallBold">{countLabel}</ThemedText>
        <ThemedText
          type="small"
          themeColor="textSecondary"
          numberOfLines={1}
          style={styles.forQuery}
        >
          for “{query}”
        </ThemedText>
      </View>

      <FlatList
        data={list.items}
        keyExtractor={(item) => (item.kind === 'person' ? item.user.id : item.room.id)}
        contentContainerStyle={styles.listContent}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        accessibilityLabel={mode === 'people' ? 'People search results' : 'Room search results'}
        onEndReachedThreshold={0.6}
        onEndReached={list.loadMore}
        renderItem={({ item }) =>
          item.kind === 'person' ? (
            <PeopleRow
              user={item.user}
              onOpenProfile={onOpenProfile}
              onGreet={(userId) => onGreet(userId, item.user.displayName)}
            />
          ) : (
            <RoomCard room={item.room} onPress={() => onOpenRoom(item.room)} />
          )
        }
        ListFooterComponent={
          list.isLoadingMore ? (
            <View style={styles.footer}>
              <LoadingSkeleton rows={2} />
            </View>
          ) : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  message: { paddingHorizontal: Spacing.three },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.one,
    paddingBottom: Spacing.two,
  },
  forQuery: { flexShrink: 1 },
  listContent: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.two,
  },
  footer: { paddingTop: Spacing.three },
});
