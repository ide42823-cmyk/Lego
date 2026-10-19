import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import type { ProfileInfoIcon, ProfileInfoRow as ProfileInfoRowData } from '@/core/data/types';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from '../themed-text';
import { Icon, type IconName } from '../ui/icon';
import { IconButton } from '../ui/icon-button';

/**
 * Data meaning → glyph. The data layer never names an icon, so this is the one
 * place the two vocabularies meet.
 */
const ICONS: Record<ProfileInfoIcon, IconName> = {
  mutual: 'friends',
  id: 'account',
  height: 'height',
  weight: 'weight',
  occupation: 'occupation',
  nationality: 'globe',
  address: 'address',
  birthday: 'birthday',
  constellation: 'star',
  registered: 'calendar',
};

export interface ProfileInfoRowProps {
  row: ProfileInfoRowData;
  /** Omit to render the row without its copy affordance. */
  onCopy?: (row: ProfileInfoRowData) => void;
}

/**
 * One line of profile information (reference screen 026).
 *
 * The copy control is a sibling of the text rather than a wrapper around the row,
 * so the row itself is not a button and the copy target stays a real 44pt control.
 */
export function ProfileInfoRow({ row, onCopy }: ProfileInfoRowProps) {
  const theme = useTheme();
  const copyable = Boolean(row.copyable && row.copyValue && onCopy);

  return (
    <View style={styles.row}>
      <Icon name={ICONS[row.icon]} size={22} strokeWidth={1.9} color={theme.text} />
      <ThemedText type="default" numberOfLines={2} style={styles.text}>
        {row.text}
      </ThemedText>
      {copyable ? (
        <IconButton
          name="copy"
          label={`Copy ${row.text}`}
          tone="muted"
          size={18}
          onPress={() => onCopy?.(row)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    minHeight: 44,
    paddingVertical: Spacing.two,
  },
  text: { flex: 1, lineHeight: 22 },
});
