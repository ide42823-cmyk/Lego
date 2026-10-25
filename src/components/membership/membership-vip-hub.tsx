import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import { DISPLAY_FAMILY } from '@/constants/typography';
import type {
  MembershipBenefit,
  MembershipBenefitGlyph,
  MembershipFamilyKey,
  MembershipStoreItem,
  MembershipVipHub,
} from '@/core/data/types';
import { imageSource } from '@/core/media/images';

import { GradientFill } from '../ui/gradient-fill';
import { Icon, type IconName } from '../ui/icon';
import { MembershipBadge } from './membership-badge';

/**
 * The VIP page keeps the reference's warm premium identity, independent of the
 * colour scheme, so the palette is fixed here.
 */
const INK = {
  page: '#0D0907',
  card: '#241A13',
  cardLocked: '#211811',
  cardBorder: 'rgba(201, 169, 110, 0.10)',
  panel: '#221812',
  cream: '#F5E9D6',
  creamSoft: '#E7D8C3',
  muted: '#8B7A68',
  dim: '#6E6154',
  gold: '#E8B54A',
  goldSoft: '#EFC98A',
  rail: 'rgba(201, 169, 110, 0.4)',
  storeBorder: 'rgba(232, 181, 74, 0.5)',
  storeBorderSoft: 'rgba(232, 181, 74, 0.22)',
  rechargeFrom: '#F9DFB9',
  rechargeTo: '#F0BE86',
  rechargeText: '#3A2416',
  lockChip: 'rgba(118, 110, 102, 0.35)',
} as const;

const FAMILIES: readonly { key: MembershipFamilyKey; label: string }[] = [
  { key: 'vip', label: 'VIP' },
  { key: 'svip', label: 'SVIP' },
];

const GLYPHS: Record<MembershipBenefitGlyph, IconName> = {
  eye: 'eye',
  'user-check': 'user-check',
  house: 'house',
  crown: 'crown',
  image: 'image',
  store: 'store',
  filter: 'filter',
  pencil: 'pencil',
  gift: 'gift',
  friends: 'friends',
  silence: 'ghost',
};

/** Our own art for store categories — the reference's product renders stay out. */
const CATEGORY_GLYPHS: Record<string, IconName> = {
  Vehicles: 'gift',
  Frames: 'crown',
};

/** Rung order helper: "VIP7" → 7. Labels are server strings, never computed copy. */
function rungScore(label: string): number {
  const digits = label.replace(/\D/g, '');
  return digits ? Number(digits) : 0;
}

function formatXp(xp: number): string {
  // The reference prints the server figure as raw digits ("16000", "8742264000");
  // grouping separators would be our formatting, not the server's value.
  return String(xp);
}

export interface MembershipVipHubViewProps {
  hub: MembershipVipHub;
  onBack: () => void;
  onFamilyChange: (family: MembershipFamilyKey) => void;
  /** Recharge starts a purchase; the page owns that gate. */
  onRecharge: () => void;
  /** A store item press; the page owns the purchase gate. */
  onBuy: (item: MembershipStoreItem) => void;
  /** Help and View More are backend surfaces. */
  onHelp: () => void;
  onViewMore: () => void;
}

/**
 * The VIP family's page (references 045-050): a warm hero row (viewer identity,
 * the selected rung's requirement, the crest with its Locked/Current chip and
 * the Recharge entry), a windowed level rail with diamond markers, the
 * reference's "VIPn Benefits (x/17)" matrix as a three-column grid whose lock
 * chips derive from the viewed rung, an Expand More / Pack up control, then
 * VIPStore, the points row and the store grid.
 *
 * The ladder, the XP targets, the unlock rungs, the points and every price are
 * server-owned entitlement data. Nothing on this page grants a tier, spends
 * points or starts a purchase — those presses report to the page's gate.
 */
