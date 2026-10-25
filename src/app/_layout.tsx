import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { ErrorBoundary } from '@/components/error-boundary';
import { ToastProvider } from '@/components/ui/toast';
import { DISPLAY_FACES, TYPEFACES } from '@/constants/typography';

SplashScreen.preventAutoHideAsync();

/**
 * Root layout.
 *
 * Ordering matters here:
 *   - `SafeAreaProvider` is explicit because the toast host and modal overlays
 *     render outside the navigator and still need inset values.
 *   - `ToastProvider` sits above the stack so any screen can raise a notice.
 *   - The bundled Cairo faces load before the shell mounts, so no screen ever
 *     lays out with the OS fallback and then snaps.
 *   - The root is a `<Stack>`, which is what makes non-tab routes (for example
 *     the development RTC spike at `dev/rtc-spike`) reachable at all.
 */
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontsError] = useFonts({ ...TYPEFACES, ...DISPLAY_FACES });

  if (!fontsLoaded && !fontsError) {
    // The native splash stays up until the faces are ready and the overlay
    // animation hides it — the shell must not mount with fallback fonts.
    return null;
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <ToastProvider>
            <AnimatedSplashOverlay />
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              {/* A pushed screen with a custom collapsing header of its own. */}
              <Stack.Screen name="person/[id]" options={{ headerShown: false }} />
              {/* Search owns its header (field + Cancel), so the stack one is hidden. */}
              <Stack.Screen name="search" options={{ headerShown: false }} />
              {/* Ranking draws its own centred back header. */}
              <Stack.Screen name="ranking" options={{ headerShown: false }} />
              {/* Threads own their bar, with the composer anchored below. */}
              <Stack.Screen name="thread/[id]" options={{ headerShown: false }} />
              {/* Rooms draw their own full-bleed canvas. */}
              <Stack.Screen name="room/[id]" options={{ headerShown: false }} />
              {/* Wallets and membership hubs carry their own fixed-identity bars. */}
              <Stack.Screen name="wallet/diamonds" options={{ headerShown: false }} />
              <Stack.Screen name="membership/[family]" options={{ headerShown: false }} />
              <Stack.Screen name="dev/rtc-spike" options={{ title: 'RTC spike (dev only)' }} />
            </Stack>
          </ToastProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
