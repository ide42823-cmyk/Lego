import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radius, Spacing } from '@/constants/theme';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from '../themed-text';
import { IconButton } from './icon-button';

/**
 * Bottom sheet used for contextual content (gift panels, member lists, room
 * details). Presentation only — it owns no state beyond visibility.
 */
export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Fraction of the screen height the sheet may occupy. */
  maxHeightRatio?: number;
}

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  maxHeightRatio = 0.75,
}: BottomSheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const { height } = useWindowDimensions();

  return (
    <Modal
      visible={visible}
      transparent
      // Honour the OS preference instead of always sliding.
      animationType={reducedMotion ? 'none' : 'slide'}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          style={[styles.scrim, { backgroundColor: theme.overlay }]}
          onPress={onClose}
        />
        <View
          accessibilityViewIsModal
          style={[
            styles.sheet,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              maxHeight: height * maxHeightRatio,
              paddingBottom: insets.bottom + Spacing.three,
            },
          ]}
        >
          <View style={[styles.grabber, { backgroundColor: theme.borderStrong }]} />
          {title ? (
            <View style={styles.header}>
              <ThemedText type="smallBold" numberOfLines={1} style={styles.title}>
                {title}
              </ThemedText>
              <IconButton name="close" label="Close" tone="muted" onPress={onClose} />
            </View>
          ) : null}
          <ScrollView keyboardShouldPersistTaps="handled">{children}</ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  scrim: { position: 'absolute', top: 0, start: 0, end: 0, bottom: 0 },
  sheet: {
    borderTopStartRadius: Radius.xlarge,
    borderTopEndRadius: Radius.xlarge,
    borderWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.two,
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  grabber: { alignSelf: 'center', width: 40, height: 4, borderRadius: Radius.pill },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  title: { flex: 1 },
});
