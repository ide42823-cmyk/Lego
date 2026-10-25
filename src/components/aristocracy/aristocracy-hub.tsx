import { useId, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ScrollViewInstance,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { Radius } from '@/constants/theme';
import type {
  AristocracyHub,
  AristocracyPrivilegeGlyph,
  AristocracyRank,
} from '@/core/data/types';

import { GradientFill } from '../ui/gradient-fill';
import { Icon, type IconName } from '../ui/icon';
import { AristocracyEmblem } from './aristocracy-emblem';

/**
 * The aristocracy page keeps the reference's night-and-gold identity in both
 * colour schemes, so its palette is fixed here.
 */
const INK = {
  heroTop: '#201A13',
  heroBottom: '#0C0A08',
  gold: '#D8B25E',
  goldSoft: '#EFD9A8',
  goldDeep: '#A8802F',
  tabMuted: '#8B7A5F',
  sheet: '#FFFFFF',
  sheetInk: '#A8802F',
  tileFrom: '#FBE6D4',
  tileTo: '#F3C7A8',
  tileInk: '#8A5A2B',
  tileLockedInk: '#C9BCA6',
  priceInk: '#6B5334',
  divider: '#EFE7DA',
  buttonFrom: '#D9B45E',
  buttonTo: '#B4862C',
  onButton: '#FFFFFF',
  heldChip: '#EFE7DA',
  heldInk: '#8B7A5F',
} as const;

/** One meaning per privilege tile — the reference's product renders stay out. */
const GLYPHS: Record<AristocracyPrivilegeGlyph, IconName> = {
  label: 'crown',
  badge: 'verified',
  frame: 'image',
  entry: 'sparkle',
  vehicle: 'vehicle',
  'room-lock': 'lock',
  filter: 'filter',
  'name-card': 'id-card',
  gifts: 'gift',
  incognito: 'incognito',
  invisible: 'eye-off',
  bubble: 'comment',
  'full-room': 'house',
  distance: 'address',
  stealth: 'ghost',
  'invisible-entry': 'door',
  'golden-name': 'id-card',
  nickname: 'pencil',
  'anti-ban': 'shield',
  'kick-protection': 'user-block',
};

export interface AristocracyHubViewProps {
  hub: AristocracyHub;
  onBack: () => void;
  /** The help sheet is a backend surface. */
  onHelp: () => void;
  /** Activation spends coins, so the page owns that gate. */
  onActivate: (rank: AristocracyRank) => void;
}

/**
 * The aristocracy page (references 038/039).
 *
 * One shared privilege catalogue sits under a five-rung rank ladder: the tabs
 * and the emblem pick the rung, the sheet counts how many tiles that rung holds
 * (the server's figure) and dims every tile whose unlock rung is above it, and
 * the fixed footer carries that rung's price and its Activate control.
 *
 * Prices, unlock rungs and the held rank are server-owned entitlement data.
 * Activate spends coins, so it reports to the page's gate instead of granting a
 * title here.
 */
export function AristocracyHubView({
  hub,
  onBack,
  onHelp,
  onActivate,
}: AristocracyHubViewProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();

  const [selectedKey, setSelectedKey] = useState(
    hub.currentRank ?? hub.ranks[0]?.key ?? '',
  );
  // A soft radial wash behind the crest, so the hero reads as a lit stage
  // rather than a flat panel.
  const glowId = `aristo-glow-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  // The tab row is wider than a phone once all six rungs are drawn, so the
  // selected rung is scrolled into view - the references show the row panned to
  // the right when Duke or King is selected.
  const tabsRef = useRef<ScrollViewInstance>(null);
  const tabOffsets = useRef<Record<string, number>>({});
  const tabWidths = useRef<Record<string, number>>({});
  const tabsViewport = useRef(0);
  const revealed = useRef(false);

  const selectedIndex = Math.max(
    0,
    hub.ranks.findIndex((rank) => rank.key === selectedKey),
  );
  const selected = hub.ranks[selectedIndex] ?? hub.ranks[0];

  if (!selected) {
    return null;
  }

  const rankIndex = (key: string) => hub.ranks.findIndex((rank) => rank.key === key);
  const rankLabel = (key: string) => hub.ranks[rankIndex(key)]?.label ?? key;
  const held = hub.currentRank === selected.key;

  /** Pans the tab row just far enough to keep the chosen rung fully visible. */
  const revealRank = (key: string) => {
    const viewport = tabsViewport.current || windowWidth;
    const x = tabOffsets.current[key];
    const width = tabWidths.current[key];
    if (x === undefined || width === undefined) {
      return;
    }
    tabsRef.current?.scrollTo({
      x: Math.max(0, x + width + 20 - viewport),
      animated: true,
    });
  };

  // The reference's emblem is the tallest fixed element; on short phones it
  // gives up height so the sheet still shows two full rows of privileges.
  const emblemSize = windowHeight < 720 ? 128 : 168;
  const tileWidth = Math.min(150, Math.floor((windowWidth - 36 - 20) / 3));

  return (
    <View style={styles.root}>
      <View style={styles.hero}>
        <GradientFill vertical from={INK.heroTop} to={INK.heroBottom} />

        {/*
          The reference's hero is a lit night sky: a soft gold glow behind the
          crest with three faint diagonal streaks across it. Both are drawn
          here rather than baked into an image.
        */}
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Svg width={340} height={340} style={styles.glow}>
            <Defs>
              <RadialGradient id={glowId} cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor="#D8B25E" stopOpacity={0.22} />
                <Stop offset="1" stopColor="#D8B25E" stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Circle cx={170} cy={170} r={170} fill={`url(#${glowId})`} />
          </Svg>
          <View style={[styles.streak, styles.streakA]} />
          <View style={[styles.streak, styles.streakB]} />
          <View style={[styles.streak, styles.streakC]} />
        </View>

        <View style={[styles.tabs, { paddingTop: insets.top + 56 }]}>
          <ScrollView
            ref={tabsRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsRow}
            onLayout={(event) => {
              tabsViewport.current = event.nativeEvent.layout.width;
            }}
            onContentSizeChange={() => {
              if (revealed.current) {
                return;
              }
              revealed.current = true;
              revealRank(selected.key);
            }}
          >
            {hub.ranks.map((rank) => {
              const active = rank.key === selected.key;
              return (
                <Pressable
                  key={rank.key}
                  accessibilityRole="radio"
                  accessibilityLabel={`Rank ${rank.label}`}
                  accessibilityState={{ checked: active }}
                  onLayout={(event) => {
                    tabOffsets.current[rank.key] = event.nativeEvent.layout.x;
                    tabWidths.current[rank.key] = event.nativeEvent.layout.width;
                  }}
                  onPress={() => {
                    setSelectedKey(rank.key);
                    revealRank(rank.key);
                  }}
                  style={styles.tab}
                >
                  <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                    {rank.label}
                  </Text>
                  <View style={[styles.tabDash, active && styles.tabDashActive]} />
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.heroBody}>
          <AristocracyEmblem rank={selected.key} size={emblemSize} />
          <Text style={styles.rankName}>{selected.label}</Text>
        </View>
      </View>

      <View style={styles.sheet}>
        <View style={styles.sheetHeader}>
          <Icon name="laurel-left" size={16} color={INK.goldDeep} strokeWidth={1.6} />
          <Text style={styles.sheetTitle}>
            {`Exclusive Privileges ${selected.unlockedCount}/${hub.privileges.length}`}
          </Text>
          <Icon name="laurel-right" size={16} color={INK.goldDeep} strokeWidth={1.6} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.grid}
        >
          {hub.privileges.map((privilege) => {
            const locked = rankIndex(privilege.unlockRank) > selectedIndex;
            return (
              <View
                key={privilege.id}
                accessible
                accessibilityLabel={
                  locked
                    ? `${privilege.label}. Unlocks at ${rankLabel(privilege.unlockRank)}`
                    : privilege.label
                }
                style={[styles.tile, { width: tileWidth }]}
              >
                <View style={styles.tileArt}>
                  <GradientFill
                    from={INK.tileFrom}
                    to={INK.tileTo}
                    radius={20}
                    style={locked ? styles.tileArtLocked : undefined}
                  />
                  {/*
                    Positioned so the glyph paints above `GradientFill`: on web
                    an absolutely positioned sibling paints after in-flow
                    content, whatever the order.
                  */}
                  <View style={styles.tileGlyph}>
                    <Icon
                      name={GLYPHS[privilege.glyph]}
                      size={28}
                      color={locked ? INK.tileLockedInk : INK.tileInk}
                      strokeWidth={1.7}
                    />
                  </View>
                </View>
                <Text
                  numberOfLines={2}
                  style={[styles.tileLabel, locked && styles.tileLabelLocked]}
                >
                  {privilege.label}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
          <View style={styles.price}>
            <Icon name="coin" size={18} color={INK.goldDeep} strokeWidth={2} />
            <Text style={styles.priceLabel}>
              {`${selected.priceCoins} Coins/${selected.validityDays} days`}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={held ? `${selected.label} is active` : `Activate ${selected.label}`}
            accessibilityState={{ disabled: held }}
            disabled={held}
            onPress={() => onActivate(selected)}
            style={({ pressed }) => [
              styles.activate,
              held && styles.activateHeld,
              pressed && { opacity: 0.88 },
            ]}
          >
            {held ? null : (
              <GradientFill from={INK.buttonFrom} to={INK.buttonTo} radius={Radius.pill} />
            )}
            <Text style={[styles.activateLabel, held && styles.activateLabelHeld]}>
              {held ? 'Active' : 'Activate'}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={[styles.topBar, { paddingTop: insets.top + 6, height: insets.top + 50 }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={onBack}
          style={styles.iconButton}
        >
          <Icon name="back" size={22} color={INK.goldSoft} />
        </Pressable>
        <Text style={styles.topTitle}>Aristocracy</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Aristocracy help"
          hitSlop={10}
          onPress={onHelp}
          style={styles.iconButton}
        >
          <Icon name="help" size={21} color={INK.goldSoft} strokeWidth={1.8} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: INK.heroBottom },

  hero: { overflow: 'hidden' },
  glow: {
    position: 'absolute',
    top: 52,
    left: '50%',
    marginLeft: -170,
  },
  streak: {
    position: 'absolute',
    width: 460,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(216, 178, 94, 0.16)',
    transform: [{ rotate: '-14deg' }],
  },
  streakA: { top: 96, left: -48 },
  streakB: { top: 178, left: -18 },
  streakC: { top: 262, left: -58 },

  tabs: { paddingBottom: 4 },
  tabsRow: { paddingHorizontal: 20, columnGap: 26, alignItems: 'flex-start' },
  tab: { paddingTop: 6, paddingBottom: 4, alignItems: 'center' },
  tabLabel: { fontSize: 15, fontWeight: '500', color: INK.tabMuted },
  tabLabelActive: { color: '#F6EBD4', fontWeight: '600' },
  tabDash: { width: 16, height: 2, borderRadius: 1, marginTop: 7, backgroundColor: 'transparent' },
  tabDashActive: { backgroundColor: INK.gold },

  heroBody: { alignItems: 'center', paddingTop: 10, paddingBottom: 40 },
  rankName: {
    marginTop: 6,
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 1.6,
    color: INK.gold,
  },

  sheet: {
    flex: 1,
    marginTop: -22,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    backgroundColor: INK.sheet,
    overflow: 'hidden',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 8,
    paddingTop: 18,
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  sheetTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
    color: INK.sheetInk,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    columnGap: 10,
    rowGap: 20,
    paddingHorizontal: 18,
    paddingTop: 2,
    paddingBottom: 18,
  },
  tile: { alignItems: 'center' },
  tileArt: {
    width: 68,
    height: 68,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tileArtLocked: { opacity: 0.5 },
  tileGlyph: { position: 'relative' },
  tileLabel: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    color: INK.tileInk,
  },
  tileLabelLocked: { color: INK.tileLockedInk },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: INK.divider,
    backgroundColor: INK.sheet,
  },
  price: { flexDirection: 'row', alignItems: 'center', columnGap: 6 },
  priceLabel: { fontSize: 14, fontWeight: '500', color: INK.priceInk },
  activate: {
    minWidth: 118,
    height: 44,
    paddingHorizontal: 24,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  activateHeld: { backgroundColor: INK.heldChip },
  activateLabel: { fontSize: 15, fontWeight: '700', color: INK.onButton },
  activateLabelHeld: { color: INK.heldInk },

  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: { fontSize: 17, fontWeight: '600', color: '#FFFFFF' },
});
