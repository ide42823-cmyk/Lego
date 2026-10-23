import { StyleSheet, View } from 'react-native';

import { RoomPalette, Spacing } from '@/constants/theme';

import { Avatar } from '../ui/avatar';
import { IconButton } from '../ui/icon-button';
import { ThemedText } from '../themed-text';

export interface RoomHeaderBarProps {
  host: { id: string; displayName: string; idLabel: string; avatarUrl?: string };
  /** The tiny win-ticker portraits grouped right of centre — decorative. */
  floatAvatars: string[];
  /** Room details entry; the details sheet is a later task, so this reports. */
  onDetails: () => void;
  /** Opens the keep/exit overlay. */
  onExit: () => void;
}

/**
 * The room's top bar, matching the reference header: the host pill (avatar,
 * name, `ID:` tag, greeting heart) then a cluster of float-ticker portraits,
 * and on the right the details and power controls. The room is always dark,
 * so the bar works identically in both colour schemes.
 */
export function RoomHeaderBar({ host, floatAvatars, onDetails, onExit }: RoomHeaderBarProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.pillGroup}>
        <View style={styles.pill}>
          <Avatar id={host.id} name={host.displayName} uri={host.avatarUrl} size={38} radius={12} />
          <View style={styles.pillTexts}>
            <ThemedText type="smallBold" style={styles.name} numberOfLines={1}>
              {host.displayName}
            </ThemedText>
            <ThemedText type="small" style={styles.idLabel} numberOfLines={1}>
              {host.idLabel}
            </ThemedText>
          </View>
          <IconButton name="greeting" label="Send a greeting" onPress={onDetails} size={18} tone="accent" fill={RoomPalette.selection} />
        </View>
        <View style={styles.floats}>
          {floatAvatars.map((uri, position) => (
            <View key={position} style={styles.float}>
              <Avatar id={`${host.id}-float-${position}`} name="" uri={uri || undefined} size={22} />
            </View>
          ))}
        </View>
      </View>
      <View style={styles.flexible} />
      <IconButton name="calendar" label="Room schedule" onPress={onDetails} size={24} />
      <IconButton name="power" label="Leave the room" onPress={onExit} size={24} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  pillGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexShrink: 1,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(10, 10, 20, 0.45)',
    borderRadius: 19,
    paddingLeft: 6,
    paddingRight: 8,
    paddingVertical: 5,
  },
  pillTexts: {
    flexShrink: 1,
    gap: 1,
    maxWidth: 110,
  },
  name: {
    color: RoomPalette.text,
  },
  idLabel: {
    color: RoomPalette.textMuted,
    fontSize: 11,
    lineHeight: 14,
  },
  floats: {
    flexDirection: 'row',
  },
  float: {
    marginLeft: -8,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: 'rgba(10, 10, 20, 0.45)',
    borderStyle: 'solid',
    overflow: 'hidden',
  },
  flexible: {
    flex: 1,
  },
});
