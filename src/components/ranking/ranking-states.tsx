import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, RankingPalette, Spacing } from '@/constants/theme';
import type { IconName } from '@/components/ui/icon';

import { ThemedText } from '../themed-text';
import { Icon } from '../ui/icon';

export interface RankingLoadingProps {
  categoryLabel: string;
}

/**
 * Static skeleton. There is no shimmer: the stage already has a lot of visual
 * detail, and a moving highlight would need a reduced-motion branch for no
 * informational gain.
 */
export function RankingLoading({ categoryLabel }: RankingLoadingProps) {
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`Loading ${categoryLabel} rankings`}
      style={styles.loading}
    >
      <View
        style={styles.skeletonStage}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <View style={[styles.skeletonColumn, { height: 116 }]} />
        <View style={[styles.skeletonColumn, { height: 146 }]} />
        <View style={[styles.skeletonColumn, { height: 126 }]} />
      </View>

      <View
        style={styles.skeletonRows}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {[0, 1, 2, 3, 4].map((row) => (
          <View key={row} style={styles.skeletonRow}>
            <View style={styles.skeletonAvatar} />
            <View style={styles.skeletonBody}>
              <View style={[styles.skeletonLine, { width: `${52 + ((row * 9) % 24)}%` }]} />
              <View style={[styles.skeletonLine, styles.skeletonShort]} />
            </View>
            <View style={styles.skeletonValue} />
          </View>
        ))}
      </View>
    </View>
  );
}

export interface RankingErrorProps {
  onRetry: () => void;
}

export function RankingError({ onRetry }: RankingErrorProps) {
  return (
    <View style={styles.centered} accessibilityRole="alert">
      <View style={styles.iconCircle}>
        <Icon name="alert" size={30} strokeWidth={2} color={RankingPalette.textMuted} />
      </View>
      <ThemedText style={styles.title}>Rankings unavailable</ThemedText>
      <ThemedText style={styles.message}>
        We could not load this board. Check your connection and try again.
      </ThemedText>
      <StageButton label="Try again" onPress={onRetry} />
    </View>
  );
}

export interface RankingUnavailableProps {
  title: string;
  message: string;
  icon: IconName;
}

export function RankingUnavailable({ title, message, icon }: RankingUnavailableProps) {
  return (
    <View style={styles.centered} accessibilityRole="summary">
      <View style={styles.iconCircle}>
        <Icon name={icon} size={30} strokeWidth={2} color={RankingPalette.textMuted} />
      </View>
      <ThemedText style={styles.title}>{title}</ThemedText>
      <ThemedText style={styles.message}>{message}</ThemedText>
    </View>
  );
}

export interface RankingEmptyProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function RankingEmpty({ title, message, actionLabel, onAction }: RankingEmptyProps) {
  return (
    <View style={styles.centered} accessibilityRole="summary">
      <View style={styles.iconCircle}>
        <Icon name="search" size={30} strokeWidth={2} color={RankingPalette.textMuted} />
      </View>
      <ThemedText style={styles.title}>{title}</ThemedText>
      <ThemedText style={styles.message}>{message}</ThemedText>
      {actionLabel && onAction ? <StageButton label={actionLabel} onPress={onAction} /> : null}
    </View>
  );
}

interface StageButtonProps {
  label: string;
  onPress: () => void;
  leading?: ReactNode;
}

/** A 44-point action on the stage; the error and empty states both use it. */
export function StageButton({ label, onPress, leading }: StageButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
    >
      {leading}
      <ThemedText style={styles.buttonLabel}>{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    paddingTop: Spacing.three,
    paddingHorizontal: Spacing.three,
    gap: Spacing.three,
  },
  skeletonStage: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  skeletonColumn: {
    flex: 1,
    maxWidth: 120,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderWidth: 1,
    borderColor: RankingPalette.borderSoft,
    backgroundColor: RankingPalette.skeletonSoft,
  },
  skeletonRows: { gap: 4 },
  skeletonRow: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.one,
  },
  skeletonAvatar: {
    width: 52,
    height: 52,
    borderRadius: Radius.pill,
    backgroundColor: RankingPalette.skeletonSoft,
  },
  skeletonBody: { flex: 1, gap: 7 },
  skeletonLine: {
    height: 10,
    borderRadius: Radius.pill,
    backgroundColor: RankingPalette.skeleton,
  },
  skeletonShort: { width: '30%', height: 8, opacity: 0.7 },
  skeletonValue: {
    width: 46,
    height: 12,
    borderRadius: Radius.pill,
    backgroundColor: RankingPalette.skeleton,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.five,
    gap: Spacing.two,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: RankingPalette.surface,
    borderWidth: 1,
    borderColor: RankingPalette.borderSoft,
    marginBottom: Spacing.one,
  },
  title: {
    color: RankingPalette.text,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    color: RankingPalette.textMuted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
    textAlign: 'center',
    maxWidth: 300,
  },
  button: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.four,
    marginTop: Spacing.two,
    borderRadius: Radius.pill,
    backgroundColor: RankingPalette.brand,
  },
  buttonPressed: { opacity: 0.75 },
  buttonLabel: {
    color: RankingPalette.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
});