export function MembershipVipHubView({
  hub,
  onBack,
  onFamilyChange,
  onRecharge,
  onBuy,
  onHelp,
  onViewMore,
}: MembershipVipHubViewProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  const [selectedLevel, setSelectedLevel] = useState(hub.currentLevel);
  const [expanded, setExpanded] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const selectedIndex = Math.max(
    0,
    hub.levels.findIndex((level) => level.label === selectedLevel),
  );
  const selectedTier = hub.levels[selectedIndex] ?? hub.levels[0];

  if (!selectedTier) {
    return null;
  }

  // The rail always shows five rungs, centred on the viewed one and clamped to
  // the ladder's ends, exactly like the reference's five-marker rail.
  const windowStart = Math.max(0, Math.min(selectedIndex - 2, hub.levels.length - 5));
  const windowLevels = hub.levels.slice(windowStart, windowStart + 5);

  // The supplied backdrop's presence climbs with the rung: a third at VIP1-4,
  // two thirds at VIP5-8, the full scene from VIP9 up.
  const backdropOpacity = selectedIndex <= 3 ? 0.33 : selectedIndex <= 7 ? 0.66 : 1;

  const reached = rungScore(selectedTier.label);
  const unlockedCount = hub.benefits.filter(
    (benefit) => rungScore(benefit.unlockLevel) <= reached,
  ).length;
  const shownBenefits = expanded ? hub.benefits : hub.benefits.slice(0, 6);
  const held = selectedTier.label === hub.currentLevel;

  // The entry rung's line is the reference's own copy; when the viewer already
  // holds that rung it says what a recharge actually does for them.
  const requirement =
    selectedTier.xp === 0
      ? held
        ? 'Recharge any amount to keep VIP!'
        : 'Recharge any amount, become VIP!'
      : `Reach ${formatXp(selectedTier.xp)} VIP XP`;
  const unlockHint = selectedTier.xp === 0 ? null : `Unlock ${selectedTier.label}`;

  return (
    <View style={styles.root}>
      {/*
        The project owner's backdrop runs the full screen behind every section,
        so the beam and the plinth are one continuous scene rather than a hero
        panel. Its presence climbs with the rung, and the wash below hands the
        lower page back to near-black so the rail and the store stay legible.
      */}
      <Image
        source={imageSource(hub.hero.backgroundUrl)}
        style={[StyleSheet.absoluteFill, { opacity: backdropOpacity }]}
        contentFit="cover"
        contentPosition="top"
      />
      <GradientFill
        vertical
        from="rgba(13, 9, 7, 0)"
        to={INK.page}
        style={{ height: windowHeight * 0.42, bottom: 'auto' }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={(event) => setScrolled(event.nativeEvent.contentOffset.y > 24)}
        scrollEventThrottle={48}
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.six }}
      >
        <View style={[styles.hero, { paddingTop: insets.top + 56 }]}>
          <View style={styles.heroRow}>
            <View style={styles.heroLeft}>
              <View style={styles.identity}>
                <Image
                  source={imageSource(hub.hero.avatarUrl)}
                  style={styles.avatar}
                  contentFit="cover"
                />
                <Text numberOfLines={1} style={styles.heroName}>
                  {hub.hero.displayName}
                </Text>
                {hub.hero.heart ? (
                  <Icon name="heart" size={16} color={INK.cream} fill={INK.cream} />
                ) : null}
              </View>
              <Text style={styles.requirement}>{requirement}</Text>
              {unlockHint ? <Text style={styles.unlockHint}>{unlockHint}</Text> : null}
            </View>

            <View style={styles.heroRight}>
              <MembershipBadge level={selectedTier.label} width={124} />
              <View style={styles.lockChip}>
                <Icon name={held ? 'verified' : 'lock'} size={11} color={INK.cream} />
                <Text style={styles.lockChipText}>{held ? 'Current' : 'Locked'}</Text>
              </View>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Recharge"
            accessibilityHint="States whether purchases are available yet"
            onPress={onRecharge}
            style={({ pressed }) => [styles.recharge, pressed && { opacity: 0.85 }]}
          >
            <GradientFill from={INK.rechargeFrom} to={INK.rechargeTo} radius={12} />
            <Text style={styles.rechargeLabel}>Recharge</Text>
          </Pressable>
        </View>

        <View style={styles.rail}>
          <View style={styles.railLine} />
          {windowLevels.map((level) => {
            const active = level.label === selectedTier.label;
            return (
              <Pressable
                key={level.label}
                accessibilityRole="radio"
                accessibilityLabel={`Level ${level.label}`}
                accessibilityState={{ checked: active }}
                onPress={() => setSelectedLevel(level.label)}
                style={styles.railItem}
              >
                <View style={[styles.marker, active && styles.markerActive]} />
                <Text style={[styles.railLabel, active && styles.railLabelActive]}>
                  {level.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.benefitsHeader}>
          <Icon name="sparkle" size={13} color={INK.muted} />
          <Text style={styles.benefitsTitle}>
            {`${selectedTier.label} Benefits (${unlockedCount}/${hub.benefits.length})`}
          </Text>
          <Icon name="sparkle" size={13} color={INK.muted} />
        </View>

        <View style={styles.benefitGrid}>
          {shownBenefits.map((benefit) => {
            const locked = rungScore(benefit.unlockLevel) > reached;
            return (
              <View
                key={benefit.id}
                accessible
                accessibilityLabel={
                  locked ? `${benefit.label}. Locked until ${benefit.unlockLevel}` : benefit.label
                }
                style={[styles.benefitCard, locked && styles.benefitCardLocked]}
              >
                <View style={styles.benefitArt}>
                  <View style={locked ? styles.artDimmed : undefined}>
                    <BenefitArt benefit={benefit} level={selectedTier.label} />
                  </View>
                  {locked ? (
                    <View style={styles.lockBadge}>
                      <Icon name="lock" size={10} color={INK.cream} />
                      <Text style={styles.lockBadgeText}>{benefit.unlockLevel}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.benefitLabel}>{benefit.label}</Text>
              </View>
            );
          })}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={expanded ? 'Pack up' : 'Expand More'}
          onPress={() => setExpanded((open) => !open)}
          style={({ pressed }) => [styles.expandControl, pressed && { opacity: 0.75 }]}
        >
          <Text style={styles.expandLabel}>{expanded ? 'Pack up' : 'Expand More'}</Text>
          <View style={expanded ? styles.chevronUp : styles.chevronDown} pointerEvents="none">
            <Icon name="expand" size={16} color={INK.creamSoft} strokeWidth={2} />
          </View>
        </Pressable>

        <View style={styles.storeHeader}>
          <Text style={styles.storeTitle}>{`${hub.family.toUpperCase()}Store`}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View more store items"
            onPress={onViewMore}
            style={({ pressed }) => [styles.viewMore, pressed && { opacity: 0.75 }]}
          >
            <Text style={styles.viewMoreLabel}>View More</Text>
            <Icon name="forward" size={16} color={INK.muted} strokeWidth={2} />
          </Pressable>
        </View>

        <View style={styles.pointsPanel}>
          <View style={styles.pointsLeft}>
            <Text style={styles.pointsLabel}>My Points</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="What are membership points"
              onPress={onHelp}
              style={({ pressed }) => [styles.helpDot, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.helpDotMark}>?</Text>
            </Pressable>
          </View>
          <View style={styles.pointsValue}>
            <Icon name="diamonds" size={16} color={INK.gold} strokeWidth={1.8} />
            <Text style={styles.pointsAmount}>{hub.points}</Text>
          </View>
        </View>

        <View style={styles.storeGrid}>
          {hub.store.map((item) => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={`${item.category}. ${item.price} points for ${item.validityDays} days${
                item.requiredLevel ? `, needs ${item.requiredLevel}` : ''
              }`}
              onPress={() => onBuy(item)}
              style={({ pressed }) => [styles.storeCard, pressed && { opacity: 0.85 }]}
            >
              <View style={styles.cardTop}>
                {item.requiredLevel ? (
                  <View style={styles.cardChip}>
                    <GradientFill from={INK.gold} to="#8A5A1E" radius={6} />
                    <Text style={styles.cardChipLabel}>{item.requiredLevel}</Text>
                  </View>
                ) : (
                  <View />
                )}
                <Icon name="share" size={17} color={INK.muted} strokeWidth={1.8} />
              </View>
              <View style={styles.cardArt}>
                <Icon
                  name={CATEGORY_GLYPHS[item.category] ?? 'gift'}
                  size={46}
                  color={INK.gold}
                  strokeWidth={1.5}
                />
              </View>
              <Text style={styles.cardCategory}>{item.category}</Text>
              <View style={styles.cardMeta}>
                <View style={styles.cardPrice}>
                  <Icon name="diamonds" size={15} color={INK.gold} strokeWidth={1.8} />
                  <Text style={styles.cardPriceLabel}>{item.price}</Text>
                </View>
                <Text style={styles.cardValidity}>{`${item.validityDays} Day`}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.topBar, scrolled && styles.topBarSolid, { paddingTop: insets.top + 6 }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={onBack}
          style={({ pressed }) => [styles.control, pressed && { opacity: 0.7 }]}
        >
          <Icon name="back" size={22} color={INK.cream} strokeWidth={2} />
        </Pressable>
        <View style={styles.familyTabs}>
          {FAMILIES.map((family) => {
            const active = family.key === hub.family;
            return (
              <Pressable
                key={family.key}
                accessibilityRole="radio"
                accessibilityLabel={family.label}
                accessibilityState={{ checked: active }}
                onPress={() => onFamilyChange(family.key)}
                style={({ pressed }) => [styles.familyTab, pressed && { opacity: 0.8 }]}
              >
                <Text
                  style={[
                    styles.familyLabel,
                    active ? styles.familyLabelActive : styles.familyLabelIdle,
                  ]}
                >
                  {family.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.topControls}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Records"
            onPress={onViewMore}
            style={({ pressed }) => [styles.control, pressed && { opacity: 0.7 }]}
          >
            <Icon name="records" size={22} color={INK.cream} strokeWidth={1.8} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Help"
            onPress={onHelp}
            style={({ pressed }) => [styles.control, pressed && { opacity: 0.7 }]}
          >
            <View style={styles.helpCircle}>
              <Text style={styles.helpCircleMark}>?</Text>
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/**
 * One benefit tile's art. Plain glyph tiles share one size; composed tiles
 * (the level capsule, the crest, the entry ribbons and the two room cards) are
 * our own geometry at the same visual weight.
 */
function BenefitArt({ benefit, level }: { benefit: MembershipBenefit; level: string }) {
  if (benefit.art === 'label') {
    return (
      <View style={styles.labelArt}>
        <GradientFill from="#F4CE84" to="#C4882B" radius={999} />
        <Icon name="crown" size={12} color="#4A2C08" strokeWidth={2} />
        <Text style={styles.labelArtText}>{level}</Text>
      </View>
    );
  }

  if (benefit.art === 'crest') {
    return <MembershipBadge level={level} width={62} />;
  }

  if (benefit.art === 'entry') {
    return (
      <View style={styles.entryArt}>
        <View style={styles.entryRibbonWide}>
          <GradientFill from="#F4CE84" to="#C4882B" radius={999} />
          <Text style={styles.entryText}>{level}</Text>
        </View>
        <View style={styles.entryRibbonNarrow}>
          <Text style={styles.entryTextSmall}>Joined</Text>
        </View>
      </View>
    );
  }

  if (benefit.art === 'room-followed' || benefit.art === 'room-joined') {
    return (
      <View style={styles.roomArt}>
        <Icon name="house" size={34} color={INK.goldSoft} strokeWidth={1.8} />
        <View style={styles.roomBadge}>
          <Icon
            name={benefit.art === 'room-followed' ? 'check' : 'plus'}
            size={9}
            color="#3A2416"
            strokeWidth={3}
          />
        </View>
      </View>
    );
  }

  if (benefit.art === 'gift-art') {
    return (
      <View style={styles.giftArt}>
        <Icon name="sparkle" size={22} color={INK.goldSoft} strokeWidth={1.6} />
        <Icon name="gift" size={26} color={INK.goldSoft} strokeWidth={1.6} />
      </View>
    );
  }

  return (
    <Icon
      name={benefit.glyph ? GLYPHS[benefit.glyph] : 'sparkle'}
      size={38}
      color={INK.goldSoft}
      strokeWidth={1.7}
    />
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: INK.page,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
    paddingBottom: Spacing.three,
  },
  /** Once the hero scrolls away the bar takes the page colour, as in the reference. */
  topBarSolid: {
    backgroundColor: INK.page,
  },
  control: {
    padding: Spacing.one,
  },
  familyTabs: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.five,
  },
  familyTab: {
    paddingVertical: Spacing.one,
  },
  familyLabel: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '800',
  },
  familyLabelActive: {
    color: INK.cream,
  },
  familyLabelIdle: {
    color: INK.dim,
  },
  topControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  helpCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: INK.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpCircleMark: {
    color: INK.cream,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
  },
  hero: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    position: 'relative',
    overflow: 'hidden',
    // Tall enough for the backdrop's plinth rim to sit above the rail, as in
    // the reference frames.
    minHeight: 356,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  heroLeft: {
    flex: 1,
    paddingTop: Spacing.two,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(245, 233, 214, 0.25)',
  },
  heroName: {
    color: INK.cream,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    flexShrink: 1,
  },
  requirement: {
    color: INK.creamSoft,
    fontSize: 14,
    lineHeight: 20,
    marginTop: Spacing.three,
  },
  unlockHint: {
    color: INK.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  heroRight: {
    alignItems: 'center',
    gap: 4,
    marginLeft: Spacing.one,
    marginTop: 72,
  },
  lockChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: INK.lockChip,
  },
  lockChipText: {
    color: INK.cream,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  recharge: {
    alignSelf: 'flex-start',
    marginTop: Spacing.four,
    height: 44,
    paddingHorizontal: Spacing.five,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rechargeLabel: {
    color: INK.rechargeText,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
  },
  rail: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.four,
    marginTop: Spacing.two,
    position: 'relative',
  },
  railLine: {
    position: 'absolute',
    left: Spacing.four + 12,
    right: Spacing.four + 12,
    top: 10,
    height: 1.5,
    backgroundColor: INK.rail,
  },
  railItem: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 4,
    gap: Spacing.three,
  },
  marker: {
    width: 8,
    height: 8,
    transform: [{ rotate: '45deg' }],
    backgroundColor: '#C9A96E',
  },
  markerActive: {
    width: 12,
    height: 12,
    backgroundColor: INK.cream,
    borderWidth: 1,
    borderColor: INK.gold,
    marginTop: -2,
    marginBottom: 2,
  },
  railLabel: {
    fontFamily: DISPLAY_FAMILY,
    fontSize: 14,
    lineHeight: 20,
    color: INK.dim,
  },
  railLabelActive: {
    color: INK.cream,
  },
  benefitsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    marginTop: Spacing.four,
    marginBottom: Spacing.two,
  },
  benefitsTitle: {
    color: INK.cream,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '700',
  },
  benefitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: Spacing.four,
  },
  benefitCard: {
    flexBasis: '30%',
    flexGrow: 1,
    minHeight: 146,
    borderRadius: 14,
    backgroundColor: INK.card,
    borderWidth: 1,
    borderColor: INK.cardBorder,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: 6,
  },
  benefitCardLocked: {
    backgroundColor: INK.cardLocked,
  },
  benefitArt: {
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artDimmed: {
    opacity: 0.32,
  },
  lockBadge: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(20, 13, 8, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(245, 233, 214, 0.18)',
  },
  lockBadgeText: {
    color: INK.cream,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
  },
  benefitLabel: {
    color: '#CDBCA8',
    fontSize: 14,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: Spacing.two,
  },
  labelArt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  labelArtText: {
    color: '#4A2C08',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
  },
  entryArt: {    alignItems: 'center',
    gap: 3,
  },
  entryRibbonWide: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 62,
    height: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  entryRibbonNarrow: {
    width: 52,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(201, 169, 110, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryText: {
    color: '#4A2C08',
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '900',
  },
  entryTextSmall: {
    color: INK.creamSoft,
    fontSize: 8,
    lineHeight: 11,
    fontWeight: '700',
  },
  roomArt: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomBadge: {
    position: 'absolute',
    right: -6,
    bottom: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: INK.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftArt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  expandControl: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 4,
    marginTop: Spacing.three,
    paddingVertical: Spacing.two,
  },
  expandLabel: {
    color: INK.creamSoft,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
  },
  chevronDown: {
    marginTop: 2,
  },
  chevronUp: {
    transform: [{ rotate: '180deg' }],
    marginTop: -2,
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    marginTop: Spacing.three,
  },
  storeTitle: {
    color: INK.cream,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    flex: 1,
  },
  viewMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: Spacing.one,
  },
  viewMoreLabel: {
    color: INK.muted,
    fontSize: 15,
    lineHeight: 20,
  },
  pointsPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.four,
    marginTop: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 16,
    backgroundColor: INK.panel,
  },
  pointsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    flex: 1,
  },
  pointsLabel: {
    color: INK.cream,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
  },
  helpDot: {
    padding: 2,
  },
  helpDotMark: {
    color: INK.muted,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
    width: 17,
    textAlign: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: INK.muted,
    overflow: 'hidden',
  },
  pointsValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pointsAmount: {
    color: INK.cream,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  storeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    marginTop: Spacing.two,
  },
  storeCard: {
    flexBasis: '47%',
    flexGrow: 1,
    borderRadius: 16,
    backgroundColor: INK.card,
    borderWidth: 1.5,
    borderColor: INK.storeBorder,
    padding: Spacing.two,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardChip: {
    borderRadius: 6,
    overflow: 'hidden',
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
    position: 'relative',
  },
  cardChipLabel: {
    position: 'relative',
    color: '#3A2A08',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '800',
  },
  cardArt: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: 'rgba(232, 181, 74, 0.09)',
    borderWidth: 1,
    borderColor: INK.storeBorderSoft,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: Spacing.one,
  },
  cardCategory: {
    color: INK.gold,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '700',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  cardPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  cardPriceLabel: {
    color: INK.gold,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '800',
  },
  cardValidity: {
    color: INK.muted,
    fontSize: 13,
    lineHeight: 18,
  },
});


