import { useId } from 'react';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

/**
 * Our own rank emblem: a shield with its crown, blade, gem and two side flares,
 * drawn from paths. The reference's sculpted crests are proprietary art and
 * stay out — what carries over is the composition (a tall centred crest that
 * reads at tab size) and one metal per rung.
 *
 * The metals are fixed here rather than in the theme: the aristocracy page is a
 * dark premium surface in both colour schemes, exactly like the VIP page.
 */
export interface AristocracyMetal {
  /** Gradient's top stop. */
  core: string;
  /** Gradient's bottom stop. */
  deep: string;
  /** The bright outline and blade. */
  edge: string;
  /** The crown and centre gem. */
  gem: string;
}

export const ARISTOCRACY_METALS: Record<string, AristocracyMetal> = {
  knight: { core: '#5ACB86', deep: '#1E7A46', edge: '#EAFFF1', gem: '#B8F5C9' },
  viscount: { core: '#7EC4F2', deep: '#3A7FB0', edge: '#EAF7FF', gem: '#C6E7FF' },
  count: { core: '#4E7FE8', deep: '#24459C', edge: '#E9EFFF', gem: '#A9C0FF' },
  marquis: { core: '#A377EC', deep: '#5B2FA8', edge: '#F3EBFF', gem: '#D2B8FF' },
  duke: { core: '#E86FA8', deep: '#9C2E63', edge: '#FFEAF4', gem: '#FFB6D6' },
  king: { core: '#E8C15C', deep: '#A02A22', edge: '#FFF4D2', gem: '#FFD98A' },
};

const FALLBACK: AristocracyMetal = ARISTOCRACY_METALS.knight as AristocracyMetal;

/** The metal a rank key paints with; unknown keys fall back to the entry rung. */
export function metalFor(rank: string): AristocracyMetal {
  return ARISTOCRACY_METALS[rank] ?? FALLBACK;
}

const CROWN = 'M40 27 L46 13 L53 23 L60 8 L67 23 L74 13 L80 27 Z';
const SHIELD = 'M60 24 L104 37 L104 72 C104 100 85 118 60 128 C35 118 16 100 16 72 L16 37 Z';
const INNER = 'M60 33 L96 43 L96 72 C96 95 81 110 60 118 C39 110 24 95 24 72 L24 43 Z';
const BLADE = 'M60 40 L70 68 L60 112 L50 68 Z';
const GEM = 'M60 60 L69 71 L60 82 L51 71 Z';
const FLARE_LEFT = 'M16 52 L1 36 L11 60 L1 74 L16 80 Z';
const FLARE_RIGHT = 'M104 52 L119 36 L109 60 L119 74 L104 80 Z';

export interface AristocracyEmblemProps {
  /** The rung's key, e.g. "viscount". */
  rank: string;
  /** Rendered edge length in points. */
  size?: number;
}

export function AristocracyEmblem({ rank, size = 168 }: AristocracyEmblemProps) {
  const metal = metalFor(rank);
  // The gradient id must be unique per instance: the hero and a tile preview
  // can share one screen.
  const id = `aristo-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  return (
    <Svg width={size} height={(size * 136) / 120} viewBox="0 0 120 136">
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={metal.core} />
          <Stop offset="1" stopColor={metal.deep} />
        </LinearGradient>
      </Defs>

      <Path d={FLARE_LEFT} fill={metal.deep} opacity={0.9} />
      <Path d={FLARE_RIGHT} fill={metal.deep} opacity={0.9} />

      <Path d={SHIELD} fill={`url(#${id})`} stroke={metal.edge} strokeWidth={3} />
      <Path d={INNER} fill="#0C0A08" opacity={0.28} />
      <Path d={BLADE} fill={metal.edge} opacity={0.62} />
      <Path d={GEM} fill={metal.gem} stroke={metal.edge} strokeWidth={1.5} />

      <Path d={CROWN} fill={metal.gem} stroke={metal.edge} strokeWidth={2} />
    </Svg>
  );
}
