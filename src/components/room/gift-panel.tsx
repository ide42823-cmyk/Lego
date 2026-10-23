import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radius, RoomPalette, Spacing } from '@/constants/theme';
import type {
  GiftCatalogModel,
  GiftCategoryData,
  GiftCategoryKey,
  GiftEntry,
} from '@/core/data/types';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

import { ThemedText } from '../themed-text';
import { Icon, type IconName } from '../ui/icon';

/**
 * Tile art meanings -> Lucide glyphs. Our own shapes stand in for the
 * reference's proprietary illustrations; the *information* (name, price,
 * badge, selection) is what the layout needs.
 */
const ART_GLYPHS: Record<GiftEntry['art'], IconName> = {
  mic: 'mic',
  crown: 'crown',
  star: 'star',
  bell: 'bell',
  heart: 'greeting',
  flower: 'flower',
  gem: 'diamonds',
  party: 'party',
  globe: 'globe',
  sparkle: 'sparkle',
  gift: 'gift',
  trophy: 'trophy',
  ticket: 'ticket',
  diamonds: 'diamonds',
  camera: 'camera',
  disk: 'coin',
  piano: 'sparkle',
};

/** Soft tile washes keyed by art meaning, our own colour rhythm. */
const ART_TINTS: Record<GiftEntry['art'], string> = {
  mic: '#2C2350',
  crown: '#3A2A18',
  star: '#232A4A',
  bell: '#33283E',
  heart: '#3A1F33',
  flower: '#233324',
  gem: '#1F2E44',
  party: '#33235A',
  globe: '#1F3348',
  sparkle: '#2B2352',
  gift: '#3A2323',
  trophy: '#332A16',
  ticket: '#22303A',
  diamonds: '#28304A',
  camera: '#3A2A1F',
  disk: '#33235A',
  piano: '#2C2C3E',
};

const BADGE_COLORS: Record<NonNullable<GiftEntry['badge']>['kind'], { background: string; text: string }> = {
  new: { background: '#3AD46F', text: '#06230F' },
  vip: { background: '#FF8A3C', text: '#3A1400' },
  couple: { background: '#B34DF0', text: '#FFFFFF' },
  friend: { background: '#7C4DF0', text: '#FFFFFF' },
  jackpot: { background: '#FFB020', text: '#4A2600' },
  combo: { background: '#FF5064', text: '#FFFFFF' },
  level: { background: '#8B5CF6', text: '#FFFFFF' },
};

const QUANTITY_STEPS = [1, 7, 77, 188];

export interface GiftPanelProps {
  visible: boolean;
  onClose: () => void;
  catalog: GiftCatalogModel;
  /** The recipient strip's audience counter (display data). */
  audienceCount: number;
  onOffer: () => void;
  onAristocracy: () => void;
  onUpgrade: () => void;
  onBanner: () => void;
}

/**
 * The reference's dark gift panel (screens 004-012): a category band over the
 * recipient strip, the tab row, a four-column grid with badges, and the
 * Offer / Aristocracy / quantity / Send footer. Everything here is
 * presentation — the wallet, eligibility, draws and sending are backend
 * phases, so the recipient strip stays at "No one else on the seat" and Send
 * stays disabled, exactly like the reference captures with no occupant.
 */
