import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import type { HonorArt, HonorEntry, HonorWall } from '@/core/data/types';
import { useTheme } from '@/hooks/use-theme';
import { useTints } from '@/hooks/use-tints';

import { ThemedText } from '../themed-text';
import { Icon, type IconName } from '../ui/icon';

const ART: Record<HonorArt, IconName> = {
  crown: 'crown',
  star: 'star',
  shield: 'shield',
  trophy: 'trophy',
  gem: 'diamonds',
  sparkle: 'sparkle',
  rank: 'rank',
  gift: 'gift',
};

const TILE = 58;

export interface HonorWallProps {
  wall: HonorWall;
  /** Opens the full collection behind this wall. */
  onOpenCollection: (wall: HonorWall) => void;
  onOpenEntry: (entry: HonorEntry) => void;
}

/**
 * One honour collection — Badges Wall, Titles Wall, Gifts Honor Wall (reference
 * screen 025).
 *
 * The reference frames each wall with ornate metallic art. That art is
 * proprietary, so the framing here is a flat tinted panel and every trophy is one
 * of our own glyphs; the *structure* the analysis calls out — a titled wall, a
 * preview row, and a count that opens the full collection — is what is
 * reproduced.
 *
 * The wall itself is not a button: the chevron opens the collection and each
 * trophy is separately focusable, which is what the reference's own affordances
 * imply and keeps the accessibility tree flat.
 */
export function HonorWallCard({ wall, onOpenCollection, onOpenEntry }: HonorWallProps) {
  const theme = useTheme();
  const tints = useTints();

  const palette = {
    badges: {
      fill: tints.tier.vip.from,
      border: tints.tier.vip.to,
      text: tints.tier.vip.text,
    },
    titles: {
      fill: tints.chip.chat.background,
      border: tints.chip.chat.text,
      text: tints.chip.chat.text,
    },
    gifts: {
      fill: tints.chip.video.background,
      border: tints.chip.video.text,
      text: tints.chip.video.text,
    },
  }[wall.key];

  return (
    <View style={[styles.panel, { backgroundColor: palette.fill, borderColor: palette.border }]}>
      <View style={styles.bannerWrap} pointerEvents="none">
        <View
          style={[
            styles.banner,
            { backgroundColor: theme.background, borderColor: palette.border },
          ]}
        >
          <ThemedText type="smallBold" style={{ color: palette.text }}>
            {wall.title}
          </ThemedText>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${wall.title}. ${wall.count} collected. Open all`}
        onPress={() => onOpenCollection(wall)}
        hitSlop={6}
        style={({ pressed }) => [
          styles.countPill,
          { backgroundColor: theme.background, borderColor: palette.border },
          pressed && { opacity: 0.7 },
        ]}
      >
        <ThemedText type="small" style={[styles.countLabel, { color: palette.text }]}>
          {wall.count}
        </ThemedText>
        <Icon name="forward" size={14} strokeWidth={2.6} color={palette.text} />
      </Pressable>

      <View style={styles.entries}>
        {wall.entries.map((entry) => {
          const grade = entry.grade;
          return (
            <Pressable
              key={entry.id}
              accessibilityRole="button"
              accessibilityLabel={[entry.label, grade ? `grade ${grade}` : null, entry.rarity]
                .filter(Boolean)
                .join(', ')}
              onPress={() => onOpenEntry(entry)}
              style={({ pressed }) => [styles.entry, pressed && { opacity: 0.7 }]}
            >
              <View style={styles.tileWrap}>
                <View
                  style={[
                    styles.tile,
                    { backgroundColor: theme.background, borderColor: palette.border },
                  ]}
                >
                  <Icon name={ART[entry.art]} size={26} strokeWidth={1.8} color={palette.text} />
                </View>
                {grade ? (
                  <View
                    style={[
                      styles.grade,
                      { backgroundColor: palette.border, borderColor: palette.fill },
                    ]}
                  >
                    <ThemedText type="small" style={styles.gradeLabel}>
                      {grade}
                    </ThemedText>
                  </View>
                ) : null}
              </View>

              <ThemedText
                type="small"
                style={[styles.entryLabel, { color: palette.text }]}
                numberOfLines={1}
              >
                {entry.label}
              </ThemedText>

              {entry.rarity ? (
                <View style={[styles.rarity, { backgroundColor: theme.background }]}>
                  <ThemedText type="small" style={[styles.rarityLabel, { color: palette.text }]}>
                    {entry.rarity}
                  </ThemedText>
                </View>
              ) : null}
            </Pressable>
          );
        })}

        {Array.from({ length: wall.emptySlots ?? 0 }, (_, index) => (
          <View key={`empty-${index}`} style={styles.entry} importantForAccessibility="no">
            <View
              style={[
                styles.tile,
                styles.emptyTile,
                { borderColor: palette.border, opacity: 0.45 },
              ]}
            >
              <Icon name="star" size={24} strokeWidth={1.6} color={palette.text} />
            </View>
            <ThemedText type="small" style={[styles.entryLabel, { opacity: 0.55 }]}>
              Empty
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: Radius.large,
    borderWidth: 1.5,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.three,
    paddingHorizontal: Spacing.three,
    marginTop: Spacing.four,
  },
  bannerWrap: { position: 'absolute', top: -13, start: 0, end: 0, alignItems: 'center' },
  banner: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.one,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
  },
  countPill: {
    position: 'absolute',
    top: Spacing.two,
    end: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: 1,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  countLabel: { fontWeight: '800' },
  entries: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  entry: { alignItems: 'center', gap: Spacing.one, width: 76 },
  tileWrap: { width: TILE, height: TILE },
  tile: {
    width: TILE,
    height: TILE,
    borderRadius: Radius.medium,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTile: { borderStyle: 'dashed', backgroundColor: 'transparent' },
  grade: {
    position: 'absolute',
    top: -6,
    end: -6,
    minWidth: 20,
    height: 20,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeLabel: { fontSize: 11, lineHeight: 14, fontWeight: '800', color: '#FFFFFF' },
  entryLabel: { fontSize: 11, lineHeight: 15, fontWeight: '700', textAlign: 'center' },
  rarity: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 1,
    borderRadius: Radius.pill,
  },
  rarityLabel: { fontSize: 10, lineHeight: 14, fontWeight: '700' },
});
