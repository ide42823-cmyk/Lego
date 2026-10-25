import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radius, Spacing } from '@/constants/theme';
import type {
  MembershipFamilyKey,
  MembershipStoreItem,
  MembershipSvipHub,
} from '@/core/data/types';

import { ThemedText } from '../themed-text';
import { GradientFill } from '../ui/gradient-fill';
import { Icon, type IconName } from '../ui/icon';

/**
 * The hub carries its own fixed black/gold premium identity, independent of
 * the colour scheme, so the palette is fixed here.
 */
const INK = {
  page: '#0B090A',
  header: '#0D0B0C',
  panel: '#171519',
  card: '#141114',
  privilege: '#1D100F',
  border: 'rgba(232, 181, 74, 0.5)',
  borderSoft: 'rgba(232, 181, 74, 0.22)',
  gold: '#E8B54A',
  goldDim: '#9C8A5C',
  cream: '#F4F1EA',
  muted: '#8A8494',
  label: '#D8D3CC',
  chipFrom: '#E8B54A',
  chipTo: '#8A5A1E',
} as const;

const FAMILIES: readonly { key: MembershipFamilyKey; label: string }[] = [
  { key: 'vip', label: 'VIP' },
  { key: 'svip', label: 'SVIP' },
];

/** Our own art for store categories — the reference's product art stays out. */
const CATEGORY_GLYPHS: Record<string, IconName> = {
  Vehicles: 'gift',
  Frames: 'crown',
};

/** The crest glyphs cycle over the privilege cards. */
const PRIVILEGE_GLYPHS: readonly IconName[] = ['gift', 'crown', 'sparkle', 'diamonds'];

export interface MembershipSvipHubViewProps {
  hub: MembershipSvipHub;
  onBack: () => void;
  onFamilyChange: (family: MembershipFamilyKey) => void;
  /** A store item press; the page owns the purchase gate. */
  onBuy: (item: MembershipStoreItem) => void;
  /** Help and View More are backend surfaces. */
  onHelp: () => void;
  onViewMore: () => void;
}

/**
 * The SVIP family's page (reference 040): the level crest band whose selected
 * level's privileges show as highlight cards ("Pack up" collapses them), then
 * the store panel: the server-owned points balance and purchasable premium
 * assets with their server prices and validity. Nothing here grants an
 * entitlement or spends points — every purchase reports to the page's gate.
 */
