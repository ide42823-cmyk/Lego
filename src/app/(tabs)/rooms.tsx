import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { PromoBanner } from '@/components/promo-banner';
import { RoomCard } from '@/components/room-card';
import { AppScreen } from '@/components/ui/app-screen';
import { FilterChips, type FilterChipItem } from '@/components/ui/filter-chips';
import { IconButton } from '@/components/ui/icon-button';
import { SegmentedTabs, type SegmentedTabItem } from '@/components/ui/segmented-tabs';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui/states';
import { useToast } from '@/components/ui/toast';
import { Spacing } from '@/constants/theme';
import { fixtureDataSource } from '@/core/data/repository';
import type { RoomFeedItem, RoomMode, RoomRelationshipFilter } from '@/core/data/types';
import { usePaginated } from '@/hooks/use-async';

/**
 * Rooms — the live-room directories (reference screens 090–094).
 *
 * Video is a two-column grid and every other mode is a list; the list is keyed
 * on the layout so `numColumns` can change without React Native complaining.
 *
 * `Global` is kept as a fifth mode rather than a pushed region screen: the
 * reference reaches it from a region selector that does not exist yet, and
 * inventing the route now would ship a screen with nothing to select.
 */
const MODES: readonly SegmentedTabItem<RoomMode>[] = [
  { key: 'recommend', label: 'Recommend' },
  { key: 'video', label: 'Video' },
  { key: 'new', label: 'New' },
  { key: 'me', label: 'Me' },
  { key: 'global', label: 'Global' },
];

const RELATIONSHIP_FILTERS: readonly FilterChipItem<RoomRelationshipFilter>[] = [
  { key: 'joined', label: 'Joined' },
  { key: 'following', label: 'Following' },
  { key: 'recents', label: 'Recents' },
];

const EMPTY_COPY: Record<RoomMode, { title: string; message: string }> = {
  recommend: { title: 'No rooms to recommend', message: 'Rooms appear here once hosts go live.' },
  video: { title: 'No video rooms', message: 'No one is streaming video right now.' },
  new: { title: 'No new rooms', message: 'Newly created rooms will show up here.' },
  me: {
    title: 'Nothing here yet',
    message: 'Join a room and it will be listed under this filter.',
  },
  global: { title: 'No rooms in this region', message: 'Try another region.' },
};

export default function RoomsScreen() {
  const [mode, setMode] = useState<RoomMode>('recommend');
  const [relationship, setRelationship] = useState<RoomRelationshipFilter>('joined');
  const toast = useToast();
  const router = useRouter();

  const list = usePaginated<RoomFeedItem>(
    (cursor) => fixtureDataSource.listRooms(mode, { cursor, limit: 10, relationship }),
    `rooms:${mode}:${relationship}`,
  );

  const notYet = useCallback((what: string) => toast.show(`${what} arrives later.`), [toast]);
  const openSearch = useCallback(
    () => router.push({ pathname: '/search', params: { mode: 'rooms' } }),
    [router],
  );
  const openRanking = useCallback(
    () => router.push({ pathname: '/ranking', params: { category: 'room' } }),
    [router],
  );
  const isGrid = mode === 'video';

  // The promotion leads the feed, so it renders above the list — and above the
  // grid, which has no full-width cell to put it in.
  const promotion = list.items.find((item) => item.kind === 'banner');
  const banner = promotion?.kind === 'banner' ? promotion.banner : undefined;
  const rooms = list.items.flatMap((item) => (item.kind === 'room' ? [item.room] : []));
  const openPromotion = () => {
    if (banner) {
      notYet(banner.title);
    }
  };

  return (
    <AppScreen padded={false} tint="rooms">
      <View style={styles.header}>
        <View style={styles.tabs}>
          <SegmentedTabs items={MODES} value={mode} onChange={setMode} label="Room directories" />
        </View>
        <View style={styles.actions}>
          <IconButton name="search" label="Search rooms" onPress={openSearch} />
          <IconButton
            name="create"
            label="Create a room"
            onPress={() => notYet('Creating a room')}
          />
          <IconButton name="trophy" label="Room ranking" onPress={openRanking} />
        </View>
      </View>

      {mode === 'me' ? (
        <View style={styles.chips}>
          <FilterChips
            items={RELATIONSHIP_FILTERS}
            value={relationship}
            onChange={setRelationship}
            label="Room relationships"
          />
        </View>
      ) : null}

      {list.status === 'loading' ? (
        <View style={styles.padded}>
          <LoadingSkeleton rows={isGrid ? 4 : 6} variant={isGrid ? 'card' : 'row'} />
        </View>
      ) : list.status === 'error' ? (
        <ErrorState onRetry={list.reload} />
      ) : rooms.length === 0 ? (
        <EmptyState title={EMPTY_COPY[mode].title} message={EMPTY_COPY[mode].message} />
      ) : (
        <FlatList
          key={isGrid ? 'grid' : 'list'}
          data={rooms}
          keyExtractor={(item) => item.id}
          numColumns={isGrid ? 2 : 1}
          columnWrapperStyle={isGrid ? styles.gridRow : undefined}
          contentContainerStyle={styles.listContent}
          accessibilityLabel="Rooms"
          ListHeaderComponent={
            banner ? <PromoBanner banner={banner} onPress={openPromotion} /> : undefined
          }
          refreshControl={
            <RefreshControl refreshing={list.isRefreshing} onRefresh={list.refresh} />
          }
          onEndReachedThreshold={0.6}
          onEndReached={list.loadMore}
          renderItem={({ item }) => (
            <RoomCard
              room={item}
              variant={isGrid ? 'grid' : 'list'}
              onPress={() => notYet(`The room screen for “${item.name}”`)}
            />
          )}
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
  chips: { paddingHorizontal: Spacing.three },
  padded: { paddingHorizontal: Spacing.three },
  listContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.one,
    paddingBottom: Spacing.six,
    gap: Spacing.two,
  },
  gridRow: { gap: Spacing.three },
  footer: { paddingTop: Spacing.three },
});
