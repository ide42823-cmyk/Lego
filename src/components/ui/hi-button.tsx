import { Pressable, StyleSheet, type PressableProps } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTints } from '@/hooks/use-tints';

import { ThemedText } from '../themed-text';
import { Icon } from './icon';

export interface HiButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  /** Who is being greeted. Used for the accessible name, never shown. */
  name: string;
}

/**
 * The greeting control.
 *
 * The reference turns "say hi" into the loudest affordance in a row — a filled
 * pill with a heart — so it gets its own component rather than being a text
 * button that every screen styles slightly differently.
 */
export function HiButton({ name, ...rest }: HiButtonProps) {
  const tints = useTints();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Say hi to ${name}`}
      hitSlop={6}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: tints.hi.background, opacity: pressed ? 0.7 : 1 },
      ]}
      {...rest}
    >
      <Icon
        name="greeting"
        size={15}
        strokeWidth={2.2}
        color={tints.hi.icon}
        fill={tints.hi.icon}
      />
      <ThemedText type="smallBold" style={[styles.label, { color: tints.hi.text }]}>
        Hi
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
    minHeight: 36,
  },
  label: { fontSize: 14, fontWeight: '800' },
});
