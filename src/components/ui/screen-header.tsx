import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { IconButton } from './icon-button';
import { ThemedText } from '../themed-text';

export interface ScreenHeaderProps {
  title: string;
  /** Optional secondary line under the title. */
  subtitle?: string;
  /** Trailing controls, rendered in reading order. */
  actions?: ReactNode;
}

/**
 * The large title used at the top of a primary tab screen.
 */
export function ScreenHeader({ title, subtitle, actions }: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.titleGroup}>
        <ThemedText type="subtitle" numberOfLines={1}>
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {actions ? <View style={styles.actions}>{actions}</View> : null}
    </View>
  );
}

export interface BackHeaderProps {
  title: string;
  onBack: () => void;
  /** Trailing controls. */
  actions?: ReactNode;
  /** Accessible label for the back control; defaults to the platform wording. */
  backLabel?: string;
}

/**
 * Header for pushed/secondary screens: back control, centred-ish title, and
 * optional trailing actions.
 */
export function BackHeader({ title, onBack, actions, backLabel = 'Go back' }: BackHeaderProps) {
  const theme = useTheme();

  return (
    <View style={[styles.backContainer, { borderBottomColor: theme.border }]}>
      <IconButton symbol="chevron.backward" glyph="‹" label={backLabel} onPress={onBack} />
      <ThemedText type="smallBold" numberOfLines={1} style={styles.backTitle}>
        {title}
      </ThemedText>
      <View style={styles.actions}>{actions}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  titleGroup: { flex: 1, gap: Spacing.half },
  actions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  backContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backTitle: { flex: 1 },
});
