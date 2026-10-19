import { StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { AppButton } from './app-button';
import { ThemedText } from '../themed-text';

export interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Neutral "nothing here yet" state. Never blocks the rest of the screen. */
export function EmptyState({ title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container} accessibilityRole="summary">
      <ThemedText type="smallBold">{title}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.centered}>
        {message}
      </ThemedText>
      {actionLabel && onAction ? (
        <AppButton label={actionLabel} variant="secondary" onPress={onAction} />
      ) : null}
    </View>
  );
}

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

/** Recoverable failure. Always offers a retry when one is possible. */
export function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load this. Check your connection and try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <View style={styles.container} accessibilityRole="alert">
      <ThemedText type="smallBold">{title}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.centered}>
        {message}
      </ThemedText>
      {onRetry ? <AppButton label="Try again" onPress={onRetry} /> : null}
    </View>
  );
}

export interface LoadingSkeletonProps {
  /** Number of placeholder rows. */
  rows?: number;
  /** `row` = list entry (avatar + two lines); `card` = taller block. */
  variant?: 'row' | 'card';
}

/**
 * Static (non-animated) skeletons. Deliberately not pulsing: a shimmer is
 * decoration, and keeping these still respects reduced-motion preferences
 * without needing a runtime check.
 */
export function LoadingSkeleton({ rows = 6, variant = 'row' }: LoadingSkeletonProps) {
  const theme = useTheme();

  return (
    <View accessibilityLabel="Loading" accessibilityRole="progressbar" style={styles.skeleton}>
      {Array.from({ length: rows }, (_, index) => (
        <View key={index} style={styles.skeletonRow}>
          {variant === 'row' ? (
            <View style={[styles.circle, { backgroundColor: theme.skeleton }]} />
          ) : null}
          <View style={styles.skeletonLines}>
            <View style={[styles.line, styles.lineWide, { backgroundColor: theme.skeleton }]} />
            <View style={[styles.line, styles.lineNarrow, { backgroundColor: theme.skeleton }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.four,
  },
  centered: { textAlign: 'center' },
  skeleton: { gap: Spacing.three, paddingVertical: Spacing.three },
  skeletonRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  skeletonLines: { flex: 1, gap: Spacing.two },
  circle: { width: 48, height: 48, borderRadius: Radius.pill },
  line: { height: 12, borderRadius: Radius.small },
  lineWide: { width: '70%' },
  lineNarrow: { width: '40%' },
});
