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
