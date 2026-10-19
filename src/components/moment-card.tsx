import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import type { MomentPost } from '@/core/data/types';
import { formatCompactCount, formatRelativeTime } from '@/core/format';
import { useTheme } from '@/hooks/use-theme';
import { useTints } from '@/hooks/use-tints';

import { ThemedText } from './themed-text';
import { UserBadges } from './user-badges';
import { AgePill } from './ui/age-pill';
import { Avatar } from './ui/avatar';
import { HiButton } from './ui/hi-button';
import { Icon } from './ui/icon';
import { MediaThumb } from './ui/media-thumb';

/**
 * One post in the Moments feed (reference screen 085).
 *
 * Flat, separated by a rule rather than a card — the feed is text-forward, so a
 * card border on every post would compete with the writing.
 *
 * Stateless: the optimistic like state lives in the screen so a failed request
 * can be rolled back centrally.
 */
export interface MomentCardProps {
  post: MomentPost;
  onToggleLike?: (momentId: string, liked: boolean) => void;
  onOpenAuthor?: (userId: string) => void;
  onGreet?: (userId: string) => void;
  onMore?: (momentId: string) => void;
}

export function MomentCard({ post, onToggleLike, onOpenAuthor, onGreet, onMore }: MomentCardProps) {
  const theme = useTheme();
  const tints = useTints();
  const genderColor = post.authorGender ? tints.gender[post.authorGender] : undefined;
  const likeColor = post.likedByMe ? theme.accent : theme.textSecondary;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${post.authorName}. Open profile`}
          onPress={() => onOpenAuthor?.(post.authorId)}
          style={styles.author}
        >
          <Avatar id={post.authorId} name={post.authorName} uri={post.avatarUrl} size={48} />
          <View style={styles.authorText}>
            <View style={styles.nameRow}>
              <ThemedText type="smallBold" numberOfLines={1} style={styles.name}>
                {post.authorName}
              </ThemedText>
              {post.authorGender ? (
                <Icon name={post.authorGender} size={13} strokeWidth={2.6} color={genderColor} />
              ) : null}
              <UserBadges badges={post.badges} level={post.authorLevel} variant="status" />
            </View>
            {post.authorAge === undefined ? null : (
              <AgePill age={post.authorAge} gender={post.authorGender} />
            )}
          </View>
        </Pressable>

        <HiButton name={post.authorName} onPress={() => onGreet?.(post.authorId)} />
      </View>

      <ThemedText type="default">{post.text}</ThemedText>

      {post.mediaUrl ? (
        <MediaThumb
          id={post.id}
          label="Post media"
          uri={post.mediaUrl}
          style={styles.media}
          borderRadius={Radius.large}
        />
      ) : null}

      <ThemedText type="small" themeColor="textSecondary">
        {formatRelativeTime(post.createdAt)}
      </ThemedText>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="More options"
          onPress={() => onMore?.(post.id)}
          hitSlop={8}
          style={styles.action}
        >
          <Icon name="more" size={20} color={theme.textSecondary} />
        </Pressable>

        <View style={styles.spacer} />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Like. ${post.likeCount} likes`}
          accessibilityState={{ selected: post.likedByMe }}
          onPress={() => onToggleLike?.(post.id, !post.likedByMe)}
          hitSlop={8}
          style={styles.action}
        >
          <Icon
            name="like"
            size={20}
            color={likeColor}
            fill={post.likedByMe ? tints.hi.icon : 'none'}
          />
          <ThemedText type="small" style={[styles.actionLabel, { color: likeColor }]}>
            {formatCompactCount(post.likeCount)}
          </ThemedText>
        </Pressable>

        <View style={styles.action}>
          <Icon name="comment" size={20} color={theme.textSecondary} />
          <ThemedText type="small" themeColor="textSecondary" style={styles.actionLabel}>
            {formatCompactCount(post.commentCount)}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.two, paddingVertical: Spacing.three },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  author: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  authorText: { flex: 1, gap: Spacing.one },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, flexWrap: 'wrap' },
  name: { flexShrink: 1 },
  media: { width: '100%', aspectRatio: 4 / 3 },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    paddingTop: Spacing.one,
  },
  action: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, minHeight: 32 },
  actionLabel: { fontWeight: '700' },
  spacer: { flex: 1 },
});
