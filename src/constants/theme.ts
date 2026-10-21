/**
 * Design tokens for the app.
 *
 * Two layers live here:
 *   1. `Colors` — the light/dark social surface palette used by most screens.
 *   2. Scoped palettes (`RoomPalette`, `PremiumPalette`) — live-room and
 *      membership surfaces are intentionally darker than the social UI, so they
 *      are separate sets rather than more keys on the main palette.
 *
 * Values follow the reference visual system: white/soft-lavender social
 * surfaces, purple primary actions, pink greeting/intimacy controls, gold
 * currency, and heavy dark surfaces for live rooms and premium tiers.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',

    /** Raised card / sheet surfaces. */
    surface: '#ffffff',
    surfaceMuted: '#F7F6FA',
    border: '#E6E5EC',
    borderStrong: '#D5D3DF',

    /** Primary action colour (Join / Accept / Connect). */
    brand: '#7C4DF0',
    brandPressed: '#6A3DDB',
    brandSoft: '#F1EBFF',
    onBrand: '#FFFFFF',

    /** Greeting (HI), intimacy and relationship accents. */
    accent: '#DB2777',
    accentPressed: '#BE185D',
    accentSoft: '#FDE7F1',
    onAccent: '#FFFFFF',

    danger: '#D32F2F',
    success: '#2E7D32',
    warning: '#B26A00',
    gold: '#F5B301',

    /** Scrim behind sheets and dialogs. */
    overlay: 'rgba(17, 17, 24, 0.45)',
    skeleton: '#EDECF2',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',

    surface: '#101014',
    surfaceMuted: '#17171C',
    border: '#2A2A31',
    borderStrong: '#3A3A44',

    brand: '#8B5CF6',
    brandPressed: '#7C4DF0',
    brandSoft: '#241B3D',
    onBrand: '#FFFFFF',

    accent: '#F472B6',
    accentPressed: '#EC4899',
    accentSoft: '#3A1D2B',
    onAccent: '#2A0A1A',

    danger: '#F36A6A',
    success: '#4CC38A',
    warning: '#F5C453',
    gold: '#FFD24A',

    overlay: 'rgba(0, 0, 0, 0.6)',
    skeleton: '#212127',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/**
 * Live-room surfaces: full-bleed dark canvas, translucent chrome, purple
 * selection rings and gold currency. Deliberately not theme-aware — the room is
 * always dark regardless of the device scheme.
 */
export const RoomPalette = {
  canvas: '#0B0B14',
  surface: 'rgba(18, 18, 30, 0.72)',
  surfaceStrong: '#14141F',
  border: 'rgba(255, 255, 255, 0.14)',
  selection: '#8B5CF6',
  text: '#FFFFFF',
  textMuted: 'rgba(255, 255, 255, 0.68)',
  gold: '#FFD24A',
} as const;

/**
 * Premium/membership surfaces: near-black backdrops with metallic rank accents.
 */
export const PremiumPalette = {
  canvas: '#0A0A0C',
  surface: '#17171B',
  border: 'rgba(255, 255, 255, 0.12)',
  text: '#FFFFFF',
  textMuted: 'rgba(255, 255, 255, 0.66)',
  vip: '#C9A227',
  svip: '#D64545',
  aristocracy: '#2E9E5B',
} as const;

/**
 * The ranking stage.
 *
 * Like `RoomPalette`, this is deliberately a dark surface in both colour
 * schemes: the reference's leaderboard is a night-sky stage, not a light card.
 * Light and dark still get their own gradients (the dark one is deeper), while
 * the type, metallic medals and pink score heart stay constant. That keeps the
 * stage legible without asking the rest of the app to give up its light theme.
 */
