import { Pressable, StyleSheet, View } from 'react-native';

import { RoomPalette, Spacing } from '@/constants/theme';
import type { AvatarFrameKey } from '@/core/data/types';

import { Avatar } from '../ui/avatar';
import { Icon } from '../ui/icon';
import { ThemedText } from '../themed-text';

const TINT = 'rgba(10, 10, 20, 0.42)';

export interface RoomAudienceStripProps {
  audience: { id: string; avatarUrl?: string; avatarFrame?: AvatarFrameKey }[];
  audienceCount: number;
  /** The member list is a backend surface — the strip reports the gate. */
  onPressAudience: () => void;
}

/**
 * The glass strip between the seats and the art: the faces in the room and
 * the total count. The reference's face row is slim and the count sits in an
 * icon-number pair on the right. Presses report out; the member list is a
 * backend surface.
 */
export function RoomAudienceStrip({ audience, audienceCount, onPressAudience }: RoomAudienceStripProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${audienceCount} members in the room`}
      accessibilityHint="States whether the member list is available yet"
      onPress={onPressAudience}
      style={({ pressed }) => [styles.strip, pressed && { opacity: 0.85 }]}
    >
      <View style={styles.faces}>
        {audience.slice(0, 4).map((member, position) => (
          <View key={member.id} style={position === 0 ? undefined : styles.overlap}>
            <Avatar
              id={member.id}
              name=""
              uri={member.avatarUrl}
              size={30}
              frame={member.avatarFrame}
            />
          </View>
        ))}
      </View>
      <View style={styles.flexible} />
      <Icon name="friends" size={16} color={RoomPalette.textMuted} />
      <ThemedText type="small" style={styles.count}>
        {audienceCount > 9999 ? '99+' : audienceCount}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  strip: {
    minHeight: 40,
    borderRadius: 20,
    backgroundColor: TINT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
    paddingHorizontal: Spacing.half,
    marginBottom: Spacing.four,
  },
  faces: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overlap: {
    marginLeft: -10,
  },
  flexible: {
    flex: 1,
  },
  count: {
    color: RoomPalette.text,
    fontWeight: 700,
    marginEnd: Spacing.half,
  },
});
