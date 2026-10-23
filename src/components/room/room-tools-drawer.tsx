import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { Radius, RoomPalette, Spacing } from '@/constants/theme';
import type { RoomTool, RoomToolSection } from '@/core/data/types';

import { ThemedText } from '../themed-text';
import { Icon, type IconName } from '../ui/icon';

/** Tool glyph meanings -> verified Lucide meanings. */
const TOOL_GLYPHS: Record<RoomTool['icon'], IconName> = {
  gift: 'gift',
  sparkle: 'sparkle',
  party: 'party',
  trophy: 'trophy',
  games: 'games',
  share: 'share',
  mute: 'mute',
  'music-list': 'music-list',
  beauty: 'sparkle',
  effects: 'effects',
  store: 'store',
  'flip-camera': 'camera',
  welcome: 'smile',
  'clear-screen': 'clear-screen',
};

export interface RoomToolsDrawerProps {
  visible: boolean;
  onClose: () => void;
  sections: RoomToolSection[];
  /**
   * Height of the composer dock below; the drawer anchors just above it so
   * the composer line stays visible, exactly like the reference drawer.
   */
  composerHeight: number;
  /** Every server-backed tool reports to the screen's backend gate. */
  onBackendTool: (tool: RoomTool) => void;
  /** Clear Screen is a client display toggle, handled by the screen. */
  onClearScreen: () => void;
}

/**
 * The reference's room tools drawer (screen 013): a tall translucent-black
 * drawer anchored above the composer with the games row, then the basic
 * tools. It overlays the room in place (no full-screen modal) so the composer
 * and the room above stay visible, and taps on the exposed room close it.
 */
export function RoomToolsDrawer({
  visible,
  onClose,
  sections,
  composerHeight,
  onBackendTool,
  onClearScreen,
}: RoomToolsDrawerProps) {
  const { height } = useWindowDimensions();

  if (!visible) {
    return null;
  }

  return (
    <View
      accessibilityViewIsModal
      style={[styles.overlay, { bottom: composerHeight, height: height * 0.58 }]}
    >
      {/* The exposed room above the drawer closes it. */}
      <Pressable accessibilityRole="button" accessibilityLabel="Close the tools" style={styles.flex} onPress={onClose} />
      <View style={styles.drawer}>
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {sections.map((section) => (
            <View key={section.id}>
              <ThemedText type="default" style={styles.sectionTitle}>
                {section.title}
              </ThemedText>
              <View style={[styles.toolsRow, section.narrow && styles.toolsRowNarrow]}>
                {section.tools.map((tool) => (
                  <Pressable
                    key={tool.id}
                    accessibilityRole="button"
                    accessibilityLabel={tool.label}
                    onPress={() => (tool.action === 'backend' ? onBackendTool(tool) : onClearScreen())}
                    style={({ pressed }) => [styles.tool, !section.narrow && styles.toolRoomy, pressed && { opacity: 0.8 }]}
                  >
                    <View style={styles.toolDisc}>
                      <Icon name={TOOL_GLYPHS[tool.icon]} size={24} color={RoomPalette.text} strokeWidth={2.1} />
                      {tool.dot ? <View style={styles.dot} /> : null}
                    </View>
                    <ThemedText type="small" style={styles.toolLabel} numberOfLines={2}>
                      {tool.label}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    start: 0,
    end: 0,
    justifyContent: 'flex-end',
  },
  flex: {
    flex: 1,
  },
  drawer: {
    backgroundColor: 'rgba(8, 8, 14, 0.96)',
    borderTopStartRadius: Radius.large,
    borderTopEndRadius: Radius.large,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
    maxHeight: '100%',
  },
  body: {
    gap: Spacing.four,
  },
  sectionTitle: {
    color: RoomPalette.text,
    fontWeight: 700,
    marginBottom: Spacing.two,
  },
  toolsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  toolsRowNarrow: {
    gap: 7,
  },
  tool: {
    width: 64,
    alignItems: 'center',
    gap: 6,
  },
  toolRoomy: {
    width: 76,
  },
  toolDisc: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(255, 255, 255, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 2,
    end: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF5064',
  },
  toolLabel: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'center',
  },
});
