import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppCard } from '@/components/ui/app-card';
import { AppScreen } from '@/components/ui/app-screen';
import { CategoryChip } from '@/components/ui/category-chip';
import { CountBadge } from '@/components/ui/badge';
import { Divider } from '@/components/ui/divider';
import { FramedAvatar } from '@/components/ui/framed-avatar';
import { Icon, type IconName } from '@/components/ui/icon';
import { MenuRow } from '@/components/ui/menu-row';
import { ErrorState, LoadingSkeleton } from '@/components/ui/states';
import { useToast } from '@/components/ui/toast';
import { Radius, Spacing, type ChipTintKey } from '@/constants/theme';
import { fixtureDataSource } from '@/core/data/repository';
import { formatCompactCount } from '@/core/format';
import { useAsync } from '@/hooks/use-async';
import { useTheme } from '@/hooks/use-theme';
import { useTints } from '@/hooks/use-tints';

/**
 * Me — the account dashboard (reference screen 075).
 *
 * This is the signed-in user's own home, not a public profile. Balances and
 * membership status are display-only: the server owns entitlements and every
 * purchase path re-checks them. Nothing on this screen can be spent from here.
 */
interface ToolEntry {
  key: string;
  label: string;
  name: IconName;
  tone: ChipTintKey;
  /** Unactioned count, rendered on the tile corner. */
  badge?: number;
}

const TOOLS: readonly ToolEntry[] = [
  { key: 'diamonds', label: 'Diamonds', name: 'diamonds', tone: 'chat' },
  { key: 'visitors', label: 'Visitors', name: 'visitors', tone: 'friendship', badge: 15 },
  { key: 'tasks', label: 'Tasks', name: 'tasks', tone: 'families' },
  { key: 'family', label: 'Family', name: 'rank', tone: 'video' },
];

const GAMES: readonly { key: string; label: string; name: IconName }[] = [
  { key: 'lucky-spin', label: 'Lucky Spin', name: 'sparkle' },
  { key: 'quiz-night', label: 'Quiz Night', name: 'tasks' },
  { key: 'board-night', label: 'Board Night', name: 'games' },
  { key: 'karaoke', label: 'Karaoke', name: 'mic' },
];

const SECONDARY: readonly { key: string; label: string; name: IconName }[] = [
  { key: 'share', label: 'Share the app', name: 'share' },
  { key: 'support', label: 'Help & support', name: 'comment' },
  { key: 'settings', label: 'Settings', name: 'settings' },
];

