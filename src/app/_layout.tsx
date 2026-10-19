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
              <Stack.Screen name="dev/rtc-spike" options={{ title: 'RTC spike (dev only)' }} />
            </Stack>
          </ToastProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
