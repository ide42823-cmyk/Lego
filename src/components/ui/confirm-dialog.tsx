import { Modal, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from '../themed-text';
import { AppButton } from './app-button';

/**
 * Blocking confirmation for irreversible or security-relevant actions
 * (leaving a live room, blocking, spending currency).
 *
 * The reference analysis requires that payment, privacy and destructive actions
 * are never triggered by an unstructured overlay, so this is an explicit,
 * labelled dialog with an obvious cancel path.
 */
export interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** Styles the confirm action as destructive. */
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();

  return (
    <Modal
      visible={visible}
      transparent
      animationType={reducedMotion ? 'none' : 'fade'}
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <View style={[styles.root, { backgroundColor: theme.overlay }]}>
        <View
          accessibilityViewIsModal
          style={[styles.dialog, { backgroundColor: theme.surface, borderColor: theme.border }]}
        >
          <ThemedText type="smallBold">{title}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {message}
          </ThemedText>
          <View style={styles.actions}>
            <AppButton label={cancelLabel} variant="secondary" onPress={onCancel} />
            <AppButton
              label={confirmLabel}
              variant={destructive ? 'accent' : 'primary'}
              onPress={onConfirm}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.four },
  dialog: {
    width: '100%',
    maxWidth: 420,
    gap: Spacing.two,
    padding: Spacing.four,
    borderRadius: Radius.large,
    borderWidth: StyleSheet.hairlineWidth,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
});
