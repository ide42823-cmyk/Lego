import type { ReactNode } from 'react';
import { I18nManager, StyleSheet, View } from 'react-native';

import { Spacing, TouchTarget } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from '../themed-text';
import { IconButton } from './icon-button';

export interface BackHeaderProps {
  title: string;
  onBack: () => void;
  /** Trailing controls. */
  actions?: ReactNode;
  /** Accessible label for the back control; defaults to the platform wording. */
  backLabel?: string;
  /**
   * `center` keeps the title in the middle of the screen by reserving the same
   * width as the back control on the trailing side. Used by pushed screens that
   * should read as a destination rather than a drill-down.
   */
  titleAlign?: 'start' | 'center';
}

/**
 * Header for pushed/secondary screens: a back control, the screen name, and
 * optional trailing actions.
 *
 * Primary tabs deliberately do not use this — they carry a mode row and action
 * icons instead of a title (see the reference analysis), so there is no large
 * title component in the design system.
 */
export function BackHeader({
  title,
  onBack,
  actions,
  backLabel = 'Go back',
  titleAlign = 'start',
}: BackHeaderProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { borderBottomColor: theme.border }]}>
      <IconButton
        name={I18nManager.isRTL ? 'forward' : 'back'}
        label={backLabel}
        onPress={onBack}
      />
      <ThemedText
        type="smallBold"
        numberOfLines={1}
        style={[styles.title, titleAlign === 'center' && styles.titleCenter]}
      >
        {title}
      </ThemedText>
      <View style={[styles.actions, titleAlign === 'center' && !actions && styles.balance]}>
        {actions}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { flex: 1 },
  titleCenter: { textAlign: 'center' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  balance: { width: TouchTarget },
});
