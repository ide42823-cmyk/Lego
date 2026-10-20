import { StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/ui/app-card';
import { MenuRow } from '@/components/ui/menu-row';
import type { IconName } from '@/components/ui/icon';
import { Spacing } from '@/constants/theme';
import type { MeMenuEntry, MeMenuKey } from '@/core/data/types';
import { useTheme } from '@/hooks/use-theme';

export interface MeMenuCardProps {
  menu: MeMenuEntry[];
  onPress: (entry: MeMenuEntry) => void;
}

const MENU_ICONS: Record<MeMenuKey, IconName> = {
  events: 'calendar',
  store: 'store',
  backpack: 'backpack',
  level: 'level',
  share: 'share',
  support: 'headset',
  settings: 'settings',
};

/**
 * The account menu.
 *
 * Rows carry no chevron: each one performs an action or opens a sheet in place
 * rather than pushing a screen the user then has to come back from.
 */
export function MeMenuCard({ menu, onPress }: MeMenuCardProps) {
  const theme = useTheme();

  return (
    <AppCard style={styles.card}>
      <View style={styles.rows}>
        {menu.map((entry) => (
          <MenuRow
            key={entry.key}
            label={entry.label}
            name={MENU_ICONS[entry.key]}
            iconColor={theme.text}
            value={entry.value}
            valueAttention={entry.attention}
            chevron={false}
            onPress={() => onPress(entry)}
          />
        ))}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { paddingVertical: Spacing.two, paddingHorizontal: Spacing.three },
  rows: { gap: 0 },
});
