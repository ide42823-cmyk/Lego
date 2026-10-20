import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppCard } from '@/components/ui/app-card';
import { Avatar } from '@/components/ui/avatar';
import { CountBadge } from '@/components/ui/badge';
import { Icon, type IconName } from '@/components/ui/icon';
import { Radius, Spacing, type ChipTintKey } from '@/constants/theme';
import type { MeTool, MeToolKey } from '@/core/data/types';
import { useTheme } from '@/hooks/use-theme';
import { useTints } from '@/hooks/use-tints';

export interface MeToolsCardProps {
  tools: MeTool[];
  onPress: (tool: MeTool) => void;
}

/** Each shortcut keeps its meaning in the data and its look here. */
const TOOL_ICONS: Record<MeToolKey, IconName> = {
  diamonds: 'diamonds',
  visitors: 'visitors',
  tasks: 'tasks',
  family: 'family',
};

const TOOL_TONES: Record<MeToolKey, ChipTintKey> = {
  diamonds: 'video',
  visitors: 'friendship',
  tasks: 'families',
  family: 'chat',
};

const TILE = 56;

/**
 * General Tools: four shortcuts, each a tinted tile with its own glyph.
 *
 * Visitors is drawn as the newest visitor's photo rather than a glyph, which is
 * what makes the row read as "someone was here" instead of "a feature".
 */
export function MeToolsCard({ tools, onPress }: MeToolsCardProps) {
  const theme = useTheme();
  const tints = useTints();

  return (
    <AppCard style={styles.card}>
      <ThemedText style={styles.title}>General Tools</ThemedText>
      <View style={styles.row}>
        {tools.map((tool) => {
          const tone = tints.chip[TOOL_TONES[tool.key]];
          const badge = tool.badgeCount ? `${tool.label}, ${tool.badgeCount} new` : tool.label;

          return (
            <Pressable
              key={tool.key}
              accessibilityRole="button"
              accessibilityLabel={badge}
              onPress={() => onPress(tool)}
              style={({ pressed }) => [styles.tool, pressed && styles.pressed]}
            >
              <View style={styles.iconWrap}>
                {tool.avatarUrl ? (
                  <Avatar
                    id={tool.key}
                    name={tool.label}
                    uri={tool.avatarUrl}
                    size={TILE}
                    radius={Radius.large}
                  />
                ) : (
                  <View style={[styles.tile, { backgroundColor: tone.background }]}>
                    <Icon name={TOOL_ICONS[tool.key]} size={26} strokeWidth={2} color={tone.text} />
                  </View>
                )}
                {tool.badgeCount ? (
                  <View style={[styles.badge, { borderColor: theme.surface }]}>
                    <CountBadge
                      count={tool.badgeCount}
                      accessibilityLabel={`${tool.badgeCount} new`}
                    />
                  </View>
                ) : null}
              </View>
              <ThemedText type="small" numberOfLines={1} style={styles.label}>
                {tool.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.three, padding: Spacing.three },
  title: { fontSize: 17, lineHeight: 24, fontWeight: '800' },
  row: { flexDirection: 'row', gap: Spacing.two },
  tool: { flex: 1, alignItems: 'center', gap: Spacing.one + 2 },
  pressed: { opacity: 0.7 },
  iconWrap: { width: TILE, height: TILE },
  tile: {
    width: TILE,
    height: TILE,
    borderRadius: Radius.large,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    end: 2,
    borderRadius: Radius.pill,
    borderWidth: 2,
  },
  label: { fontSize: 11, lineHeight: 15, fontWeight: '600', textAlign: 'center' },
});
