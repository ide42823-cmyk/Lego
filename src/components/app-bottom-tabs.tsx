import type { SFSymbol } from 'expo-symbols';
import {
  TabList,
  TabSlot,
  TabTrigger,
  Tabs,
  type TabListProps,
  type TabTriggerSlotProps,
} from 'expo-router/ui';
import { Pressable, StyleSheet, View, type PressableProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radius, Spacing, TouchTarget } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from './themed-text';
import { CountBadge } from './ui/badge';
import { Icon } from './ui/icon';

/**
 * The app's bottom navigation.
 *
 * Uses the headless `expo-router/ui` tabs so one implementation serves iOS,
 * Android and web. The reference design has a very specific bar, so the
 * platform's native tab bar is not used — but navigation semantics (state
 * preservation, deep links, back behaviour) still come from the router.
 *
 * Tab badges are passed in by the layout rather than read here, so this
 * component stays free of data concerns.
 */
export interface AppBottomTabsProps {
  /** Unread conversation total; renders as a capped counter. */
  messageBadge?: number;
  /** Actionable notifications for the account tab. */
  meBadge?: number;
}

interface TabItemProps extends TabTriggerSlotProps {
  label: string;
  symbol: SFSymbol;
  glyph: string;
  badge?: number;
}

function TabBarItem({ label, symbol, glyph, badge, isFocused, ...props }: TabItemProps) {
  const theme = useTheme();

  return (
    <Pressable
      // `TabTriggerSlotProps` carries a `ref` typed as `Ref<View>`, which drifts
      // from Pressable's element type in RN 0.88. Re-typing the spread keeps the
      // intent explicit instead of widening the whole component.
      {...(props as PressableProps)}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: isFocused }}
      style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
    >
      <View>
        <Icon
          symbol={symbol}
          glyph={glyph}
          size={22}
          color={isFocused ? theme.brand : theme.textSecondary}
        />
        {badge && badge > 0 ? (
          <View style={styles.badgeSlot}>
            <CountBadge count={badge} accessibilityLabel={`${badge} unread`} />
          </View>
        ) : null}
      </View>
      <ThemedText
        type="small"
        style={[
          styles.label,
          {
            color: isFocused ? theme.brand : theme.textSecondary,
            fontWeight: isFocused ? '700' : '500',
          },
        ]}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}

function TabBar(props: TabListProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      {...props}
      style={[
        styles.bar,
        {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          // Keep the bar clear of the gesture/nav area on devices with insets.
          paddingBottom: Math.max(insets.bottom, Spacing.two),
        },
      ]}
    />
  );
}

export default function AppBottomTabs({ messageBadge = 0, meBadge = 0 }: AppBottomTabsProps) {
  return (
    <Tabs style={styles.root}>
      <TabSlot />
      <TabList asChild>
        <TabBar>
          <TabTrigger name="index" href="/" asChild>
            <TabBarItem label="Home" symbol="house.fill" glyph="🏠" />
          </TabTrigger>
          <TabTrigger name="moments" href="/moments" asChild>
            <TabBarItem label="Moments" symbol="sparkles" glyph="✨" />
          </TabTrigger>
          <TabTrigger name="rooms" href="/rooms" asChild>
            <TabBarItem label="Rooms" symbol="mic.fill" glyph="🎙" />
          </TabTrigger>
          <TabTrigger name="messages" href="/messages" asChild>
            <TabBarItem
              label="Messages"
              symbol="bubble.left.and.bubble.right.fill"
              glyph="💬"
              badge={messageBadge}
            />
          </TabTrigger>
          <TabTrigger name="me" href="/me" asChild>
            <TabBarItem label="Me" symbol="person.crop.circle.fill" glyph="👤" badge={meBadge} />
          </TabTrigger>
        </TabBar>
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: Spacing.one + 2,
    paddingHorizontal: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  item: {
    flex: 1,
    minHeight: TouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.half,
    borderRadius: Radius.medium,
    paddingVertical: Spacing.one,
  },
  itemPressed: { opacity: 0.6 },
  label: { fontSize: 11, lineHeight: 14 },
  badgeSlot: { position: 'absolute', top: -6, end: -10 },
});
