import { StyleSheet, View, type ViewProps } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import type { Gender } from '@/core/data/types';
import { useTints } from '@/hooks/use-tints';

import { ThemedText } from '../themed-text';
import { Icon } from './icon';

export interface AgePillProps extends ViewProps {
  age: number;
  gender?: Gender;
}

/**
 * The age/gender pill shown beside a display name.
 *
 * Deliberately separate from `Badge`: age is a personal detail the member chose
 * to share, so it gets its own slot and its own accessible sentence rather than
 * being folded into the rank cluster.
 */
export function AgePill({ age, gender, style, ...rest }: AgePillProps) {
  const tints = useTints();
  const genderWord = gender === 'female' ? 'female' : gender === 'male' ? 'male' : undefined;

  return (
    <View
      accessible
      accessibilityLabel={[genderWord, `${age}`].filter(Boolean).join(', ')}
      style={[styles.pill, { backgroundColor: tints.age.background }, style]}
      {...rest}
    >
      {gender ? <Icon name={gender} size={11} strokeWidth={2.6} color={tints.age.text} /> : null}
      <ThemedText type="small" style={[styles.label, { color: tints.age.text }]}>
        {age}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: Radius.small,
    alignSelf: 'flex-start',
  },
  label: { fontSize: 11, lineHeight: 16, fontWeight: '700' },
});
