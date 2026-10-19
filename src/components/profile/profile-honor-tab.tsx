import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import type { HonorEntry, HonorWall } from '@/core/data/types';

import { HonorWallCard } from './profile-honor-wall';

export interface ProfileHonorTabProps {
  honor: readonly HonorWall[];
  onOpenCollection: (wall: HonorWall) => void;
  onOpenEntry: (entry: HonorEntry) => void;
}

/**
 * The Honour section: three collections, always all three (reference screen 025).
 */
export function ProfileHonorTab({ honor, onOpenCollection, onOpenEntry }: ProfileHonorTabProps) {
  return (
    <View style={styles.body}>
      {honor.map((wall) => (
        <HonorWallCard
          key={wall.key}
          wall={wall}
          onOpenCollection={onOpenCollection}
          onOpenEntry={onOpenEntry}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: Spacing.three, paddingBottom: Spacing.six },
});
