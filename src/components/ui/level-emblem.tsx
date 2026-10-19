import { StyleSheet, View, type ViewProps } from 'react-native';

import { useTints } from '@/hooks/use-tints';

import { ThemedText } from '../themed-text';

export interface LevelEmblemProps extends ViewProps {
  level: number;
  size?: number;
}

/**
 * The small crest carrying a member's level.
 *
 * It is a shape of our own rather than a reproduction of the reference crest:
 * the reference emblem is decorative trade dress, while the *information* — a
 * level number beside a name — is what the layout needs.
 */
export function LevelEmblem({ level, size = 20, style, ...rest }: LevelEmblemProps) {
  const tints = useTints();
  // Two digits need a slightly tighter glyph to stay inside the crest.
  const fontSize = String(level).length > 2 ? size * 0.42 : size * 0.5;

  return (
    <View
      accessible
      accessibilityLabel={`Level ${level}`}
      style={[
        styles.emblem,
        {
          width: size,
          height: size,
          borderRadius: size * 0.34,
          backgroundColor: tints.level.from,
          borderColor: tints.level.to,
        },
        style,
      ]}
      {...rest}
    >
      <ThemedText
        style={[styles.label, { fontSize, lineHeight: size, color: tints.level.text }]}
        accessible={false}
      >
        {level}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  emblem: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  label: { fontWeight: '800', textAlign: 'center' },
});
