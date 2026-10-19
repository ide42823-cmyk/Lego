import { Tints, type AppTints } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/**
 * Resolves the tint set (tab washes, chip colours, rank gradients) for the
 * active colour scheme, so components never branch on light/dark themselves.
 */
export function useTints(): AppTints {
  const scheme = useColorScheme();

  return scheme === 'dark' ? Tints.dark : Tints.light;
}
