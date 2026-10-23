/**
 * The app's typeface. The reference screens draw a rounded, geometric sans in
 * heavy tiers for both Latin and Arabic body text; the system font is too
 * neutral and too light to read as the same product.
 *
 * Cairo (SIL Open Font License) is the bundled family: it covers Arabic and
 * Latin in one design with true weights 400–900, so RTL mixed content inherits
 * the same rhythm instead of a fallback. Each weight is a separate static face
 * (Android does not synthesize weights from one variable file reliably), so
 * styles pick a family by integer weight — see `typefaceForWeight`.
 *
 * Text that declares no weight falls back to the body face (500).
 */
import { Cairo_400Regular as Regular400 } from '@expo-google-fonts/cairo/400Regular';
import { Cairo_500Medium as Medium500 } from '@expo-google-fonts/cairo/500Medium';
import { Cairo_600SemiBold as SemiBold600 } from '@expo-google-fonts/cairo/600SemiBold';
import { Cairo_700Bold as Bold700 } from '@expo-google-fonts/cairo/700Bold';
import { Cairo_800ExtraBold as ExtraBold800 } from '@expo-google-fonts/cairo/800ExtraBold';
import { Cairo_900Black as Black900 } from '@expo-google-fonts/cairo/900Black';

export type TypefaceKey =
  | 'Cairo_400Regular'
  | 'Cairo_500Medium'
  | 'Cairo_600SemiBold'
  | 'Cairo_700Bold'
  | 'Cairo_800ExtraBold'
  | 'Cairo_900Black';

/** The bundled faces, keyed by their family name. `useFonts` consumes this. */
export const TYPEFACES: Record<TypefaceKey, typeof Regular400> = {
  Cairo_400Regular: Regular400,
  Cairo_500Medium: Medium500,
  Cairo_600SemiBold: SemiBold600,
  Cairo_700Bold: Bold700,
  Cairo_800ExtraBold: ExtraBold800,
  Cairo_900Black: Black900,
};

/** Integer weight a style requested; undefined → body default. */
export function typefaceForWeight(weight?: number | string | null): TypefaceKey {
  switch (weight) {
    case 'normal':
    case 400:
      return 'Cairo_400Regular';
    case 600:
    case '600':
      return 'Cairo_600SemiBold';
    case 'bold':
    case 700:
    case '700':
      return 'Cairo_700Bold';
    case 800:
    case '800':
      return 'Cairo_800ExtraBold';
    case 900:
    case '900':
      return 'Cairo_900Black';
    default:
      return 'Cairo_500Medium';
  }
}
