import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

import { RankingPalette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/**
 * A few still stars. They are deliberately not animated: the stage already
 * carries a lot of detail, and a twinkling background would ignore reduced
 * motion for no informational gain.
 */
const STARS = [
  { left: '8%', top: '9%', size: 2, opacity: 0.45, tint: 'white' },
  { left: '22%', top: '16%', size: 3, opacity: 0.3, tint: 'purple' },
  { left: '38%', top: '7%', size: 2, opacity: 0.35, tint: 'white' },
  { left: '57%', top: '12%', size: 2, opacity: 0.5, tint: 'gold' },
  { left: '74%', top: '6%', size: 3, opacity: 0.28, tint: 'white' },
  { left: '89%', top: '17%', size: 2, opacity: 0.4, tint: 'purple' },
  { left: '12%', top: '31%', size: 2, opacity: 0.32, tint: 'white' },
  { left: '31%', top: '26%', size: 2, opacity: 0.45, tint: 'gold' },
  { left: '67%', top: '30%', size: 2, opacity: 0.35, tint: 'white' },
  { left: '84%', top: '38%', size: 3, opacity: 0.24, tint: 'purple' },
  { left: '5%', top: '53%', size: 2, opacity: 0.25, tint: 'white' },
  { left: '94%', top: '57%', size: 2, opacity: 0.3, tint: 'white' },
  { left: '17%', top: '68%', size: 2, opacity: 0.2, tint: 'purple' },
  { left: '78%', top: '72%', size: 2, opacity: 0.22, tint: 'white' },
  { left: '43%', top: '84%', size: 2, opacity: 0.18, tint: 'white' },
  { left: '62%', top: '91%', size: 3, opacity: 0.16, tint: 'purple' },
] as const;

export interface RankingBackgroundProps {
  /** Tie the radial glow to the podium rather than the whole page. */
  glowY?: number;
}

/**
 * The full-bleed night-sky stage.
 *
 * The gradient and glow are original compositions. The reference's engraved
 * columns and ornate frames are not reproduced; the podium draws its own
 * simpler arches, and the avatar frames are the app's existing art.
 */
export function RankingBackground({ glowY = 28 }: RankingBackgroundProps) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = RankingPalette[scheme];

  return (
    <View style={styles.backdrop} pointerEvents="none" aria-hidden>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={StyleSheet.absoluteFill}
      >
        <Defs>
          <LinearGradient
            id={`ranking-sky-${scheme}`}
            x1="0"
            y1="0"
            x2="0"
            y2="100"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor={colors.top} />
            <Stop offset="0.48" stopColor={colors.middle} />
            <Stop offset="1" stopColor={colors.bottom} />
          </LinearGradient>
          <RadialGradient
            id={`ranking-glow-${scheme}`}
            cx="50"
            cy={String(glowY)}
            r="62"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor={colors.glow} stopOpacity="0.62" />
            <Stop offset="0.48" stopColor={colors.glow} stopOpacity="0.22" />
            <Stop offset="1" stopColor={colors.glow} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100" height="100" fill={`url(#ranking-sky-${scheme})`} />
        <Rect x="0" y="0" width="100" height="100" fill={`url(#ranking-glow-${scheme})`} />
      </Svg>

      {STARS.map((star, index) => (
        <View
          key={`${star.left}-${star.top}-${index}`}
          style={[
            styles.star,
            {
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              borderRadius: star.size,
              opacity: star.opacity,
              backgroundColor:
                star.tint === 'gold'
                  ? RankingPalette.gold
                  : star.tint === 'purple'
                    ? RankingPalette.brandBright
                    : RankingPalette.text,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
  },
  star: { position: 'absolute' },
});
