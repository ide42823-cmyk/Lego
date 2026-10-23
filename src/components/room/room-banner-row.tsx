import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { RoomPalette, Spacing } from '@/constants/theme';
import { imageSource } from '@/core/media/images';

import { Icon } from '../ui/icon';
import { ThemedText } from '../themed-text';

const TINT = 'rgba(10, 10, 20, 0.45)';

export interface RoomBannerRowProps {
  rankLabel: string;
  /** Free headline shown in the marquee-adjacent group. */
  progressLabel: string;
  countdownLabel: string;
  freeDraw: boolean;
  coverUrl?: string;
  /** Rank, ticker and draw are event furniture; all report the backend gate. */
  onPressRank: () => void;
  onPressTicker: () => void;
  onPressFreeDraw: () => void;
}

/**
 * The strip under the host header: the rank pill (trophy + label), the draw
 * board fill and its next-draw clock, and the gold free-draw crest. Every
 * piece is event furniture owned by the backend, so presses report the gate
 * instead of routing anywhere.
 */
export function RoomBannerRow({
  rankLabel,
  progressLabel,
  countdownLabel,
  freeDraw,
  coverUrl,
  onPressRank,
  onPressTicker,
  onPressFreeDraw,
}: RoomBannerRowProps) {
  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Room ranking: ${rankLabel}`}
        accessibilityHint="Opens the room ranking"
        onPress={onPressRank}
        style={({ pressed }) => [styles.rank, pressed && { opacity: 0.85 }]}
      >
        <Icon name="trophy" size={18} color={RoomPalette.gold} fill={RoomPalette.gold} />
        <ThemedText type="small" style={styles.rankText}>
          {rankLabel}
        </ThemedText>
      </Pressable>
      <View style={styles.flexible} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Draw board at ${progressLabel}, next draw in ${countdownLabel}`}
        accessibilityHint="States whether draws are available yet"
        onPress={onPressTicker}
        style={({ pressed }) => [styles.ticker, styles.row, pressed && { opacity: 0.85 }]}
      >
        <View style={styles.dot} />
        <ThemedText type="small" numberOfLines={1} style={styles.progress}>
          {progressLabel}
        </ThemedText>
        <ThemedText type="small" style={styles.clock}>
          {countdownLabel}
        </ThemedText>
      </Pressable>
      {freeDraw ? (
        <PressableBanner source={coverUrl} label="Free draw" onPress={onPressFreeDraw} />
      ) : null}
    </View>
  );
}

function PressableBanner({
  source,
  label,
  onPress,
}: {
  source?: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint="States whether free draws arrive with the backend phase"
      onPress={onPress}
      style={({ pressed }) => [styles.draw, pressed && { opacity: 0.85 }]}
    >
      {source ? (
        <View style={[StyleSheet.absoluteFill, styles.drawArtWrap]}>
          <Image style={StyleSheet.absoluteFill} source={imageSource(source)} blurRadius={6} contentFit="cover" />
        </View>
      ) : null}
      <ThemedText type="small" style={styles.drawLabel}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
    marginBottom: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rank: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: TINT,
    borderRadius: 16,
    paddingHorizontal: 10,
    height: 30,
  },
  rankText: {
    color: RoomPalette.gold,
    fontWeight: 700,
  },
  flexible: {
    flex: 1,
    minWidth: 8,
  },
  ticker: {
    height: 28,
    borderRadius: 14,
    paddingHorizontal: 10,
    gap: 6,
    backgroundColor: TINT,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: RoomPalette.selection,
  },
  progress: {
    color: RoomPalette.textMuted,
    fontWeight: 700,
  },
  clock: {
    color: RoomPalette.text,
    fontWeight: 700,
  },
  draw: {
    borderRadius: 14,
    height: 30,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    backgroundColor: 'rgba(255, 210, 74, 0.16)',
    borderWidth: 1,
    borderColor: RoomPalette.gold,
    borderStyle: 'solid',
    overflow: 'hidden',
  },
  drawArtWrap: {
    opacity: 0.35,
  },
  drawLabel: {
    color: RoomPalette.gold,
    fontWeight: 800,
  },
});
