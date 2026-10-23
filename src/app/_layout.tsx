import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { ErrorBoundary } from '@/components/error-boundary';
import { ToastProvider } from '@/components/ui/toast';

SplashScreen.preventAutoHideAsync();

/**
 * Root layout.
 *
 * Ordering matters here:
 *   - `SafeAreaProvider` is explicit because the toast host and modal overlays
 *     render outside the navigator and still need inset values.
 *   - `ToastProvider` sits above the stack so any screen can raise a notice.
 *   - The root is a `<Stack>`, which is what makes non-tab routes (for example
 *     the development RTC spike at `dev/rtc-spike`) reachable at all.
 */
export default function RootLayout() {
  const colorScheme = useColorScheme();

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
              <Stack.Screen name="dev/rtc-spike" options={{ title: 'RTC spike (dev only)' }} />
            </Stack>
          </ToastProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
