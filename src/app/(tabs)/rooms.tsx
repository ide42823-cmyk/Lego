import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { RoomCard } from '@/components/room-card';
import { AppScreen } from '@/components/ui/app-screen';
import { Divider } from '@/components/ui/divider';
import { FilterChips, type FilterChipItem } from '@/components/ui/filter-chips';
import { IconButton } from '@/components/ui/icon-button';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SegmentedTabs, type SegmentedTabItem } from '@/components/ui/segmented-tabs';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui/states';
import { useToast } from '@/components/ui/toast';
import { Spacing } from '@/constants/theme';
import { fixtureDataSource } from '@/core/data/repository';
import type { RoomMode, RoomRelationshipFilter, RoomSummary } from '@/core/data/types';
import { usePaginated } from '@/hooks/use-async';

/**
 * Rooms — the live-room directories (reference screens 090–094).
 *
 * Video is a two-column grid and every other mode is a list; the list is keyed
 * on the layout so `numColumns` can change without React Native complaining.
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

  const list = usePaginated<RoomSummary>(
    (cursor) => fixtureDataSource.listRooms(mode, { cursor, limit: 10, relationship }),
    `rooms:${mode}:${relationship}`,
  );

  const notYet = useCallback((what: string) => toast.show(`${what} arrives later.`), [toast]);
  const isGrid = mode === 'video';

  return (
    <AppScreen padded={false}>
      <View style={styles.header}>
        <ScreenHeader
          title="Rooms"
          subtitle="Live voice rooms"
          actions={
            <>
              <IconButton
                symbol="magnifyingglass"
                glyph="🔍"
                label="Search rooms"
                onPress={() => notYet('Room search')}
              />
              <IconButton
                symbol="plus.circle"
                glyph="➕"
                label="Create a room"
                onPress={() => notYet('Creating a room')}
              />
              <IconButton
                symbol="trophy"
                glyph="🏆"
                label="Room leaderboard"
                onPress={() => notYet('The room leaderboard')}
              />
            </>
          }
        />
        <SegmentedTabs items={MODES} value={mode} onChange={setMode} label="Room directories" />
        {mode === 'me' ? (
          <FilterChips
            items={RELATIONSHIP_FILTERS}
            value={relationship}
            onChange={setRelationship}
            label="Room relationships"
          />
        ) : null}
      </View>

      {list.status === 'loading' ? (
        <View style={styles.padded}>
          <LoadingSkeleton rows={isGrid ? 4 : 6} variant={isGrid ? 'card' : 'row'} />
        </View>
      ) : list.status === 'error' ? (
        <ErrorState onRetry={list.reload} />
      ) : list.items.length === 0 ? (
        <EmptyState title={EMPTY_COPY[mode].title} message={EMPTY_COPY[mode].message} />
      ) : (
        <FlatList
          key={isGrid ? 'grid' : 'list'}
          data={list.items}
          keyExtractor={(item) => item.id}
          numColumns={isGrid ? 2 : 1}
          columnWrapperStyle={isGrid ? styles.gridRow : undefined}
          contentContainerStyle={styles.listContent}
          accessibilityLabel="Rooms"
          ItemSeparatorComponent={isGrid ? undefined : Divider}
          refreshControl={
            <RefreshControl refreshing={list.isRefreshing} onRefresh={list.refresh} />
          }
          onEndReachedThreshold={0.6}
          onEndReached={list.loadMore}
          renderItem={({ item }) => (
            <RoomCard
              room={item}
              variant={isGrid ? 'grid' : 'list'}
              onPress={(roomId) => notYet(`The room for ${roomId}`)}
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
  header: { paddingHorizontal: Spacing.three, gap: Spacing.one },
  padded: { paddingHorizontal: Spacing.three },
  listContent: { paddingHorizontal: Spacing.three, paddingBottom: Spacing.six },
  gridRow: { gap: Spacing.three, marginBottom: Spacing.three },
  footer: { paddingTop: Spacing.three },
});
