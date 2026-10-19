import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { PeopleRow } from '@/components/people-row';
import { PromoBanner } from '@/components/promo-banner';
import { AppScreen } from '@/components/ui/app-screen';
import { IconButton } from '@/components/ui/icon-button';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SegmentedTabs, type SegmentedTabItem } from '@/components/ui/segmented-tabs';
import { Divider } from '@/components/ui/divider';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui/states';
import { useToast } from '@/components/ui/toast';
import { Spacing } from '@/constants/theme';
import { fixtureDataSource } from '@/core/data/repository';
import type { DirectoryFeedItem, PeopleMode } from '@/core/data/types';
import { usePaginated } from '@/hooks/use-async';

/**
 * Home — people discovery (reference screens 097–100).
 *
 * One screen with four directory modes. The mode is the only state that changes
 * the query, so switching is instant and each mode keeps nothing stale.
 */
const MODES: readonly SegmentedTabItem<PeopleMode>[] = [
  { key: 'recommend', label: 'Recommend' },
  { key: 'nearby', label: 'Nearby' },
  { key: 'new', label: 'New' },
  { key: 'featured', label: 'Featured' },
];

export default function HomeScreen() {
  const [mode, setMode] = useState<PeopleMode>('recommend');
  const toast = useToast();

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

  return (
    <AppScreen padded={false}>
      <View style={styles.header}>
        <ScreenHeader
          title="Discover"
          subtitle="People near you and beyond"
          actions={
            <>
              <IconButton
                symbol="magnifyingglass"
                glyph="🔍"
                label="Search people"
                onPress={() => notYet('People search')}
              />
              <IconButton
                symbol="globe"
                glyph="🌐"
                label="Filter by region"
                onPress={() => notYet('Region filtering')}
              />
              <IconButton
                symbol="trophy"
                glyph="🏆"
                label="Leaderboard"
                onPress={() => notYet('The leaderboard')}
              />
            </>
          }
        />
        <SegmentedTabs
          items={MODES}
          value={mode}
          onChange={setMode}
          label="People discovery views"
        />
      </View>

      {list.status === 'loading' ? (
        <View style={styles.padded}>
          <LoadingSkeleton rows={6} />
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
          ItemSeparatorComponent={Divider}
          refreshControl={
            <RefreshControl refreshing={list.isRefreshing} onRefresh={list.refresh} />
          }
          onEndReachedThreshold={0.6}
          onEndReached={list.loadMore}
          renderItem={({ item }) =>
            item.kind === 'user' ? (
              <PeopleRow
                user={item.user}
                onOpenProfile={(userId) => notYet(`The profile for ${userId}`)}
                onGreet={(userId) => notYet(`Greeting ${userId}`)}
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
  header: { paddingHorizontal: Spacing.three, gap: Spacing.one },
  padded: { paddingHorizontal: Spacing.three },
  listContent: { paddingHorizontal: Spacing.three, paddingBottom: Spacing.six },
  footer: { paddingTop: Spacing.three },
});
