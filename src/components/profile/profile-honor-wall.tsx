import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { Radius, Spacing, type HonorTone } from '@/constants/theme';
import type { HonorArt, HonorEntry, HonorWall } from '@/core/data/types';
import { honorGiftFrameSource, honorMedalSource, honorPanelSource } from '@/core/media/images';
import { useColorScheme } from '@/hooks/use-color-scheme';
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

/**
 * Glyph tints, deliberately mid-tone: one value has to read on the pale enamel
 * of the light scheme and the deep enamel of the dark one.
 */
const GLYPH: Record<HonorArt, string> = {
  crown: '#B4791A',
  star: '#8455D6',
  shield: '#2E8B6E',
  trophy: '#C9761F',
  gem: '#CE3F76',
  sparkle: '#B0801F',
  rank: '#2F63C8',
  gift: '#CE3F76',
};

const MEDAL = 56;
const GIFT = 64;
const RIBBON_HEIGHT = 32;

/**
 * The plate is drawn at a fixed height so the three walls read as one set, and
 * the generated art's shelf sits at 168/220 of it. Entries are bottom-aligned to
 * that line, which is what makes the trophies look like they stand on it.
 */
const PANEL_HEIGHT = 152;
const SHELF_Y = Math.round((168 / 220) * PANEL_HEIGHT);

/**
 * Where a row's foot sits: on the shelf, or — for badges, whose name is printed
 * under the medallion — one caption lower, so the label clears the shelf.
 */
const ROW_FOOT = {
  badges: { paddingBottom: PANEL_HEIGHT - SHELF_Y - 15 },
  titles: { paddingBottom: PANEL_HEIGHT - SHELF_Y },
  gifts: { paddingBottom: PANEL_HEIGHT - SHELF_Y },
} as const;

export interface HonorWallProps {
  wall: HonorWall;
  /** Opens the full collection behind this wall. */
  onOpenCollection: (wall: HonorWall) => void;
  onOpenEntry: (entry: HonorEntry) => void;
}

/** One entry's accessible name: the trophy, then the facts the chips show. */
function entryLabel(entry: HonorEntry): string {
  return [entry.label, entry.grade ? `grade ${entry.grade}` : null, entry.rarity]
    .filter(Boolean)
    .join(', ');
}

/**
 * One honour collection — Badges Wall, Titles Wall, Gifts Honor Wall (reference
 * screen 025).
 *
 * The reference frames each wall with ornate metallic art. That art is
 * proprietary, so the framing is our own generated plate (a metal double border,
 * corner filigree and a glass shelf) in three tones, with the trophies drawn as
 * our glyphs inside our own medallion and gift-frame art.
 *
 * What is reproduced is the *structure*: a titled plate, one row of previews
 * standing on a shelf, and a count that opens the full collection. The count is
 * the only control that opens the collection, and each trophy is separately
 * focusable, which keeps the accessibility tree flat — the wall itself is not a
 * button, and the plaque is decoration that repeats the wall's name.
 */
