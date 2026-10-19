/**
 * Direction and locale helpers.
 *
 * Approach: structural RTL rather than per-screen fixes.
 *   - Layout code uses logical properties (`marginStart`, `paddingEnd`,
 *     `start`/`end`) instead of `left`/`right`, so React Native mirrors it.
 *   - Text alignment is derived from the active direction at the point of use,
 *     because a single screen can contain both Arabic and Latin runs.
 *
 * The app does not force RTL globally. `I18nManager` reflects the device/app
 * setting, which is what real users expect.
 */

import { I18nManager } from 'react-native';

export type Direction = 'ltr' | 'rtl';

/** The active layout direction. */
export function getDirection(): Direction {
  return I18nManager.isRTL ? 'rtl' : 'ltr';
}

/** Text alignment that follows the layout direction. */
export function textAlignStart(): 'left' | 'right' {
  return I18nManager.isRTL ? 'right' : 'left';
}

/**
 * True when a string contains any right-to-left script. Used to align mixed
 * content (for example an Arabic name inside an otherwise Latin row) correctly.
 */
const RTL_SCRIPT = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;

export function isRTLLanguageText(value: string): boolean {
  return RTL_SCRIPT.test(value);
}

/** Alignment for a specific string, independent of the layout direction. */
export function textAlignFor(value: string): 'left' | 'right' {
  return isRTLLanguageText(value) ? 'right' : 'left';
}
