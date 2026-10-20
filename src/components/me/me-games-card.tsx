import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppCard } from '@/components/ui/app-card';
import { GradientFill } from '@/components/ui/gradient-fill';
import { Icon, type IconName } from '@/components/ui/icon';
import { Radius, Spacing } from '@/constants/theme';
import type { MeGame } from '@/core/data/types';
import { useTints } from '@/hooks/use-tints';

export interface MeGamesCardProps {
  games: MeGame[];
  onPress: (game: MeGame) => void;
}

const GAME_ICONS: Record<MeGame['kind'], IconName> = {
  spin: 'sparkle',
  quiz: 'tasks',
  board: 'games',
};

/**
 * Three mini-games, one row.
 *
 * The cover is our own gradient and glyph rather than borrowed game art, so the
 * tile can never be mistaken for a third-party property. The red dot means
 * "there is something new inside"; the ribbon carries the player's best level.
 */
export function MeGamesCard({ games, onPress }: MeGamesCardProps) {
  const tints = useTints();

  return (
    <AppCard style={styles.card}>
      <ThemedText style={styles.title}>Games</ThemedText>
      <View style={styles.row}>
        {games.map((game) => {
          const tint = tints.me.game[game.kind];

          return (
            <Pressable
              key={game.id}
              accessibilityRole="button"
              accessibilityLabel={
                game.badgeCount ? `${game.title}, ${game.badgeCount} new` : game.title
              }
              onPress={() => onPress(game)}
              style={({ pressed }) => [styles.game, pressed && styles.pressed]}
            >
              <View style={styles.cover}>
                <GradientFill from={tint.from} to={tint.to} />
                <View style={styles.coverInner}>
                  <Icon name={GAME_ICONS[game.kind]} size={38} strokeWidth={1.6} color={tint.ink} />
                  {game.tag ? (
                    <View style={styles.tag}>
                      <ThemedText style={styles.tagLabel}>{game.tag}</ThemedText>
                    </View>
                  ) : null}
                  {game.badgeCount ? <View style={styles.dot} /> : null}
                </View>
              </View>
              <ThemedText type="small" numberOfLines={1} style={styles.label}>
                {game.title}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.three, padding: Spacing.three },
  title: { fontSize: 17, lineHeight: 24, fontWeight: '800' },
  row: { flexDirection: 'row', gap: Spacing.two },
  game: { flex: 1, gap: Spacing.one + 2 },
  pressed: { opacity: 0.75 },
  cover: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Radius.large,
    overflow: 'hidden',
  },
  /**
   * Positioned so it paints above `GradientFill`; it also anchors the corner
   * tags to the cover's box rather than to the pressable cell.
   */
  coverInner: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tag: {
    position: 'absolute',
    end: Spacing.one + 2,
    bottom: Spacing.one + 2,
    paddingHorizontal: Spacing.one + 2,
    borderRadius: Radius.small,
    backgroundColor: 'rgba(12, 10, 20, 0.55)',
  },
  tagLabel: { color: '#FFFFFF', fontSize: 10, lineHeight: 14, fontWeight: '800' },
  dot: {
    position: 'absolute',
    top: Spacing.two,
    end: Spacing.two,
    width: 9,
    height: 9,
    borderRadius: Radius.pill,
    backgroundColor: '#F43F5E',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  label: { fontSize: 12, lineHeight: 16, fontWeight: '600' },
});