export function MembershipSvipHubView({
  hub,
  onBack,
  onFamilyChange,
  onBuy,
  onHelp,
  onViewMore,
}: MembershipSvipHubViewProps) {
  const insets = useSafeAreaInsets();

  // The served level decides the highlight band; the viewer browses the rest.
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [privilegesOpen, setPrivilegesOpen] = useState(true);

  const level =
    hub.levels.find((candidate) => candidate.label === selectedLevel) ??
    hub.levels.find((candidate) => candidate.current) ??
    hub.levels[0];

  if (!level) {
    return null;
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={onBack}
          style={({ pressed }) => [styles.control, pressed && { opacity: 0.7 }]}
        >
          <Icon name="back" size={22} color={INK.gold} strokeWidth={2} />
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
            <Icon name="history" size={21} color={INK.gold} strokeWidth={1.8} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Help"
            onPress={onHelp}
            style={({ pressed }) => [styles.control, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.helpMark}>?</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.six }}
      >
        <View style={styles.levelBand}>
          {hub.levels.map((candidate) => {
            const active = candidate.label === level.label;
            return (
              <Pressable
                key={candidate.label}
                accessibilityRole="radio"
                accessibilityLabel={`Membership level ${candidate.label}`}
                accessibilityState={{ checked: active, selected: candidate.current }}
                onPress={() => {
                  setSelectedLevel(candidate.label);
                  setPrivilegesOpen(true);
                }}
                style={styles.levelTab}
              >
                <View
                  style={[
                    styles.crest,
                    active ? styles.crestActive : styles.crestIdle,
                    candidate.current && { borderWidth: 2, borderColor: INK.gold },
                  ]}
                >
                  <Icon
                    name="crown"
                    size={22}
                    color={active ? INK.gold : INK.goldDim}
                    strokeWidth={1.7}
                  />
                </View>
                <Text
                  style={[
                    styles.levelLabel,
                    active ? styles.levelLabelActive : styles.levelLabelIdle,
                  ]}
                >
                  {candidate.label}
                </Text>
                {active ? <View style={styles.levelUnderline} /> : <View style={styles.levelGap} />}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.horizontalRule} />

        {privilegesOpen ? (
          <View style={styles.privilegeGrid}>
            {level.privileges.map((privilege, index) => (
              <View key={privilege.id} style={styles.privilegeCard}>
                <View style={styles.privilegeArt}>
                  <Icon
                    name={PRIVILEGE_GLYPHS[index % PRIVILEGE_GLYPHS.length]}
                    size={44}
                    color={INK.gold}
                    strokeWidth={1.6}
                  />
                </View>
                <Text style={styles.privilegeLabel}>
                  {privilege.requiredLevel !== level.label
                    ? `${privilege.requiredLevel} · ${privilege.label}`
                    : privilege.label}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={privilegesOpen ? 'Pack up the privileges' : 'Expand the privileges'}
          onPress={() => setPrivilegesOpen((open) => !open)}
          style={({ pressed }) => [styles.packControl, pressed && { opacity: 0.75 }]}
        >
          <Text style={styles.packLabel}>{privilegesOpen ? 'Pack up' : 'Expand'}</Text>
              <View style={[styles.chevron, privilegesOpen ? styles.chevronDown : styles.chevronUp]} pointerEvents="none">
                <Icon name="forward" size={16} color={INK.gold} strokeWidth={2} />
              </View>
        </Pressable>

        <View style={[styles.storeHeader, { paddingHorizontal: Spacing.three }]}>
          <ThemedText style={styles.storeTitle}>{`${hub.family.toUpperCase()}Store`}</ThemedText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View more store items"
            onPress={onViewMore}
            style={({ pressed }) => [styles.viewMore, pressed && { opacity: 0.75 }]}
          >
            <ThemedText style={styles.viewMoreLabel}>View More</ThemedText>
            <Icon name="forward" size={16} color={INK.muted} strokeWidth={2} />
          </Pressable>
        </View>

        <View style={styles.pointsPanel}>
          <View style={styles.pointsLeft}>
            <ThemedText style={styles.pointsLabel}>My Points</ThemedText>
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
            <ThemedText style={styles.pointsAmount}>{hub.points}</ThemedText>
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
                    <GradientFill from={INK.chipFrom} to={INK.chipTo} radius={999} />
                    <Text style={styles.cardChipLabel}>{item.requiredLevel}</Text>
                  </View>
                ) : (
                  <View />
                )}
                <Icon name="share" size={17} color={INK.goldDim} strokeWidth={1.8} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: INK.page,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
    height: 52,
  },
  control: {
    padding: Spacing.one,
  },
  familyTabs: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.four,
  },
  familyTab: {
    paddingVertical: Spacing.one,
  },
  familyLabel: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '800',
    color: INK.goldDim,
  },
  familyLabelActive: {
    color: INK.gold,
  },
  familyLabelIdle: {
    color: INK.goldDim,
  },
  topControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  helpMark: {
    color: INK.gold,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    width: 26,
    textAlign: 'center',
  },
  levelBand: {
    flexDirection: 'row',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    marginTop: Spacing.one,
  },
  levelTab: {
    alignItems: 'center',
    gap: 4,
    width: 76,
  },
  crest: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(232, 181, 74, 0.10)',
    borderWidth: 1,
  },
  crestActive: {
    borderColor: 'rgba(232, 181, 74, 0.8)',
  },
  crestIdle: {
    borderColor: 'rgba(232, 181, 74, 0.25)',
  },
  levelLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
  },
  levelLabelActive: {
    color: INK.gold,
  },
  levelLabelIdle: {
    color: INK.muted,
  },
  levelUnderline: {
    width: 26,
    height: 3,
    borderRadius: 2,
    backgroundColor: INK.gold,
  },
  levelGap: {
    height: 3,
  },
  horizontalRule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(232, 181, 74, 0.35)',
    marginHorizontal: Spacing.three,
    marginTop: Spacing.two,
  },
  privilegeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    marginTop: Spacing.three,
  },
  privilegeCard: {
    flexBasis: '47%',
    flexGrow: 1,
    borderRadius: Radius.large,
    backgroundColor: INK.privilege,
    alignItems: 'center',
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
    paddingHorizontal: Spacing.two,
    gap: Spacing.two,
  },
  privilegeArt: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: 'rgba(232, 181, 74, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  privilegeLabel: {
    color: INK.label,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600',
    textAlign: 'center',
  },
  packControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'center',
    marginTop: Spacing.two,
    paddingVertical: Spacing.one,
  },
  packLabel: {
    color: INK.gold,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '700',
  },
  chevron: {
    padding: 2,
  },
  chevronDown: {
    transform: [{ rotate: '270deg' }],
  },
  chevronUp: {
    transform: [{ rotate: '90deg' }],
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginHorizontal: Spacing.three,
    marginTop: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.large,
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
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600',
  },
  helpDot: {
    padding: 2,
  },
  helpDotMark: {
    color: INK.muted,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    width: 16,
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
    color: INK.gold,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '800',
  },
  storeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    marginTop: Spacing.two,
  },
  storeCard: {
    flexBasis: '47%',
    flexGrow: 1,
    borderRadius: Radius.large,
    backgroundColor: INK.card,
    borderWidth: 1.5,
    borderColor: INK.border,
    padding: Spacing.two,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardChip: {
    borderRadius: Radius.pill,
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
    borderColor: INK.borderSoft,
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