export function GiftPanel({
  visible,
  onClose,
  catalog,
  audienceCount,
  onOffer,
  onAristocracy,
  onUpgrade,
  onBanner,
}: GiftPanelProps) {
  const reducedMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  const [activeKey, setActiveKey] = useState<GiftCategoryKey>('gift');
  // The reference shows the first tile of a category already outlined.
  const [selectedId, setSelectedId] = useState<string | null>(
    catalog.categories.find((category) => category.key === 'gift')?.entries[0]?.id ?? null,
  );
  const [quantity, setQuantity] = useState<number>(QUANTITY_STEPS[0] as number);
  const [multiplier, setMultiplier] = useState<string | null>(null);

  const active = catalog.categories.find((category) => category.key === activeKey) as
    | GiftCategoryData
    | undefined;

  const selectCategory = (key: GiftCategoryKey) => {
    setActiveKey(key);
    const next = catalog.categories.find((category) => category.key === key);
    // The reference shows the first tile outlined as you switch categories.
    setSelectedId(next?.entries[0]?.id ?? null);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType={reducedMotion ? 'none' : 'slide'}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={[styles.root, { height }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close" style={styles.scrim} onPress={onClose} />
        <View
          accessibilityViewIsModal
          style={[styles.sheet, { maxHeight: height * 0.64, paddingBottom: insets.bottom + Spacing.two }]}
        >
          <View style={styles.grabber} />

          {active ? <CategoryBand category={active} catalog={catalog} multiplier={multiplier} onMultiplier={setMultiplier} onPress={onBanner} onUpgrade={onUpgrade} /> : null}

          <View style={styles.recipientRow}>
            <ThemedText type="small" style={styles.recipientText}>
              No one else on the seat
            </ThemedText>
            <View style={styles.audienceChip}>
              <Icon name="friends" size={14} color={RoomPalette.text} strokeWidth={2.4} />
              <ThemedText type="small" style={styles.recipientText}>
                {audienceCount}
              </ThemedText>
            </View>
          </View>

          {/* Tabs read in the reference's order and scroll horizontally. */}
          <ScrollView
            contentContainerStyle={styles.tabRow}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {catalog.categories.map((category) => {
              const isActive = category.key === activeKey;
              return (
                <Pressable
                  key={category.key}
                  accessibilityRole="tab"
                  accessibilityLabel={`${category.label} gifts`}
                  accessibilityState={{ selected: isActive }}
                  onPress={() => selectCategory(category.key)}
                >
                  <View style={styles.tab}>
                    <ThemedText
                      type="smallBold"
                      style={[styles.tabText, isActive && styles.tabTextActive]}
                    >
                      {category.label}
                    </ThemedText>
                    {category.unviewed ? <View style={styles.tabDot} /> : null}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          {active && active.entries.length > 0 ? (
            <ScrollView style={styles.gridScroll} contentContainerStyle={styles.grid}>
              {active.entries.map((entry) => (
                <GiftTile
                  key={entry.id}
                  entry={entry}
                  selected={entry.id === selectedId}
                  onSelect={() => setSelectedId(entry.id)}
                />
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyGrid}>
              <Icon name="backpack" size={40} color={RoomPalette.textMuted} strokeWidth={1.8} />
              <ThemedText type="small" style={styles.recipientText}>
                Your backpack is empty until the backend phase.
              </ThemedText>
            </View>
          )}

          <View style={styles.footer}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Offer"
              onPress={onOffer}
              style={({ pressed }) => [styles.offer, pressed && { opacity: 0.85 }]}
            >
              <View style={styles.offerCoin}>
                <Icon name="coin" size={15} color="#7A3D00" fill="#FFC53D" />
              </View>
              <ThemedText type="smallBold" style={styles.offerText}>
                Offer
              </ThemedText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Aristocracy"
              onPress={onAristocracy}
              style={({ pressed }) => [styles.aristocracy, pressed && { opacity: 0.85 }]}
            >
              <Icon name="crown" size={16} color={RoomPalette.gold} fill={RoomPalette.gold} />
              <ThemedText type="smallBold" style={styles.aristocracyText}>
                Aristocracy
              </ThemedText>
              <Icon name="forward" size={14} color={RoomPalette.textMuted} strokeWidth={2.4} />
            </Pressable>

            <View style={styles.footerTail}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Change the quantity"
                onPress={() => {
                  const at = QUANTITY_STEPS.indexOf(quantity);
                  setQuantity(QUANTITY_STEPS[(at + 1) % QUANTITY_STEPS.length] as number);
                }}
                style={styles.quantityChip}
              >
                <ThemedText type="smallBold" style={styles.quantityValue}>
                  {quantity}
                </ThemedText>
                <Icon name="expand" size={13} color={RoomPalette.text} strokeWidth={2.4} />
              </Pressable>
              <View style={[styles.send, styles.sendBlocked]} accessibilityLabel="Send" accessible>
                <ThemedText type="smallBold" style={styles.sendText}>
                  Send
                </ThemedText>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

interface GiftTileProps {
  entry: GiftEntry;
  selected: boolean;
  onSelect: () => void;
}

function GiftTile({ entry, selected, onSelect }: GiftTileProps) {
  const glyph = ART_GLYPHS[entry.art];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${entry.name}, ${entry.price} coins`}
      accessibilityState={{ selected }}
      onPress={onSelect}
      style={({ pressed }) => [styles.tile, pressed && { opacity: 0.9 }]}
    >
      <View style={[styles.tileArt, { backgroundColor: ART_TINTS[entry.art] }, selected && styles.tileArtSelected]}>
        <Icon name={glyph} size={30} color={RoomPalette.text} strokeWidth={2} />
        {entry.onCamera ? (
          <View style={styles.chipCorner}>
            <Icon name="camera" size={9} color="#FFFFFF" />
          </View>
        ) : null}
        {entry.timeLimited ? (
          <View style={styles.chipCorner}>
            <Icon name="history" size={9} color="#FFFFFF" />
          </View>
        ) : null}
        {entry.badge ? (
          <View style={[styles.badge, { backgroundColor: BADGE_COLORS[entry.badge.kind].background }]}>
            <ThemedText type="small" style={[styles.badgeText, { color: BADGE_COLORS[entry.badge.kind].text }]} accessible={false}>
              {entry.badge.kind === 'level' || (entry.badge.kind === 'vip' && entry.badge.label) ? entry.badge.label : entry.badge.kind.toUpperCase()}
            </ThemedText>
          </View>
        ) : null}
      </View>
      <ThemedText type="small" style={styles.tileName} numberOfLines={1}>
        {entry.name}
      </ThemedText>
      <View style={styles.priceRow}>
        <Icon name="coin" size={11} color={RoomPalette.gold} fill={RoomPalette.gold} />
        <ThemedText type="small" style={styles.priceText}>
          {entry.price}
        </ThemedText>
      </View>
    </Pressable>
  );
}

interface CategoryBandProps {
  category: GiftCategoryData;
  catalog: GiftCatalogModel;
  multiplier: string | null;
  onMultiplier: (m: string) => void;
  /** Banner taps (video/token/event) report to the screen's gate. */
  onPress: () => void;
  onUpgrade: () => void;
}

/** The band between the room canvas and the tab row — one variant per category. */
function CategoryBand({ category, catalog, multiplier, onMultiplier: setMultiplier, onPress, onUpgrade }: CategoryBandProps) {
  const key = category.key;
  if (key === 'lucky') {
    const lucky = catalog.lucky;
    return (
      <View style={styles.luckyStage}>
        <View style={styles.luckyTitleRow}>
          <ThemedText type="default" style={styles.luckyTitle}>
            LUCKY
          </ThemedText>
          <View style={styles.jackpotPill}>
            <ThemedText type="small" style={styles.jackpotText} accessible={false}>
              {`JACKPOT ${lucky.jackpotTotal}`}
            </ThemedText>
          </View>
        </View>
        <View style={styles.luckyRow}>
          {lucky.multipliers.slice(0, 3).map((m) => (
            <MultiplierChip key={m} label={m} selected={m === multiplier} onSelect={() => setMultiplier(m)} />
          ))}
          <View style={styles.luckyCenter}>
            <Icon name="gift" size={30} color="#FFFFFF" fill={RoomPalette.selection} />
          </View>
          {lucky.multipliers.slice(3).map((m) => (
            <MultiplierChip key={m} label={m} selected={m === multiplier} onSelect={() => setMultiplier(m)} />
          ))}
        </View>
      </View>
    );
  }

  if (key === 'event') {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open the event"
        onPress={onPress}
        style={styles.eventBumper}
      >
        <Icon name="megaphone" size={20} color="#FFFFFF" fill="#FFFFFF" />
        <ThemedText type="default" style={styles.eventTitle} numberOfLines={1}>
          {catalog.eventTitle}
        </ThemedText>
        <View style={styles.bannerChevron}>
          <Icon name="forward" size={15} color="#FFFFFF" strokeWidth={2.6} />
        </View>
      </Pressable>
    );
  }

  if (key === 'interactive') {
    return (
      <View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Watch the interactive gift introduction"
          onPress={onPress}
          style={styles.videoBanner}
        >
          <View style={styles.videoMedal}>
            <Icon name="video" size={20} color="#FFD84A" fill="#FFD84A" />
          </View>
          <View style={styles.bannerTexts}>
            <ThemedText type="default" style={styles.bannerTitle}>
              Video Interactive Gift
            </ThemedText>
            <ThemedText type="small" style={styles.bannerSubtitle}>
              Send gift to trigger fun face effects
            </ThemedText>
          </View>
          <View style={styles.bannerChevron}>
            <Icon name="forward" size={15} color="#FFFFFF" strokeWidth={2.6} />
          </View>
        </Pressable>
        <ThemedText type="small" style={styles.hint}>
          This gift can only be sent to users on camera
        </ThemedText>
      </View>
    );
  }

  if (key === 'tokens') {
    return (
      <View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Watch the token introduction"
          onPress={onPress}
          style={styles.tokenBanner}
        >
          <View style={styles.videoMedal}>
            <Icon name="diamonds" size={20} color="#FFFFFF" fill="#FFFFFF" />
          </View>
          <View style={styles.bannerTexts}>
            <ThemedText type="default" style={styles.bannerTitle}>
              7 validity days + 1.2x intimacy
            </ThemedText>
            <ThemedText type="small" style={styles.bannerSubtitle}>
              Token recipients get tokens and Diamonds worth a share of the value
            </ThemedText>
          </View>
          <View style={styles.bannerChevron}>
            <Icon name="forward" size={15} color="#FFFFFF" strokeWidth={2.6} />
          </View>
        </Pressable>
        <ThemedText type="small" style={styles.hint}>
          This token can only be gifted to your Couple
        </ThemedText>
      </View>
    );
  }

  if (key === 'customize') {
    const countdown = catalog.countdown;
    return (
      <View style={styles.countdownBand}>
        <Icon name="bell" size={24} color={RoomPalette.gold} fill={RoomPalette.gold} />
        <ThemedText type="small" style={styles.recipientText}>
          Countdown:
        </ThemedText>
        <View style={styles.countValue}>
          <ThemedText type="smallBold" style={styles.countText} accessible={false}>
            {countdown.days}
          </ThemedText>
        </View>
        <ThemedText type="small" style={styles.recipientText}>
          Days
        </ThemedText>
        {countdown.clockSegments.map((segment, index) => (
          <View key={`${segment}-${index}`} style={styles.countValue}>
            <ThemedText type="smallBold" style={styles.countText} accessible={false}>
              {segment}
            </ThemedText>
          </View>
        ))}
      </View>
    );
  }

  // gift / privilege / countries / members / backpack ride the upgrade row.
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${catalog.upgrade.coinsNeeded} coins needed to upgrade the room`}
      onPress={onUpgrade}
      style={styles.upgradeRow}
    >
      <View style={styles.upgradeChip}>
        <Icon name="diamonds" size={13} color={RoomPalette.textMuted} />
        <ThemedText type="small" style={styles.upgradeChipText} accessible={false}>
          0
        </ThemedText>
      </View>
      <View style={styles.upgradeTrack}>
        <View style={[styles.upgradeFill, { width: `${Math.round(catalog.upgrade.fraction * 100)}%` }]} />
      </View>
      <ThemedText type="small" style={styles.recipientText}>
        <ThemedText type="small" style={styles.upgradeAmount}>
          {catalog.upgrade.coinsNeeded}
        </ThemedText>
        {' Coins needed to upgrade'}
      </ThemedText>
      <Icon name="forward" size={14} color={RoomPalette.textMuted} strokeWidth={2.4} />
    </Pressable>
  );
}

interface MultiplierChipProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
}

function MultiplierChip({ label, selected, onSelect }: MultiplierChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onSelect}
    >
      <View style={[styles.multiplier, selected && styles.multiplierSelected]}>
        <ThemedText type="smallBold" style={styles.multiplierText} accessible={false}>
          {label}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    justifyContent: 'flex-end',
  },
  scrim: {
    position: 'absolute',
    top: 0,
    start: 0,
    end: 0,
    bottom: 0,
    backgroundColor: 'rgba(4, 4, 10, 0.55)',
  },
  sheet: {
    backgroundColor: '#101020',
    borderTopStartRadius: Radius.xlarge,
    borderTopEndRadius: Radius.xlarge,
    borderWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.10)',
    paddingTop: Spacing.one,
    paddingHorizontal: Spacing.two,
    gap: Spacing.one,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },

  // Upgrade progress band (gift / privilege / countries / members / backpack)
  upgradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingTop: Spacing.two,
  },
  upgradeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  upgradeChipText: {
    color: RoomPalette.text,
  },
  upgradeTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(140, 130, 200, 0.22)',
    overflow: 'hidden',
  },
  upgradeFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#6C5CE7',
  },
  upgradeAmount: {
    color: RoomPalette.gold,
    fontWeight: 700,
  },

  // Countdown band (customize)
  countdownBand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: Spacing.two,
  },
  countValue: {
    minWidth: 26,
    alignItems: 'center',
    borderRadius: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  countText: {
    color: RoomPalette.text,
  },

  // Video / token banners + event bumper
  videoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Radius.medium,
    backgroundColor: '#7B3BE8',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  tokenBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Radius.medium,
    backgroundColor: '#FF3E9D',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  eventBumper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    borderRadius: Radius.medium,
    backgroundColor: '#231653',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
  },
  videoMedal: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTexts: {
    flex: 1,
    gap: 2,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontWeight: 800,
  },
  bannerSubtitle: {
    color: 'rgba(255, 255, 255, 0.82)',
    fontSize: 11,
    lineHeight: 15,
  },
  bannerChevron: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    color: RoomPalette.textMuted,
    paddingTop: 5,
    fontSize: 12,
    lineHeight: 16,
  },
  eventTitle: {
    color: RoomPalette.gold,
    fontWeight: 800,
    flex: 1,
  },

  // Lucky stage
  luckyStage: {
    borderRadius: Radius.medium,
    borderWidth: 3,
    borderStyle: 'solid',
    borderColor: 'rgba(255, 176, 32, 0.55)',
    backgroundColor: '#26140A',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    marginBottom: Spacing.one,
  },
  luckyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  luckyTitle: {
    color: RoomPalette.gold,
    fontWeight: 900,
    letterSpacing: 1.5,
  },
  jackpotPill: {
    borderRadius: Radius.pill,
    backgroundColor: '#FFB020',
    paddingHorizontal: 9,
    paddingVertical: 2,
  },
  jackpotText: {
    color: '#4A2600',
    fontWeight: 800,
    fontSize: 11,
    lineHeight: 15,
  },
  luckyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  luckyCenter: {
    width: 62,
    height: 62,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(226, 55, 75, 0.5)',
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  multiplier: {
    borderRadius: Radius.pill,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: 'rgba(255, 176, 32, 0.7)',
    backgroundColor: '#1A1006',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  multiplierSelected: {
    backgroundColor: '#FFB020',
    borderColor: '#FFE9A8',
  },
  multiplierText: {
    color: RoomPalette.gold,
  },

  // Recipient strip
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.one,
  },
  recipientText: {
    color: RoomPalette.textMuted,
  },
  audienceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    paddingHorizontal: 9,
    paddingVertical: 3,
  },

  // Tabs
  tabRow: {
    gap: Spacing.three,
    paddingVertical: Spacing.one,
  },
  tab: {
    position: 'relative',
    paddingVertical: 3,
  },
  tabText: {
    color: RoomPalette.textMuted,
  },
  tabTextActive: {
    color: RoomPalette.text,
  },
  tabDot: {
    position: 'absolute',
    top: 0,
    end: -7,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#FF5064',
  },

  // Grid
  gridScroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  emptyGrid: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.five,
  },
  tile: {
    width: '24%',
    minWidth: 72,
    alignItems: 'center',
    gap: 3,
    paddingVertical: 4,
  },
  tileArt: {
    width: 72,
    height: 72,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileArtSelected: {
    borderColor: RoomPalette.selection,
  },
  tileName: {
    color: 'rgba(255, 255, 255, 0.90)',
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  priceText: {
    color: RoomPalette.text,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: 700,
  },
  badge: {
    position: 'absolute',
    top: -5,
    start: -5,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  badgeText: {
    fontSize: 9.5,
    lineHeight: 12,
    fontWeight: 800,
  },
  chipCorner: {
    position: 'absolute',
    end: -5,
    top: -5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(40, 40, 60, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingTop: Spacing.one,
  },
  offer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: Radius.pill,
    backgroundColor: '#FFB020',
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  offerCoin: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerText: {
    color: '#5A2A00',
  },
  aristocracy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  aristocracyText: {
    color: RoomPalette.gold,
  },
  footerTail: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.one,
  },
  quantityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  quantityValue: {
    color: RoomPalette.text,
  },
  send: {
    borderRadius: Radius.pill,
    paddingHorizontal: 22,
    paddingVertical: 8,
  },
  sendBlocked: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  sendText: {
    color: 'rgba(255, 255, 255, 0.45)',
  },
});
