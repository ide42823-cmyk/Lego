import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radius, Spacing, TouchTarget } from '@/constants/theme';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from '../themed-text';
import { Divider } from './divider';

export interface ActionMenuItem {
  key: string;
  label: string;
  /** Renders the action in the danger colour. */
  destructive?: boolean;
  disabled?: boolean;
}

/**
 * Context action list (conversation long-press, member actions, message
 * overflow). Deliberately a list rather than a free-form popover so every
 * action has a full-width, labelled target.
 */
export interface ActionMenuProps {
  visible: boolean;
  title?: string;
  items: readonly ActionMenuItem[];
  onSelect: (key: string) => void;
  onClose: () => void;
}

export function ActionMenu({ visible, title, items, onSelect, onClose }: ActionMenuProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();

  return (
    <Modal
      visible={visible}
      transparent
      animationType={reducedMotion ? 'none' : 'slide'}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close menu"
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
              paddingBottom: insets.bottom + Spacing.two,
            },
          ]}
        >
          {title ? (
            <ThemedText
              type="small"
              themeColor="textSecondary"
              style={styles.title}
              numberOfLines={1}
            >
              {title}
            </ThemedText>
          ) : null}
          <Divider />
          {items.map((item) => (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              accessibilityState={{ disabled: Boolean(item.disabled) }}
              disabled={item.disabled}
              onPress={() => onSelect(item.key)}
              style={({ pressed }) => [
                styles.item,
                { opacity: item.disabled ? 0.4 : pressed ? 0.6 : 1 },
              ]}
            >
              <ThemedText
                type="default"
                style={{ color: item.destructive ? theme.danger : theme.text }}
              >
                {item.label}
              </ThemedText>
            </Pressable>
          ))}
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
  },
  title: { paddingHorizontal: Spacing.three, paddingBottom: Spacing.two },
  item: {
    minHeight: TouchTarget,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
});