export const RankingPalette = {
  text: '#FFFFFF',
  textMuted: 'rgba(255, 255, 255, 0.68)',
  textFaint: 'rgba(255, 255, 255, 0.45)',
  border: 'rgba(255, 255, 255, 0.13)',
  borderSoft: 'rgba(255, 255, 255, 0.07)',
  surface: 'rgba(255, 255, 255, 0.07)',
  surfaceStrong: 'rgba(255, 255, 255, 0.12)',
  /** Unselected period pills sit darker than the sky, as in the reference. */
  pill: 'rgba(18, 7, 36, 0.38)',
  heart: '#FF4F9A',
  brand: '#8B5CF6',
  brandBright: '#B49CFF',
  gold: '#F6C653',
  silver: '#D6DFEF',
  bronze: '#D99B6C',
  selfBar: 'rgba(9, 4, 20, 0.94)',
  skeleton: 'rgba(255, 255, 255, 0.10)',
  skeletonSoft: 'rgba(255, 255, 255, 0.06)',
  light: {
    top: '#451D79',
    middle: '#2A104F',
    bottom: '#140A29',
    glow: '#A46BFF',
  },
  dark: {
    top: '#2C1152',
    middle: '#1A0A33',
    bottom: '#080310',
    glow: '#7C3AED',
  },
} as const;

export type RankingScheme = 'light' | 'dark';

export type TabTintKey = 'home' | 'moments' | 'rooms' | 'messages' | 'me';

export type ChipTintKey =
  | 'neutral'
  | 'chat'
  | 'families'
  | 'video'
  | 'friendship'
  | 'official'
  | 'featured'
  | 'trending'
  /** Charm progress (gem) on the profile identity row. */
  | 'charm'
  /** Wealth progress (star) on the profile identity row. */
  | 'wealth'
  /** Agency/rank badge on the profile identity row. */
  | 'rank';

export type TierTintKey = 'vip' | 'svip' | 'aristocracy';

export type HonorToneKey = 'badges' | 'titles' | 'gifts';

/**
 * The chrome of one honour wall (reference screen 025).
 *
 * The wall's plate, medal and gift frame are generated art (one file per scheme),
 * so they are not tokens. What lives here is what the *screen* draws on top: the
 * title plaque, the filled title ribbon, the empty slot and the count chip. Those
 * carry text, so they have to be real views — a baked-in label could neither
 * translate nor mirror in RTL.
 */
export interface HonorTone {
  plaque: { from: string; to: string; border: string; text: string };
  ribbon: { from: string; to: string; border: string; text: string };
  slot: { border: string; text: string };
  chip: { background: string; text: string };
  /** The line under a badge medallion. */
  caption: string;
  grade: { background: string; text: string };
  rarity: { background: string; text: string };
}

/**
 * The tints that give each tab and each chip its identity.
 *
 * The reference app opens every primary tab with a soft hue that fades into the
 * page, and carries category/rank information in tinted pills. Those are colour
 * *sets*, so they live outside `Colors` (whose keys must stay flat for
 * `ThemedText`'s `themeColor`). `useTints()` resolves the active scheme, so no
 * component has to branch on light/dark itself.
 */
export interface AppTints {
  /** Header wash per primary tab; fades into `background`. */
  tab: Record<TabTintKey, string>;
  chip: Record<ChipTintKey, { background: string; text: string }>;
  tier: Record<TierTintKey, { from: string; to: string; text: string }>;
  /** Age/gender pill on discovery and feed rows. */
  age: { background: string; text: string };
  /** Gender glyph tint beside a display name. */
  gender: { female: string; male: string };
  /** Level emblem beside a display name. */
  level: { from: string; to: string; text: string };
  /** The couple card on the relationships tab. */
  couple: { from: string; to: string; text: string; muted: string };
  /** The three honour walls on the profile's Honour tab. */
  honor: Record<HonorToneKey, HonorTone>;
  /** The Me dashboard's own surfaces: membership tiles and game covers. */
  me: {
    /** The two cream-gold join tiles under the wallet row. */
    tierTile: { from: string; to: string; border: string; ink: string; accent: string };
    /** One gradient per mini-game; `ink` is the glyph colour on top. */
    game: Record<'spin' | 'quiz' | 'board', { from: string; to: string; ink: string }>;
  };
  /**
   * The ranking podium medals. The stage is always dark, so both schemes use
   * the same metallic inks: `fill` is a translucent column/medallion wash and
   * `ink` is the light text drawn over it.
   */
  ranking: {
    gold: { ring: string; fill: string; ink: string };
    silver: { ring: string; fill: string; ink: string };
    bronze: { ring: string; fill: string; ink: string };
  };
  /** Presence dot. */
  online: string;
  /** The verified seal beside a discovery name. */
  verified: string;
  /** The charm flower beside a discovery name. */
  flower: string;
  /** The greeting control. */
  hi: {
    background: string;
    backgroundTo: string;
    text: string;
    icon: string;
    border: string;
  };
  /** Full-bleed promotional gradients interleaved into feeds. */
  promo: Record<'families' | 'event' | 'recharge', { from: string; to: string; ctaInk: string }>;
  /** Card drop shadow colour. */
  cardShadow: string;
}

