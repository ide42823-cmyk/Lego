import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { FilterSheet } from '@/components/filter-sheet';
import { PeopleRow } from '@/components/people-row';
import { PromoBanner } from '@/components/promo-banner';
import { AppScreen } from '@/components/ui/app-screen';
import { IconButton } from '@/components/ui/icon-button';
import { SegmentedTabs, type SegmentedTabItem } from '@/components/ui/segmented-tabs';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui/states';
import { useToast } from '@/components/ui/toast';
import { Radius, Spacing } from '@/constants/theme';
import { fixtureDataSource } from '@/core/data/repository';
import type {
  DirectoryFeedItem,
  PeopleFilterOptions,
  PeopleFilters,
  PeopleMode,
} from '@/core/data/types';
import { countActivePeopleFilters } from '@/core/people-filters';
import { useAsync, usePaginated } from '@/hooks/use-async';
import { useGreet } from '@/hooks/use-greet';
import { useTheme } from '@/hooks/use-theme';

/**
 * Home — people discovery (reference screens 097–100).
 *
 * The header is the mode row plus the three directory actions; there is no page
 * title, which is what the reference does. One screen serves four directory
 * modes: the mode is the only state that changes the query, so switching is
 * instant and no mode keeps a stale list.
 */
const MODES: readonly SegmentedTabItem<PeopleMode>[] = [
  { key: 'recommend', label: 'Recommend' },
  { key: 'nearby', label: 'Nearby' },
  { key: 'new', label: 'New users' },
  { key: 'featured', label: 'Featured' },
];

export default function HomeScreen() {
  const [mode, setMode] = useState<PeopleMode>('recommend');
  const [filters, setFilters] = useState<PeopleFilters | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const greet = useGreet();
  const theme = useTheme();

  const filterOptions = useAsync<PeopleFilterOptions>(
    () => fixtureDataSource.getPeopleFilterOptions(),
    'people-filter-options',
  );

  const activeFilterCount =
    filters && filterOptions.status === 'ready'
      ? countActivePeopleFilters(filters, filterOptions.data)
      : 0;
  const filterKey = filters ? JSON.stringify(filters) : 'all';

  const list = usePaginated<DirectoryFeedItem>(
    (cursor) => fixtureDataSource.listPeople(mode, { cursor, limit: 12 }, filters ?? undefined),
    `people:${mode}:${filterKey}`,
  );

  const notYet = useCallback(
    (what: string) => {
      toast.show(`${what} arrives with the backend phase.`);
    },
    [toast],
  );

  const openProfile = useCallback(
    (userId: string) => router.push({ pathname: '/person/[id]', params: { id: userId } }),
    [router],
  );

  const openSearch = useCallback(
    () => router.push({ pathname: '/search', params: { mode: 'people' } }),
    [router],
  );

  return (
    <AppScreen padded={false} tint="home">
      <View style={styles.header}>
        <View style={styles.tabs}>
          <SegmentedTabs
            items={MODES}
            value={mode}
            onChange={setMode}
            label="People discovery views"
          />
        </View>
        <View style={styles.actions}>
          <IconButton name="search" label="Search people" onPress={openSearch} />
          <View style={styles.filterWrap}>
            <IconButton
              name="filter"
              label={
                activeFilterCount > 0
                  ? `Filter people, ${activeFilterCount} active`
                  : 'Filter people'
              }
              tone={activeFilterCount > 0 ? 'brand' : 'default'}
              onPress={() => setFilterOpen(true)}
            />
            {activeFilterCount > 0 ? (
              <View
                pointerEvents="none"
                style={[styles.filterDot, { backgroundColor: theme.brand }]}
              />
            ) : null}
          </View>
          <IconButton name="trophy" label="Ranking" onPress={() => router.push('/ranking')} />
        </View>
      </View>

      {list.status === 'loading' ? (
        <View style={styles.padded}>
          <LoadingSkeleton rows={5} />
        </View>
      ) : list.status === 'error' ? (
        <ErrorState onRetry={list.reload} />
      ) : list.items.length === 0 ? (
        <EmptyState
          title={filters ? 'No one matches' : 'No one here yet'}
          message={
            filters
              ? 'No one matches these filters. Widen the age or distance range, or clear them.'
              : 'Nobody matches this view right now. Try another one — the list refreshes as members join.'
          }
          actionLabel={filters ? 'Clear filters' : undefined}
          onAction={filters ? () => setFilters(null) : undefined}
        />
      ) : (
        <FlatList
          data={list.items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          accessibilityLabel="People"
          refreshControl={
            <RefreshControl refreshing={list.isRefreshing} onRefresh={list.refresh} />
          }
          onEndReachedThreshold={0.6}
          onEndReached={list.loadMore}
          renderItem={({ item }) =>
            item.kind === 'user' ? (
              <PeopleRow
                user={item.user}
                onOpenProfile={openProfile}
                onGreet={(userId) => greet(userId, item.user.displayName)}
              />
            ) : (
              <PromoBanner banner={item.banner} onPress={() => notYet(item.banner.title)} />
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
      )}

      <FilterSheet
        visible={filterOpen}
        options={filterOptions.status === 'ready' ? filterOptions.data : null}
        optionsLoading={filterOptions.status === 'loading'}
        value={filters}
        onClose={() => setFilterOpen(false)}
        onApply={(next) => {
          setFilters(next);
          setFilterOpen(false);
        }}
        onRetryOptions={filterOptions.reload}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
    paddingBottom: Spacing.one,
  },
  tabs: { flex: 1, paddingStart: Spacing.two },
  actions: { flexDirection: 'row', alignItems: 'center' },
  filterWrap: { position: 'relative' },
  filterDot: {
    position: 'absolute',
    top: 8,
    end: 8,
    width: 8,
    height: 8,
    borderRadius: Radius.pill,
  },
  padded: { paddingHorizontal: Spacing.three },
  listContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.one,
    paddingBottom: Spacing.six,
    gap: Spacing.two,
  },
  footer: { paddingTop: Spacing.three },
});
