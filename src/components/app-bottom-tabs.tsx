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

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useTints } from '@/hooks/use-tints';

import { ThemedText } from './themed-text';
import { CountBadge } from './ui/badge';
import { Icon, type IconName } from './ui/icon';

/**
 * The app's bottom navigation.
 *
 * Uses the headless `expo-router/ui` tabs so one implementation serves iOS,
 * Android and web. The reference design has a very specific bar, so the
 * platform's native tab bar is not used — but navigation semantics (state
 * preservation, deep links, back behaviour) still come from the router.
 *
 * Three glyphs are composed locally from Lucide primitives: the cloud home
 * (with the reference's heart), the broadcast room (a house outline with level
 * bars) and the chat bubble. They are generic line drawings of our own, not
 * copies of the reference's proprietary icons.
 *
 * Tab badges are passed in by the layout rather than read here, so this
 * component stays free of data concerns.
 */
export interface AppBottomTabsProps {
  /** Unread conversation total; renders as a capped counter. */
  messageBadge?: number;
  /** Actionable notifications for the account tab; renders as a dot. */
  meBadge?: number;
}

interface TabItemProps extends TabTriggerSlotProps {
  label: string;
  name: IconName;
  /** Wash behind the icon while this tab is active. */
  tint: string;
  badge?: number;
  dot?: boolean;
}

/** The Home, Rooms and Messages marks need a second shape around the Lucide glyph. */
function TabGlyph({ name, color, focused }: { name: IconName; color: string; focused: boolean }) {
  const weight = focused ? 2.4 : 2.1;
  const size = 26;

  if (name === 'home') {
    return (
      <View style={styles.glyph}>
        <Icon name="cloud" size={size} strokeWidth={weight} color={color} />
        <View pointerEvents="none" style={styles.homeHeart}>
          <Icon name="greeting" size={10} strokeWidth={2.2} color={color} />
        </View>
      </View>
    );
  }

  if (name === 'rooms') {
    return (
      <View style={styles.glyph}>
        <Icon name="house" size={size} strokeWidth={weight} color={color} />
        <View pointerEvents="none" style={styles.roomBars}>
          {[5, 7, 5].map((height, index) => (
            <View key={index} style={[styles.roomBar, { height, backgroundColor: color }]} />
          ))}
        </View>
      </View>
    );
  }

  if (name === 'messages') {
    return (
      <View style={styles.glyph}>
        <Icon name="comment" size={size} strokeWidth={weight} color={color} />
        <View pointerEvents="none" style={styles.messageSmileWrap}>
          <View style={[styles.messageSmile, { borderColor: color }]} />
        </View>
      </View>
    );
  }

  return <Icon name={name} size={size} strokeWidth={weight} color={color} />;
}

function TabBarItem({ label, name, tint, badge, dot, isFocused, ...props }: TabItemProps) {
  const theme = useTheme();
  // The reference keeps every mark and label near-black; the active tab is
  // signalled by the tint circle and the heavier label rather than by greying
  // out the other four destinations.
  const color = theme.text;

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
      <View style={[styles.iconSlot, isFocused && { backgroundColor: tint }]}>
        <TabGlyph name={name} color={color} focused={Boolean(isFocused)} />
        {badge && badge > 0 ? (
          <View style={styles.badgeSlot}>
            <CountBadge count={badge} accessibilityLabel={`${badge} unread`} />
          </View>
        ) : null}
        {dot ? <View style={[styles.dot, { backgroundColor: theme.danger }]} /> : null}
      </View>
      <ThemedText
        type="small"
        style={[styles.label, { color, fontWeight: isFocused ? '700' : '600' }]}
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
  const tints = useTints();

  return (
    <Tabs style={styles.root}>
      {/*
        `flex: 1` here (not just on `Tabs`) is what keeps the slot inside the
        window: expo-router's slot container ships with `flexShrink: 0`, so on
        web the screen would grow to its content's height and push the bar below
        the fold instead of scrolling inside it.
      */}
      <TabSlot style={styles.slot} />
      <TabList asChild>
        <TabBar>
          <TabTrigger name="index" href="/" asChild>
            <TabBarItem label="Home" name="home" tint={tints.tab.home} />
          </TabTrigger>
          <TabTrigger name="moments" href="/moments" asChild>
            <TabBarItem label="Moments" name="moments" tint={tints.tab.moments} />
          </TabTrigger>
          <TabTrigger name="rooms" href="/rooms" asChild>
            <TabBarItem label="Rooms" name="rooms" tint={tints.tab.rooms} />
          </TabTrigger>
          <TabTrigger name="messages" href="/messages" asChild>
            <TabBarItem
              label="Messages"
              name="messages"
              tint={tints.tab.messages}
              badge={messageBadge}
            />
          </TabTrigger>
          <TabTrigger name="me" href="/me" asChild>
            <TabBarItem label="Me" name="me" tint={tints.tab.me} dot={meBadge > 0} />
          </TabTrigger>
        </TabBar>
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  slot: { flex: 1 },
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: 6,
    paddingHorizontal: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  item: {
    flex: 1,
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    paddingVertical: Spacing.one,
  },
  itemPressed: { opacity: 0.6 },
  // The active tab sits in a soft circle of its own hue, as in the reference.
  iconSlot: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 1,
  },
  glyph: { width: 26, height: 26, alignItems: 'center', justifyContent: 'center' },
  homeHeart: {
    position: 'absolute',
    start: 0,
    end: 0,
    bottom: 4,
    alignItems: 'center',
  },
  roomBars: {
    position: 'absolute',
    start: 0,
    end: 0,
    bottom: 6,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 2.5,
  },
  roomBar: { width: 2, borderRadius: 1.5 },
  messageSmileWrap: {
    position: 'absolute',
    start: 0,
    end: 0,
    top: 9,
    alignItems: 'center',
  },
  messageSmile: {
    width: 9,
    height: 5,
    borderBottomWidth: 1.6,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  label: { fontSize: 12.5, lineHeight: 15 },
  badgeSlot: { position: 'absolute', top: -5, end: -5 },
  dot: { position: 'absolute', top: 2, end: 2, width: 9, height: 9, borderRadius: Radius.pill },
});