export const Tints: { light: AppTints; dark: AppTints } = {
  light: {
    tab: {
      home: '#E9E1FF',
      moments: '#EDE6FF',
      rooms: '#FCE3F2',
      messages: '#FFE7D6',
      me: '#FFF4D6',
    },
    chip: {
      neutral: { background: '#F0F0F3', text: '#60646C' },
      chat: { background: '#EFE8FF', text: '#6D4AE0' },
      families: { background: '#E4F7EC', text: '#1E8E4E' },
      video: { background: '#E4EEFF', text: '#2B6CE0' },
      friendship: { background: '#FFE7F1', text: '#D6336C' },
      official: { background: '#EFE8FF', text: '#6D4AE0' },
      featured: { background: '#7C4DF0', text: '#FFFFFF' },
      trending: { background: '#FF5A8A', text: '#FFFFFF' },
      charm: { background: '#DDF1FF', text: '#0E7FC0' },
      wealth: { background: '#EDE4FF', text: '#7A4DD8' },
      rank: { background: '#CFF6F4', text: '#0B8B86' },
    },
    tier: {
      vip: { from: '#FFD36A', to: '#F29B00', text: '#FFFFFF' },
      svip: { from: '#FF9A8A', to: '#D93636', text: '#FFFFFF' },
      aristocracy: { from: '#7EE0B0', to: '#1E8E4E', text: '#FFFFFF' },
    },
    age: { background: '#FFE3F0', text: '#D6336C' },
    gender: { female: '#D6336C', male: '#2B6CE0' },
    level: { from: '#FFE9A8', to: '#F0A500', text: '#5A3B00' },
    couple: { from: '#FF9EC6', to: '#F76BA8', text: '#FFFFFF', muted: 'rgba(255, 255, 255, 0.86)' },
    honor: {
      badges: {
        plaque: { from: '#FFBB61', to: '#EE7C1B', border: '#FFE7B8', text: '#FFFFFF' },
        ribbon: { from: '#FFD884', to: '#E8A11F', border: '#FFF2CE', text: '#5A3400' },
        slot: { border: 'rgba(255, 255, 255, 0.92)', text: '#B97A1E' },
        chip: { background: '#FFFFFF', text: '#C05E10' },
        caption: '#8A5A12',
        grade: { background: '#7B4DE0', text: '#FFFFFF' },
        rarity: { background: 'rgba(255, 255, 255, 0.94)', text: '#3F5FBF' },
      },
      titles: {
        plaque: { from: '#B37BF5', to: '#8A45E0', border: '#F0E2FF', text: '#FFFFFF' },
        ribbon: { from: '#FFD884', to: '#E8A11F', border: '#FFF2CE', text: '#5A3400' },
        slot: { border: 'rgba(255, 255, 255, 0.92)', text: '#6B3BC0' },
        chip: { background: '#FFFFFF', text: '#6B3BC0' },
        caption: '#5B3597',
        grade: { background: '#7B4DE0', text: '#FFFFFF' },
        rarity: { background: 'rgba(255, 255, 255, 0.94)', text: '#5B3597' },
      },
      gifts: {
        plaque: { from: '#8FB3F2', to: '#5E7EE0', border: '#E2ECFF', text: '#FFFFFF' },
        ribbon: { from: '#FFD884', to: '#E8A11F', border: '#FFF2CE', text: '#5A3400' },
        slot: { border: 'rgba(255, 255, 255, 0.92)', text: '#3F5FBF' },
        chip: { background: '#FFFFFF', text: '#3F5FBF' },
        caption: '#3F5FBF',
        grade: { background: '#7B4DE0', text: '#FFFFFF' },
        rarity: { background: 'rgba(255, 255, 255, 0.94)', text: '#3F5FBF' },
      },
    },
    online: '#22C55E',
    verified: '#1FC7A6',
    flower: '#FF5C9E',
    hi: {
      background: '#FFE4F1',
      backgroundTo: '#FFBEDA',
      text: '#E5307A',
      icon: '#F04C93',
      border: 'rgba(240, 76, 147, 0.20)',
    },
    promo: {
      families: { from: '#8B5CF6', to: '#EC4899', ctaInk: '#8B2FA8' },
      event: { from: '#F59E0B', to: '#EF4444', ctaInk: '#B45309' },
      recharge: { from: '#0EA5E9', to: '#6366F1', ctaInk: '#1D4ED8' },
    },
    me: {
      tierTile: {
        from: '#FFF7DE',
        to: '#FFE7B0',
        border: '#F4CE79',
        ink: '#6B4A00',
        accent: '#DE9A16',
      },
      game: {
        spin: { from: '#8B5CF6', to: '#EC4899', ink: '#FFFFFF' },
        quiz: { from: '#3B82F6', to: '#06B6D4', ink: '#FFFFFF' },
        board: { from: '#F59E0B', to: '#EF4444', ink: '#FFFFFF' },
      },
    },
    ranking: {
      gold: { ring: '#F6C653', fill: 'rgba(246, 198, 83, 0.18)', ink: '#FFE6A6' },
      silver: { ring: '#D6DFEF', fill: 'rgba(214, 223, 239, 0.13)', ink: '#EEF3FB' },
      bronze: { ring: '#D99B6C', fill: 'rgba(217, 155, 108, 0.16)', ink: '#F7D7BE' },
    },
    cardShadow: 'rgba(46, 32, 84, 0.10)',
  },
  dark: {
    tab: {
      home: '#1E1830',
      moments: '#1E1830',
      rooms: '#2C1626',
      messages: '#2C1E14',
      me: '#2C2612',
    },
    chip: {
      neutral: { background: '#22222A', text: '#B0B4BA' },
      chat: { background: '#251C40', text: '#B9A6FF' },
      families: { background: '#14301F', text: '#6FD79C' },
      video: { background: '#152742', text: '#8FBCFF' },
      friendship: { background: '#3A1D2B', text: '#FF9EC4' },
      official: { background: '#251C40', text: '#B9A6FF' },
      featured: { background: '#5B34C8', text: '#FFFFFF' },
      trending: { background: '#C0335F', text: '#FFFFFF' },
      charm: { background: '#102C3E', text: '#7FD4FF' },
      wealth: { background: '#251C40', text: '#C0A8FF' },
      rank: { background: '#0E3331', text: '#6FE0DA' },
    },
    tier: {
      vip: { from: '#8A6410', to: '#C98A00', text: '#FFF3D2' },
      svip: { from: '#7A2424', to: '#A83333', text: '#FFE1DA' },
      aristocracy: { from: '#1E4D30', to: '#1F7A44', text: '#E6FFEE' },
    },
    age: { background: '#3A1D2B', text: '#FF9EC4' },
    gender: { female: '#FF9EC4', male: '#8FBCFF' },
    level: { from: '#4A3A0E', to: '#C98A00', text: '#FFE9A8' },
    couple: { from: '#8C2A50', to: '#5C1B36', text: '#FFE3EF', muted: 'rgba(255, 227, 239, 0.8)' },
    honor: {
      badges: {
        plaque: { from: '#C9871F', to: '#8A5A10', border: '#F3D391', text: '#FFF7E6' },
        ribbon: { from: '#B9841E', to: '#7A5310', border: '#E8C778', text: '#FFF3D2' },
        slot: { border: 'rgba(255, 255, 255, 0.42)', text: '#E8C275' },
        chip: { background: '#2A1C08', text: '#F5D89A' },
        caption: '#E8C275',
        grade: { background: '#6B41C8', text: '#FFFFFF' },
        rarity: { background: 'rgba(20, 26, 44, 0.86)', text: '#DCE8FF' },
      },
      titles: {
        plaque: { from: '#7A4FD0', to: '#4A2A8A', border: '#CDB2F7', text: '#F7F1FF' },
        ribbon: { from: '#B9841E', to: '#7A5310', border: '#E8C778', text: '#FFF3D2' },
        slot: { border: 'rgba(255, 255, 255, 0.38)', text: '#C9AEF0' },
        chip: { background: '#221538', text: '#CDB2F7' },
        caption: '#C9AEF0',
        grade: { background: '#6B41C8', text: '#FFFFFF' },
        rarity: { background: 'rgba(28, 20, 48, 0.86)', text: '#DDCBFF' },
      },
      gifts: {
        plaque: { from: '#4A63C0', to: '#2C3E86', border: '#B7C9F7', text: '#EEF4FF' },
        ribbon: { from: '#B9841E', to: '#7A5310', border: '#E8C778', text: '#FFF3D2' },
        slot: { border: 'rgba(255, 255, 255, 0.38)', text: '#A9C2F2' },
        chip: { background: '#141F3C', text: '#B7C9F7' },
        caption: '#A9C2F2',
        grade: { background: '#6B41C8', text: '#FFFFFF' },
        rarity: { background: 'rgba(14, 22, 44, 0.86)', text: '#C6D8FF' },
      },
    },
    online: '#4ADE80',
    verified: '#3EE0BC',
    flower: '#FF8FBF',
    hi: {
      background: '#3A1D2B',
      backgroundTo: '#5A2540',
      text: '#FFB3D1',
      icon: '#FF7FB6',
      border: 'rgba(255, 158, 196, 0.22)',
    },
    promo: {
      families: { from: '#6D28D9', to: '#BE185D', ctaInk: '#7A2A99' },
      event: { from: '#B45309', to: '#B91C1C', ctaInk: '#9A3412' },
      recharge: { from: '#1D4ED8', to: '#4338CA', ctaInk: '#1E40AF' },
    },
    me: {
      tierTile: {
        from: '#332A14',
        to: '#463414',
        border: '#5E4820',
        ink: '#FFE3A6',
        accent: '#F0B84A',
      },
      game: {
        spin: { from: '#6D28D9', to: '#BE185D', ink: '#FFFFFF' },
        quiz: { from: '#1D4ED8', to: '#0E7490', ink: '#FFFFFF' },
        board: { from: '#B45309', to: '#B91C1C', ink: '#FFFFFF' },
      },
    },
    ranking: {
      gold: { ring: '#F6C653', fill: 'rgba(246, 198, 83, 0.18)', ink: '#FFE6A6' },
      silver: { ring: '#D6DFEF', fill: 'rgba(214, 223, 239, 0.13)', ink: '#EEF3FB' },
      bronze: { ring: '#D99B6C', fill: 'rgba(217, 155, 108, 0.16)', ink: '#F7D7BE' },
    },
    cardShadow: 'rgba(0, 0, 0, 0.5)',
  },
};

/**
 * Card elevation. One preset so every raised surface in the app reads as the
 * same height — the reference uses a single very soft shadow throughout.
 */
export const CardShadow = {
  shadowColor: '#2E2054',
  shadowOpacity: 0.1,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
} as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  small: 8,
  medium: 12,
  large: 18,
  xlarge: 28,
  pill: 999,
} as const;

/**
 * Minimum accessible touch target. 44pt is Apple's guidance and comfortably
 * exceeds Android's 48dp at default density when applied to icon buttons.
 */
export const TouchTarget = 44;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
