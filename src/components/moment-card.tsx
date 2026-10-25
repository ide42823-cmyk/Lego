import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import type { MomentPost } from '@/core/data/types';
import { formatCompactCount, formatDistanceKm, formatMomentStamp } from '@/core/format';
import { textAlignFor } from '@/core/i18n';
import { useTheme } from '@/hooks/use-theme';
import { useTints } from '@/hooks/use-tints';

import { ThemedText } from './themed-text';
import { UserBadges } from './user-badges';
import { AgePill } from './ui/age-pill';
import { Avatar } from './ui/avatar';
import { HiButton } from './ui/hi-button';
import { Icon } from './ui/icon';
import { MediaThumb } from './ui/media-thumb';
import { TagChip } from './ui/tag-chip';
import { TierBadge } from './ui/tier-badge';

/**
 * One post in the Moments feed (reference screens 024 and 085).
 *
 * Flat, separated by a full-bleed rule rather than a card — the feed is
 * text-forward, so a card border on every post would compete with the writing.
 *
 * The post body hangs off the name column instead of the card's edge: the
 * reference indents the caption, media, hashtag, stamp and action row past the
 * avatar, so the portrait reads as a column of writing under the author rather
 * than a second full-width block.
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
  const likeColor = post.likedByMe ? theme.accent : theme.textSecondary;
  // The age pill already carries the gender glyph, and the level crest would
  // duplicate the tier chip — the reference prints neither beside the name.
  const nameBadges = post.badges.filter((badge) => badge !== 'level');
  const showMeta = post.authorAge !== undefined || post.authorVipTier !== undefined;
  // The stamp joins the post's age to the author's coarse distance with the
  // reference's middle dot: "5 minutes ago · 72.1km".
  const stamp = [
    formatMomentStamp(post.createdAt),
    post.distanceKm === undefined ? '' : formatDistanceKm(post.distanceKm),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${post.authorName}. Open profile`}
          onPress={() => onOpenAuthor?.(post.authorId)}
          style={styles.author}
        >
          <Avatar
            id={post.authorId}
            name={post.authorName}
            uri={post.avatarUrl}
            size={48}
            frame={post.avatarFrame}
            online={post.authorOnline}
          />
          <View style={styles.authorText}>
            <View style={styles.nameRow}>
              <ThemedText type="smallBold" numberOfLines={1} style={styles.name}>
                {post.authorName}
              </ThemedText>
              <UserBadges badges={nameBadges} level={post.authorLevel} variant="status" />
            </View>
            {showMeta ? (
              <View style={styles.metaRow}>
                {post.authorAge === undefined ? null : (
                  <AgePill age={post.authorAge} gender={post.authorGender} />
                )}
                {post.authorVipTier === undefined ? null : (
                  <TierBadge tier="vip" label={`VIP${post.authorVipTier}`} crowned />
                )}
              </View>
            ) : null}
          </View>
        </Pressable>

        {/*
          The feed offers a greeting on every post, but a member's own profile
          already carries the sticky Say hi bar — the reference prints no second
          greeting pill there, so the card only shows one when it is wired.
        */}
        {onGreet ? (
          <HiButton name={post.authorName} onPress={() => onGreet(post.authorId)} />
        ) : null}
      </View>

      <View style={styles.body}>
        <ThemedText type="default" style={{ textAlign: textAlignFor(post.text) }}>
          {post.text}
        </ThemedText>

        {post.hasMedia || post.mediaUrl ? (
          // The reference sets post media as a portrait inset rather than a
          // full-bleed banner, and fixtures carry no image host, so the shared
          // placeholder stands in.
          <MediaThumb
            id={post.id}
            label="Post media"
            uri={post.mediaUrl}
            placeholderText=""
            style={styles.media}
            borderRadius={Radius.medium}
          />
        ) : null}

        {post.hashtag ? (
          <TagChip
            label={post.hashtag}
            emoji="#"
            size="medium"
            emojiColor={theme.brand}
            labelColor={theme.text}
            style={styles.hashtag}
          />
        ) : null}

        <ThemedText type="small" themeColor="textSecondary">
          {stamp}
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
            {post.likeCount > 0 ? (
              <ThemedText type="small" style={[styles.actionLabel, { color: likeColor }]}>
                {formatCompactCount(post.likeCount)}
              </ThemedText>
            ) : null}
          </Pressable>

          <View style={styles.action}>
            <Icon name="comment" size={20} color={theme.textSecondary} />
            {post.commentCount > 0 ? (
              <ThemedText type="small" themeColor="textSecondary" style={styles.actionLabel}>
                {formatCompactCount(post.commentCount)}
              </ThemedText>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  author: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  authorText: { flex: 1, gap: Spacing.one },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, flexWrap: 'wrap' },
  name: { flexShrink: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, flexWrap: 'wrap' },
  /** Avatar (48) plus the header's gap: the body aligns with the name. */
  body: { paddingStart: 56, gap: Spacing.two },
  media: { width: '34%', aspectRatio: 3 / 4, alignSelf: 'flex-start' },
  /** A pill, not a rule: the chip must not stretch to the card's width. */
  hashtag: { alignSelf: 'flex-start' },
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
