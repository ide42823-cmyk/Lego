import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from '../themed-text';

/**
 * Transient confirmation/notice banner.
 *
 * Not animated on purpose: it appears and disappears instantly, so it needs no
 * reduced-motion special case and cannot trap focus or block input
 * (`pointerEvents="none"`).
 */

const VISIBLE_MS = 2600;

interface ToastMessage {
  id: number;
  text: string;
}

interface ToastApi {
  show: (text: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const value = useContext(ToastContext);
  if (!value) {
    throw new Error('useToast must be used inside <ToastProvider>');
  }
  return value;
}

export interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState<ToastMessage | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const counterRef = useRef(0);

  const show = useCallback((text: string) => {
    counterRef.current += 1;
    setMessage({ id: counterRef.current, text });
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => setMessage(null), VISIBLE_MS);
  }, []);

  useEffect(
    () => () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    },
    [],
  );

  const api = useMemo<ToastApi>(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={api}>
      <View style={styles.root}>
        {children}
        {message ? (
          <View
            pointerEvents="none"
            style={[styles.host, { paddingBottom: insets.bottom + Spacing.six }]}
          >
            <View
              style={[styles.toast, { backgroundColor: theme.text }]}
              accessibilityLiveRegion="polite"
              accessibilityRole="alert"
            >
              <ThemedText type="small" style={{ color: theme.background }}>
                {message.text}
              </ThemedText>
            </View>
          </View>
        ) : null}
      </View>
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  // The provider owns a real view so the absolutely-positioned host has a
  // positioned ancestor instead of relying on the app root.
  root: { flex: 1 },
  host: {
    position: 'absolute',
    start: 0,
    end: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
  },
  toast: {
    maxWidth: 420,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
  },
});
