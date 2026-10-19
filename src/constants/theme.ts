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

export type TabTintKey = 'home' | 'moments' | 'rooms' | 'messages' | 'me';

export type ChipTintKey =
  'neutral' | 'chat' | 'families' | 'video' | 'friendship' | 'official' | 'featured' | 'trending';

export type TierTintKey = 'vip' | 'svip' | 'aristocracy';

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
  /** Level emblem beside a display name. */
  level: { from: string; to: string; text: string };
  /** Presence dot. */
  online: string;
  /** The greeting control. */
  hi: { background: string; text: string; icon: string };
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
    },
    tier: {
      vip: { from: '#FFE9A8', to: '#F5B301', text: '#6B4A00' },
      svip: { from: '#FFD9D0', to: '#E05252', text: '#611414' },
      aristocracy: { from: '#E2F6E8', to: '#2E9E5B', text: '#0E4023' },
    },
    age: { background: '#FFE3F0', text: '#D6336C' },
    level: { from: '#FFE9A8', to: '#F0A500', text: '#5A3B00' },
    online: '#22C55E',
    hi: { background: '#FFDCEA', text: '#E5307A', icon: '#F04088' },
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
    },
    tier: {
      vip: { from: '#4A3A0E', to: '#B98A00', text: '#FFE9A8' },
      svip: { from: '#4A1A1A', to: '#A83333', text: '#FFD9D0' },
      aristocracy: { from: '#12331E', to: '#1F7A44', text: '#DFF5E4' },
    },
    age: { background: '#3A1D2B', text: '#FF9EC4' },
    level: { from: '#4A3A0E', to: '#C98A00', text: '#FFE9A8' },
    online: '#4ADE80',
    hi: { background: '#3A1D2B', text: '#FF9EC4', icon: '#FF9EC4' },
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
