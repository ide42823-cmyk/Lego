import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { MomentCard } from '@/components/moment-card';
import { AppScreen } from '@/components/ui/app-screen';
import { Divider } from '@/components/ui/divider';
import { IconButton } from '@/components/ui/icon-button';
import { SegmentedTabs, type SegmentedTabItem } from '@/components/ui/segmented-tabs';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui/states';
import { useToast } from '@/components/ui/toast';
import { Spacing } from '@/constants/theme';
import { fixtureDataSource } from '@/core/data/repository';
import type { MomentPost, MomentsMode } from '@/core/data/types';
import { usePaginated } from '@/hooks/use-async';
import { useGreet } from '@/hooks/use-greet';

/**
 * Moments feed (reference screen 085).
 *
 * The feed is flat posts separated by a rule — not cards — because the content
 * is text-forward. Likes are applied optimistically and reconciled against the
 * value the data layer returns; a failed request rolls the post back to its last
 * known-good state rather than leaving the UI lying to the user.
 */
interface LikeOverride {
  likedByMe: boolean;
  likeCount: number;
}

const MODES: readonly SegmentedTabItem<MomentsMode>[] = [
  { key: 'recommend', label: 'Recommend' },
  { key: 'new', label: 'New users' },
];

export default function MomentsScreen() {
  const [mode, setMode] = useState<MomentsMode>('recommend');
  const [likeOverrides, setLikeOverrides] = useState<Record<string, LikeOverride>>({});
  const toast = useToast();
  const router = useRouter();
  const greet = useGreet();

  const list = usePaginated<MomentPost>(
    (cursor) => fixtureDataSource.listMoments(mode, { cursor, limit: 8 }),
    `moments:${mode}`,
  );

  const toggleLike = useCallback(
    async (momentId: string, liked: boolean) => {
      const post = list.items.find((item) => item.id === momentId);
      if (!post) {
        return;
      }

      const previous: LikeOverride = likeOverrides[momentId] ?? {
        likedByMe: post.likedByMe,
        likeCount: post.likeCount,
      };

      setLikeOverrides((current) => ({
        ...current,
        [momentId]: {
          likedByMe: liked,
          likeCount: previous.likeCount + (liked === previous.likedByMe ? 0 : liked ? 1 : -1),
        },
      }));

      try {
        const confirmed = await fixtureDataSource.setMomentLiked(momentId, liked);
        setLikeOverrides((current) => ({ ...current, [momentId]: confirmed }));
      } catch {
        setLikeOverrides((current) => ({ ...current, [momentId]: previous }));
        toast.show('That like did not save. Please try again.');
      }
    },
    [likeOverrides, list.items, toast],
  );

  const notYet = useCallback(
    (what: string) => toast.show(`${what} arrives in a later phase.`),
    [toast],
  );

  return (
    <AppScreen padded={false} tint="moments">
      <View style={styles.header}>
        <View style={styles.tabs}>
          <SegmentedTabs items={MODES} value={mode} onChange={setMode} label="Moments views" />
        </View>
        <View style={styles.actions}>
          <IconButton
            name="camera"
            label="Share a moment"
            onPress={() => notYet('Posting a moment')}
          />
        </View>
      </View>

      {list.status === 'loading' ? (
        <View style={styles.padded}>
          <LoadingSkeleton rows={4} variant="card" />
        </View>
      ) : list.status === 'error' ? (
        <ErrorState onRetry={list.reload} />
      ) : list.items.length === 0 ? (
        <EmptyState
          title="No moments yet"
          message="Nothing has been shared in this view. Check back soon."
        />
      ) : (
        <FlatList
          data={list.items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          accessibilityLabel="Moments"
          ItemSeparatorComponent={Divider}
          refreshControl={
            <RefreshControl refreshing={list.isRefreshing} onRefresh={list.refresh} />
          }
          onEndReachedThreshold={0.6}
          onEndReached={list.loadMore}
          renderItem={({ item }) => {
            const override = likeOverrides[item.id];
            const post = override ? { ...item, ...override } : item;
            return (
              <MomentCard
                post={post}
                onToggleLike={toggleLike}
                onOpenAuthor={(userId) =>
                  router.push({ pathname: '/person/[id]', params: { id: userId } })
                }
                onGreet={(userId) => greet(userId, post.authorName)}
                onMore={() => notYet('Post options')}
              />
            );
          }}
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
    paddingBottom: Spacing.two,
  },
  tabs: { flex: 1, paddingStart: Spacing.two },
  actions: { flexDirection: 'row', alignItems: 'center' },
  padded: { paddingHorizontal: Spacing.three },
  // The cards carry their own horizontal padding so the rule between posts can
  // run edge to edge, as it does in the reference feed.
  listContent: { paddingBottom: Spacing.six },
  footer: { paddingTop: Spacing.three, paddingHorizontal: Spacing.three },
});