export function HonorWallCard({ wall, onOpenCollection, onOpenEntry }: HonorWallProps) {
  const dark = useColorScheme() === 'dark';
  const tints = useTints();
  const palette = tints.honor[wall.key];

  return (
    <View style={styles.panel}>
      <Image
        source={honorPanelSource(wall.key, dark)}
        style={StyleSheet.absoluteFill}
        contentFit="fill"
        // The plate is decoration; the plaque below carries the wall's name.
        accessible={false}
      />

      <View style={[styles.content, ROW_FOOT[wall.key]]}>
        {wall.key === 'badges' ? (
          <BadgeRow wall={wall} palette={palette} dark={dark} onOpenEntry={onOpenEntry} />
        ) : null}
        {wall.key === 'titles' ? (
          <TitleRow wall={wall} palette={palette} onOpenEntry={onOpenEntry} />
        ) : null}
        {wall.key === 'gifts' ? (
          <GiftRow wall={wall} palette={palette} dark={dark} onOpenEntry={onOpenEntry} />
        ) : null}
      </View>

      <View style={styles.plaqueWrap} pointerEvents="none">
        {/* The plaque's tail: a rotated square whose top half the plaque covers. */}
        <View
          style={[
            styles.tail,
            { backgroundColor: palette.plaque.to, borderColor: palette.plaque.border },
          ]}
        />
        <View style={[styles.plaque, { borderColor: palette.plaque.border }]}>
          <PlaqueFill tone={wall.key} palette={palette} />
          <ThemedText
            type="smallBold"
            numberOfLines={1}
            style={[styles.plaqueLabel, { color: palette.plaque.text }]}
          >
            {wall.title}
          </ThemedText>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${wall.title}. ${wall.count} collected. Open all`}
        onPress={() => onOpenCollection(wall)}
        hitSlop={8}
        style={({ pressed }) => [
          styles.count,
          { backgroundColor: palette.chip.background, borderColor: palette.plaque.border },
          pressed && styles.pressed,
        ]}
      >
        <ThemedText type="small" style={[styles.countLabel, { color: palette.chip.text }]}>
          {wall.count}
        </ThemedText>
        <Icon name="forward" size={13} strokeWidth={2.8} color={palette.chip.text} />
      </Pressable>
    </View>
  );
}

/** The plaque's gradient. The pill outline and clipping are the wrapper's job. */
function PlaqueFill({ tone, palette }: { tone: HonorWall['key']; palette: HonorTone }) {
  const id = `honor-plaque-${tone}`;

  return (
    <Svg style={StyleSheet.absoluteFill} viewBox="0 0 1 1" preserveAspectRatio="none">
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={palette.plaque.from} />
          <Stop offset="1" stopColor={palette.plaque.to} />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="1" height="1" fill={`url(#${id})`} />
    </Svg>
  );
}

interface RowProps {
  wall: HonorWall;
  palette: HonorTone;
  onOpenEntry: (entry: HonorEntry) => void;
}

/** Badges stand on the shelf with their name printed under it. */
function BadgeRow({ wall, palette, dark, onOpenEntry }: RowProps & { dark: boolean }) {
  const medal = honorMedalSource(dark);

  return (
    <View style={styles.row}>
      {wall.entries.map((entry) => (
        <Pressable
          key={entry.id}
          accessibilityRole="button"
          accessibilityLabel={entryLabel(entry)}
          onPress={() => onOpenEntry(entry)}
          style={({ pressed }) => [styles.badge, pressed && styles.pressed]}
        >
          <View style={styles.medal}>
            <Image
              source={medal}
              style={StyleSheet.absoluteFill}
              contentFit="contain"
              accessible={false}
            />
            <View style={styles.glyph}>
              <Icon name={ART[entry.art]} size={26} strokeWidth={2.1} color={GLYPH[entry.art]} />
            </View>
          </View>
          <ThemedText
            type="small"
            numberOfLines={1}
            style={[styles.caption, { color: palette.caption }]}
          >
            {entry.label}
          </ThemedText>
        </Pressable>
      ))}

      {Array.from({ length: wall.emptySlots ?? 0 }, (_, index) => (
        <View
          key={`empty-${index}`}
          testID="honor-empty-slot"
          style={[styles.badge, styles.emptyBadge]}
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
        >
          <View style={styles.medal}>
            <Image
              source={medal}
              style={[StyleSheet.absoluteFill, styles.faded]}
              contentFit="contain"
              accessible={false}
            />
            <View style={styles.glyph}>
              <Icon name="diamonds" size={24} strokeWidth={1.8} color={palette.slot.text} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

/** Titles are text, so they are ribbons; an empty title is a crown pill. */
function TitleRow({ wall, palette, onOpenEntry }: RowProps) {
  return (
    <View style={styles.row}>
      {wall.entries.map((entry) => (
        <Pressable
          key={entry.id}
          accessibilityRole="button"
          accessibilityLabel={entryLabel(entry)}
          onPress={() => onOpenEntry(entry)}
          style={({ pressed }) => [styles.titleEntry, pressed && styles.pressed]}
        >
          <View style={[styles.ribbon, { borderColor: palette.ribbon.border }]}>
            <RibbonFill tone={wall.key} palette={palette} />
            <ThemedText
              type="smallBold"
              numberOfLines={1}
              style={[styles.ribbonLabel, { color: palette.ribbon.text }]}
            >
              {entry.label}
            </ThemedText>
          </View>
        </Pressable>
      ))}

      {Array.from({ length: wall.emptySlots ?? 0 }, (_, index) => (
        <View
          key={`empty-${index}`}
          testID="honor-empty-slot"
          style={[styles.titleSlot, styles.crownSlot, { borderColor: palette.slot.border }]}
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
        >
          <Icon name="crown" size={15} strokeWidth={2} color={palette.slot.text} />
        </View>
      ))}
    </View>
  );
}

function RibbonFill({ tone, palette }: { tone: HonorWall['key']; palette: HonorTone }) {
  const id = `honor-ribbon-${tone}`;

  return (
    <Svg style={StyleSheet.absoluteFill} viewBox="0 0 1 1" preserveAspectRatio="none">
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={palette.ribbon.from} />
          <Stop offset="1" stopColor={palette.ribbon.to} />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="1" height="1" fill={`url(#${id})`} />
    </Svg>
  );
}

/**
 * Gifts are framed plaques: the glyph is the gift, the grade chip is its band
 * and the rarity chip overhangs the plaque's foot — the reference's arrangement.
 */
function GiftRow({ wall, palette, dark, onOpenEntry }: RowProps & { dark: boolean }) {
  const frame = honorGiftFrameSource(dark);

  return (
    <View style={styles.row}>
      {wall.entries.map((entry) => (
        <Pressable
          key={entry.id}
          accessibilityRole="button"
          accessibilityLabel={entryLabel(entry)}
          onPress={() => onOpenEntry(entry)}
          style={({ pressed }) => [styles.giftSlot, pressed && styles.pressed]}
        >
          <View style={styles.gift}>
            <Image
              source={frame}
              style={StyleSheet.absoluteFill}
              contentFit="fill"
              accessible={false}
            />
            <View style={styles.glyph}>
              <Icon name={ART[entry.art]} size={25} strokeWidth={2.1} color={GLYPH[entry.art]} />
            </View>
          </View>

          {entry.grade ? (
            <View style={[styles.grade, { backgroundColor: palette.grade.background }]}>
              <ThemedText type="small" style={[styles.gradeLabel, { color: palette.grade.text }]}>
                {entry.grade}
              </ThemedText>
            </View>
          ) : null}

          {entry.rarity ? (
            <View style={styles.rarityWrap}>
              <View style={[styles.rarity, { backgroundColor: palette.rarity.background }]}>
                <ThemedText
                  type="small"
                  style={[styles.rarityLabel, { color: palette.rarity.text }]}
                >
                  {entry.rarity}
                </ThemedText>
              </View>
            </View>
          ) : null}
        </Pressable>
      ))}

      {Array.from({ length: wall.emptySlots ?? 0 }, (_, index) => (
        <View
          key={`empty-${index}`}
          testID="honor-empty-slot"
          style={styles.giftSlot}
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
        >
          <View style={styles.gift}>
            <Image
              source={frame}
              style={[StyleSheet.absoluteFill, styles.faded]}
              contentFit="fill"
              accessible={false}
            />
            <View style={styles.glyph}>
              <Icon name="gift" size={24} strokeWidth={1.8} color={palette.slot.text} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    height: PANEL_HEIGHT,
    borderRadius: Radius.xlarge,
    marginTop: Spacing.five,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.four,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: Spacing.two,
  },

  plaqueWrap: {
    position: 'absolute',
    top: -16,
    start: 0,
    end: 0,
    alignItems: 'center',
  },
  tail: {
    position: 'absolute',
    bottom: -4,
    start: '50%',
    marginStart: -5,
    width: 10,
    height: 10,
    borderRadius: 1,
    borderWidth: 2,
    transform: [{ rotate: '45deg' }],
  },
  plaque: {
    height: 36,
    minWidth: 132,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: Radius.pill,
    // The fill is a stretched Svg; clipping it is what makes the pill.
    overflow: 'hidden',
  },
  plaqueLabel: { fontSize: 12, lineHeight: 16, letterSpacing: 0.3 },

  count: {
    position: 'absolute',
    top: 12,
    end: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingStart: Spacing.two,
    paddingEnd: Spacing.one,
    height: 26,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
  },
  countLabel: { fontSize: 12, lineHeight: 16, fontWeight: '800' },

  badge: { alignItems: 'center', width: 78, height: MEDAL + 17, gap: 1 },
  emptyBadge: { opacity: 0.75 },
  medal: { width: MEDAL, height: MEDAL, alignItems: 'center', justifyContent: 'center' },
  glyph: { zIndex: 2, alignItems: 'center', justifyContent: 'center' },
  faded: { opacity: 0.45 },
  caption: { fontSize: 11, lineHeight: 14, fontWeight: '700', maxWidth: 78 },

  /*
   * A ribbon is as wide as its own title, capped so one long label cannot push
   * the crowns out of the panel; the empty crown pills share the space that is
   * left. Three equal thirds would truncate every real title.
   *
   * Neither slot carries a `maxWidth`: in a column whose width is resolved from
   * its content, a capped flex child still contributes that cap to the row's
   * intrinsic width, which stretched every wall past the screen edge.
   */
  titleEntry: { flexShrink: 1, maxWidth: 150, height: RIBBON_HEIGHT },
  titleSlot: { flex: 1, height: RIBBON_HEIGHT },
  ribbon: {
    flex: 1,
    height: RIBBON_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.two,
    borderWidth: 2,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  ribbonLabel: { fontSize: 12, lineHeight: 16, textAlign: 'center' },
  crownSlot: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: Radius.pill,
  },

  giftSlot: { width: GIFT + 8, height: GIFT },
  gift: { width: GIFT, height: GIFT, alignItems: 'center', justifyContent: 'center' },
  grade: {
    position: 'absolute',
    top: -5,
    start: -3,
    minWidth: 19,
    height: 19,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  gradeLabel: { fontSize: 11, lineHeight: 14, fontWeight: '800' },
  rarityWrap: { position: 'absolute', bottom: -9, start: 0, end: 0, alignItems: 'center' },
  rarity: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 1,
    borderRadius: Radius.pill,
  },
  rarityLabel: { fontSize: 10, lineHeight: 14, fontWeight: '800' },

  pressed: { opacity: 0.75 },
});
