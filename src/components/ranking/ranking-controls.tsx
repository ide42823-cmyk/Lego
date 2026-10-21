import { useCallback, useEffect, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import type { ScrollViewInstance } from 'react-native';

import { Radius, RankingPalette, Spacing, TouchTarget } from '@/constants/theme';
import type { FilterOption, LeaderboardCategory, LeaderboardPeriod } from '@/core/data/types';

import { ThemedText } from '../themed-text';
import { Icon } from '../ui/icon';
import { LEADERBOARD_CATEGORY_ITEMS, LEADERBOARD_PERIOD_ITEMS } from './ranking-config';

export interface CategoryTabsProps {
  value: LeaderboardCategory;
  onChange: (category: LeaderboardCategory) => void;
}

/**
 * Charm / Wealth / Newcomer / Room / Games / Family.
 *
 * The reference uses plain text, not pills: the selected label turns white and
 * bold, the rest sit back in lavender. The row scrolls at narrow widths and
 * keeps the selected label in view, including when a deep link opens Room.
 */
export function CategoryTabs({ value, onChange }: CategoryTabsProps) {
  const scrollRef = useRef<ScrollViewInstance>(null);
  const layouts = useRef<Record<string, { x: number; width: number }>>({});

  const reveal = useCallback((key: LeaderboardCategory) => {
    const layout = layouts.current[key];
    if (!layout) {
      return;
    }
    scrollRef.current?.scrollTo({
      x: Math.max(0, layout.x - Spacing.three),
      animated: false,
    });
  }, []);

  useEffect(() => {
    reveal(value);
  }, [reveal, value]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryScroll}
      contentContainerStyle={styles.categoryRow}
      accessibilityRole="tablist"
      accessibilityLabel="Ranking category"
    >
      {LEADERBOARD_CATEGORY_ITEMS.map((item) => {
        const selected = item.key === value;
        return (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            accessibilityState={{ selected }}
            aria-selected={selected}
            onPress={() => onChange(item.key)}
            onLayout={(event) => {
              layouts.current[item.key] = event.nativeEvent.layout;
              if (selected) {
                reveal(item.key);
              }
            }}
            style={({ pressed }) => [styles.categoryItem, pressed && styles.categoryPressed]}
          >
            <ThemedText
              type="small"
              style={[styles.categoryLabel, selected && styles.categorySelected]}
            >
              {item.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export interface PeriodTabsProps {
  value: LeaderboardPeriod;
  onChange: (period: LeaderboardPeriod) => void;
}

/**
 * Daily / Weekly / Monthly.
 *
 * Individual translucent pills, as in the reference, rather than one segmented
 * track. The visual pill is 34 pt tall; the press target around it is 44 pt.
 */
export function PeriodTabs({ value, onChange }: PeriodTabsProps) {
  return (
    <View style={styles.periodRow} accessibilityRole="tablist" accessibilityLabel="Ranking period">
      {LEADERBOARD_PERIOD_ITEMS.map((item) => {
        const selected = item.key === value;
        return (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            accessibilityState={{ selected }}
            aria-selected={selected}
            onPress={() => onChange(item.key)}
            style={({ pressed }) => [styles.periodPressable, pressed && styles.periodPressed]}
          >
            <View
              style={[
                styles.periodPill,
                {
                  backgroundColor: selected ? RankingPalette.brand : RankingPalette.pill,
                  borderColor: selected ? RankingPalette.brandBright : RankingPalette.border,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.periodLabel,
                  { color: selected ? RankingPalette.text : RankingPalette.textMuted },
                  selected && styles.periodLabelSelected,
                ]}
              >
                {item.label}
              </ThemedText>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

export interface RegionButtonProps {
  /** Compact label shown on the button: "All" or the active alpha-2 code. */
  label: string;
  /** Full label for assistive technology. */
  accessibilityLabel: string;
  regions: readonly FilterOption[];
  /** Keep a disabled entry point visible while the board is loading. */
  visible?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

/**
 * The region entry point beside the periods.
 *
 * This is a real local filter over the board's own regions, not a decorative
 * chevron. The full country name stays in the accessibility label; the visible
 * label is short so the period row still fits at 320 pt.
 */
export function RegionButton({
  label,
  accessibilityLabel,
  regions,
  visible = true,
  disabled = false,
  onPress,
}: RegionButtonProps) {
  if (!visible) {
    return null;
  }

  const blocked = disabled || regions.length === 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: blocked }}
      disabled={blocked}
      hitSlop={4}
      onPress={onPress}
      style={({ pressed }) => [
        styles.regionButton,
        blocked && styles.regionDisabled,
        pressed && styles.regionPressed,
      ]}
    >
      <ThemedText numberOfLines={1} style={styles.regionLabel}>
        {label}
      </ThemedText>
      <Icon
        name="expand"
        size={14}
        strokeWidth={2.2}
        color={blocked ? RankingPalette.textFaint : RankingPalette.textMuted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  categoryScroll: { flexGrow: 0 },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: Spacing.three,
  },
  categoryItem: {
    minHeight: TouchTarget,
    justifyContent: 'center',
    paddingHorizontal: 1,
    borderRadius: Radius.small,
  },
  categoryPressed: { opacity: 0.65 },
  categoryLabel: {
    color: RankingPalette.textMuted,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  categorySelected: {
    color: RankingPalette.text,
    fontWeight: '700',
  },
  periodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexShrink: 1,
  },
  periodPressable: {
    minHeight: TouchTarget,
    justifyContent: 'center',
  },
  periodPressed: { opacity: 0.72 },
  periodPill: {
    minHeight: 34,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  periodLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  periodLabelSelected: { fontWeight: '700' },
  regionButton: {
    minHeight: TouchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginStart: 'auto',
    maxWidth: 104,
    paddingHorizontal: 2,
  },
  regionDisabled: { opacity: 0.5 },
  regionPressed: { opacity: 0.7 },
  regionLabel: {
    color: RankingPalette.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
});
