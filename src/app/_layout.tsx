import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { ErrorBoundary } from '@/components/error-boundary';

SplashScreen.preventAutoHideAsync();

/**
 * Root layout. A stack wraps everything so non-tab routes (for example the
 * development RTC spike at `dev/rtc-spike`) have a navigator to render into.
 */
export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ErrorBoundary>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="dev/rtc-spike" options={{ title: 'RTC spike (dev only)' }} />
        </Stack>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