export default function MeScreen() {
  const theme = useTheme();
  const tints = useTints();
  const toast = useToast();
  const router = useRouter();

  const state = useAsync(() => fixtureDataSource.getMe(), 'me-dashboard');

  const notYet = (what: string) => toast.show(`${what} arrives in a later phase.`);

  return (
    <AppScreen scroll tint="me">
      {state.status === 'loading' ? (
        <LoadingSkeleton rows={5} />
      ) : state.status === 'error' ? (
        <ErrorState onRetry={state.reload} />
      ) : (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${state.data.displayName}. View or edit profile`}
            onPress={() => notYet('Editing your profile')}
            style={({ pressed }) => [styles.identity, pressed && { opacity: 0.7 }]}
          >
            <FramedAvatar
              id={state.data.userId}
              name={state.data.displayName}
              size={92}
              uri={state.data.avatarUrl}
              frame={state.data.avatarFrame}
            />
            <View style={styles.identityCopy}>
              <View style={styles.identityName}>
                <ThemedText type="default" numberOfLines={1} style={styles.name}>
                  {state.data.displayName}
                </ThemedText>
                {state.data.notificationCount > 0 ? (
                  <View style={[styles.dot, { backgroundColor: theme.danger }]} />
                ) : null}
              </View>
              <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                View or edit profile
              </ThemedText>
            </View>
            <Icon name="forward" size={20} color={theme.textSecondary} />
          </Pressable>

          <View style={styles.metrics}>
            {[
              { key: 'following', label: 'Following', value: state.data.followingCount },
              { key: 'friends', label: 'Friends', value: state.data.friendCount },
              { key: 'followers', label: 'Followers', value: state.data.followersCount },
            ].map((metric) => (
              <View
                key={metric.key}
                style={styles.metric}
                accessibilityRole="text"
                accessibilityLabel={`${metric.label}: ${metric.value}`}
              >
                <ThemedText type="smallBold" style={styles.metricValue}>
                  {formatCompactCount(metric.value)}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {metric.label}
                </ThemedText>
              </View>
            ))}
          </View>

          <AppCard padded={false}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Recharge. Balance ${state.data.coinBalance} coins`}
              onPress={() => notYet('Recharge')}
              style={({ pressed }) => [styles.recharge, pressed && { opacity: 0.85 }]}
            >
              <View style={styles.rechargeTop}>
                <ThemedText type="default" style={styles.rechargeTitle}>
                  Recharge
                </ThemedText>
                <CategoryChip tone="trending" label="Reward" />
              </View>

              <View style={styles.balance}>
                <Icon name="coin" size={22} strokeWidth={2.2} color={tints.level.to} />
                <ThemedText
                  type="default"
                  style={styles.balanceValue}
                  // The visible number is the server's; this label makes the
                  // ownership explicit for assistive tech.
                  accessibilityLabel={`Balance ${state.data.coinBalance} coins`}
                >
                  {formatCompactCount(state.data.coinBalance)}
                </ThemedText>
              </View>

              <View style={styles.tierRow}>
                {state.data.memberships.map((membership) => (
                  <View
                    key={membership.id}
                    style={[styles.tierTile, { backgroundColor: tints.tier[membership.id].from }]}
                  >
                    <Icon
                      name={membership.id === 'aristocracy' ? 'shield' : 'crown'}
                      size={18}
                      strokeWidth={2.2}
                      color={tints.tier[membership.id].text}
                    />
                    <ThemedText
                      type="small"
                      style={[styles.tierLabel, { color: tints.tier[membership.id].text }]}
                      numberOfLines={1}
                    >
                      {membership.label}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </Pressable>
          </AppCard>

          <View style={styles.section}>
            <ThemedText type="smallBold">General tools</ThemedText>
            <View style={styles.toolRow}>
              {TOOLS.map((tool) => {
                const colors = tints.chip[tool.tone];
                return (
                  <Pressable
                    key={tool.key}
                    accessibilityRole="button"
                    accessibilityLabel={
                      tool.badge ? `${tool.label}, ${tool.badge} new` : tool.label
                    }
                    onPress={() => notYet(tool.label)}
                    style={({ pressed }) => [styles.tool, pressed && { opacity: 0.7 }]}
                  >
                    <View style={[styles.toolIcon, { backgroundColor: colors.background }]}>
                      <Icon name={tool.name} size={22} strokeWidth={2.1} color={colors.text} />
                      {tool.badge ? (
                        <View style={styles.toolBadge}>
                          <CountBadge count={tool.badge} />
                        </View>
                      ) : null}
                    </View>
                    <ThemedText type="small" numberOfLines={1}>
                      {tool.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText type="smallBold">Games</ThemedText>
            <View style={styles.games}>
              {GAMES.map((game) => (
                <Pressable
                  key={game.key}
                  accessibilityRole="button"
                  accessibilityLabel={game.label}
                  onPress={() => notYet(game.label)}
                  style={({ pressed }) => [styles.game, pressed && { opacity: 0.75 }]}
                >
                  <View style={[styles.gameCover, { backgroundColor: tints.tab.rooms }]}>
                    <Icon name={game.name} size={28} strokeWidth={2} color={theme.brand} />
                  </View>
                  <ThemedText type="small" numberOfLines={1}>
                    {game.label}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText type="smallBold">More</ThemedText>
            {SECONDARY.map((item) => (
              <MenuRow
                key={item.key}
                label={item.label}
                name={item.name}
                onPress={() => notYet(item.label)}
              />
            ))}
          </View>

          {__DEV__ ? (
            <View style={styles.section}>
              <ThemedText type="smallBold">Developer</ThemedText>
              <Divider />
              <MenuRow
                label="RTC spike"
                description="Development-only voice harness"
                name="live"
                onPress={() => router.push('/dev/rtc-spike')}
              />
            </View>
          ) : null}
        </>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingTop: Spacing.three,
  },
  identityCopy: { flex: 1, gap: Spacing.one },
  identityName: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  name: { flexShrink: 1, fontSize: 20, lineHeight: 28, fontWeight: '800' },
  dot: { width: 10, height: 10, borderRadius: Radius.pill },

  metrics: { flexDirection: 'row', gap: Spacing.three, paddingVertical: Spacing.four },
  metric: { flex: 1, alignItems: 'center', gap: Spacing.half },
  metricValue: { fontSize: 16, fontWeight: '800' },

  recharge: { gap: Spacing.two, padding: Spacing.three },
  rechargeTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rechargeTitle: { fontSize: 18, lineHeight: 24, fontWeight: '800' },
  balance: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  balanceValue: { fontSize: 22, lineHeight: 28, fontWeight: '800' },
  tierRow: { flexDirection: 'row', gap: Spacing.two, paddingTop: Spacing.one },
  tierTile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.medium,
  },
  tierLabel: { fontWeight: '800' },

  section: { gap: Spacing.one, paddingVertical: Spacing.three },
  toolRow: { flexDirection: 'row', gap: Spacing.two, paddingTop: Spacing.two },
  tool: { flex: 1, alignItems: 'center', gap: Spacing.one },
  toolIcon: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolBadge: { position: 'absolute', top: -4, end: -2 },
  games: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three, paddingTop: Spacing.two },
  game: { width: '47%', gap: Spacing.one },
  gameCover: {
    width: '100%',
    aspectRatio: 16 / 10,
    borderRadius: Radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
