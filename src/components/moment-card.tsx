import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import type { MomentPost } from '@/core/data/types';
import { formatCompactCount, formatRelativeTime } from '@/core/format';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from './themed-text';
import { UserBadges } from './user-badges';
import { Avatar } from './ui/avatar';
import { MediaThumb } from './ui/media-thumb';

/**
 * One post in the Moments feed (reference screen 085).
 *
 * Stateless: the optimistic like state lives in the screen so a failed request
 * can be rolled back centrally.
 */
export interface MomentCardProps {
  post: MomentPost;
  onToggleLike?: (momentId: string, liked: boolean) => void;
  onOpenAuthor?: (userId: string) => void;
  onGreet?: (userId: string) => void;
}

export function MomentCard({ post, onToggleLike, onOpenAuthor, onGreet }: MomentCardProps) {
  const theme = useTheme();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${post.authorName}. Open profile`}
          onPress={() => onOpenAuthor?.(post.authorId)}
          style={styles.author}
        >
          <Avatar id={post.authorId} name={post.authorName} uri={post.avatarUrl} size={40} />
          <View style={styles.authorText}>
            <ThemedText type="smallBold" numberOfLines={1}>
              {post.authorName}
            </ThemedText>
            <UserBadges badges={post.badges} level={post.authorLevel} />
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Say hi to ${post.authorName}`}
          onPress={() => onGreet?.(post.authorId)}
          hitSlop={6}
          style={({ pressed }) => [
            styles.greet,
            { backgroundColor: theme.accent, opacity: pressed ? 0.75 : 1 },
          ]}
        >
          <ThemedText type="small" style={[styles.greetLabel, { color: theme.onAccent }]}>
            HI
          </ThemedText>
        </Pressable>
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

      <View style={styles.footer}>
        <ThemedText type="small" themeColor="textSecondary">
          {formatRelativeTime(post.createdAt)}
        </ThemedText>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Like. ${post.likeCount} likes`}
          accessibilityState={{ selected: post.likedByMe }}
          onPress={() => onToggleLike?.(post.id, !post.likedByMe)}
          hitSlop={8}
          style={styles.action}
        >
          <ThemedText
            type="small"
            themeColor={post.likedByMe ? 'accent' : 'textSecondary'}
            style={styles.actionLabel}
          >
            {`${post.likedByMe ? '♥' : '♡'} ${formatCompactCount(post.likeCount)}`}
          </ThemedText>
        </Pressable>

        <View style={styles.action}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.actionLabel}>
            {`💬 ${formatCompactCount(post.commentCount)}`}
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
  authorText: { flex: 1, gap: Spacing.half },
  media: { width: '100%', aspectRatio: 4 / 3 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: Spacing.four },
  action: { minHeight: 32, justifyContent: 'center' },
  actionLabel: { fontWeight: '600' },
  greet: {
    minWidth: 44,
    minHeight: 32,
    paddingHorizontal: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
  },
  greetLabel: { fontWeight: '800', fontSize: 12 },
});
