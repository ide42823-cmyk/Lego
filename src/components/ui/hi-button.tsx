import { Pressable, StyleSheet, type PressableProps } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTints } from '@/hooks/use-tints';

import { ThemedText } from '../themed-text';
import { GradientFill } from './gradient-fill';
import { Icon } from './icon';

export interface HiButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  /** Who is being greeted. Used for the accessible name, never shown. */
  name: string;
}

/**
 * The greeting control.
 *
 * The reference turns "say hi" into the loudest affordance in a row — a glossy
 * pink pill with a heart — so it gets its own component rather than being a text
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
        { backgroundColor: tints.hi.background, borderColor: tints.hi.border },
        pressed && styles.pressed,
      ]}
      {...rest}
    >
      <GradientFill from={tints.hi.background} to={tints.hi.backgroundTo} radius={Radius.pill} />
      <Icon
        name="greeting"
        size={20}
        strokeWidth={1.8}
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
    gap: 6,
    paddingHorizontal: Spacing.two + 4,
    // The reference's greeting pill is the widest thing in the row after the
    // text column — bulk the pill rather than shrinking the heart into it.
    minWidth: 92,
    minHeight: 38,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
    borderWidth: 1,
    overflow: 'hidden',
  },
  pressed: { opacity: 0.82 },
  label: { fontSize: 16, lineHeight: 21, fontWeight: '800', fontStyle: 'italic' },
});
