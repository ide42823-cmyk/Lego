import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { PeopleRow } from '@/components/people-row';
import { PromoBanner } from '@/components/promo-banner';
import { AppScreen } from '@/components/ui/app-screen';
import { IconButton } from '@/components/ui/icon-button';
import { SegmentedTabs, type SegmentedTabItem } from '@/components/ui/segmented-tabs';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui/states';
import { useToast } from '@/components/ui/toast';
import { Spacing } from '@/constants/theme';
import { fixtureDataSource } from '@/core/data/repository';
import type { DirectoryFeedItem, PeopleMode } from '@/core/data/types';
import { usePaginated } from '@/hooks/use-async';
import { useGreet } from '@/hooks/use-greet';

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
  const toast = useToast();
  const router = useRouter();
  const greet = useGreet();

  const list = usePaginated<DirectoryFeedItem>(
    (cursor) => fixtureDataSource.listPeople(mode, { cursor, limit: 12 }),
    `people:${mode}`,
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
          <IconButton name="search" label="Search people" onPress={() => notYet('People search')} />
          <IconButton
            name="filter"
            label="Filter people"
            onPress={() => notYet('People filters')}
          />
          <IconButton name="trophy" label="Leaderboard" onPress={() => notYet('The leaderboard')} />
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
          title="No one here yet"
          message="Nobody matches this view right now. Try another one — the list refreshes as members join."
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
  padded: { paddingHorizontal: Spacing.three },
  listContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.one,
    paddingBottom: Spacing.six,
    gap: Spacing.two,
  },
  footer: { paddingTop: Spacing.three },
});
