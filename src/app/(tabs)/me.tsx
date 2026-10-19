import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppScreen } from '@/components/ui/app-screen';
import { AppButton } from '@/components/ui/app-button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Divider } from '@/components/ui/divider';
import { MenuRow } from '@/components/ui/menu-row';
import { ScreenHeader } from '@/components/ui/screen-header';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui/states';
import { useToast } from '@/components/ui/toast';
import { PremiumPalette, Radius, Spacing } from '@/constants/theme';
import { fixtureDataSource } from '@/core/data/repository';
import type { MembershipSummary } from '@/core/data/types';
import { formatCompactCount } from '@/core/format';
import { useAsync } from '@/hooks/use-async';
import { useTheme } from '@/hooks/use-theme';

/**
 * Me — the account dashboard (reference screen 075).
 *
 * This is the signed-in user's own home, not a public profile. Membership
 * status and balances are display-only here: the server owns entitlements and
 * every purchase path will re-check them.
 */
const TOOLS = [
  { key: 'event-center', label: 'Event Center', glyph: '🎉' },
  { key: 'store', label: 'Store', glyph: '🛍' },
  { key: 'backpack', label: 'Backpack', glyph: '🎒' },
  { key: 'level', label: 'My Level', glyph: '⭐' },
  { key: 'tasks', label: 'Tasks', glyph: '✅' },
] as const;

const GAMES = [
  { key: 'lucky-spin', label: 'Lucky Spin', glyph: '🎡' },
  { key: 'quiz', label: 'Quiz Night', glyph: '🧩' },
  { key: 'ludo', label: 'Board Night', glyph: '🎲' },
  { key: 'karaoke', label: 'Karaoke', glyph: '🎤' },
] as const;

const SECONDARY = [
  { key: 'share', label: 'Share the app', glyph: '🔗' },
  { key: 'support', label: 'Help & support', glyph: '💬' },
  { key: 'settings', label: 'Settings', glyph: '⚙️' },
] as const;

const TIER_COLORS: Record<MembershipSummary['id'], string> = {
  vip: PremiumPalette.vip,
  svip: PremiumPalette.svip,
  aristocracy: PremiumPalette.aristocracy,
};

export default function MeScreen() {
  const theme = useTheme();
  const toast = useToast();
  const router = useRouter();

  const state = useAsync(() => fixtureDataSource.getMe(), 'me-dashboard');

  const notYet = (what: string) => toast.show(`${what} arrives in a later phase.`);

  return (
    <AppScreen scroll>
      <ScreenHeader
        title="Me"
        actions={
          <AppButton
            label="Edit"
            variant="secondary"
            onPress={() => notYet('Editing your profile')}
          />
        }
      />

      {state.status === 'loading' ? (
        <LoadingSkeleton rows={5} />
      ) : state.status === 'error' ? (
        <ErrorState onRetry={state.reload} />
      ) : (
        <>
          <View style={styles.identity}>
            <Avatar
              id={state.data.userId}
              name={state.data.displayName}
              size={72}
              uri={state.data.avatarUrl}
            />
            <View style={styles.identityCopy}>
              <ThemedText type="smallBold" numberOfLines={1}>
                {state.data.displayName}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                {state.data.handle}
              </ThemedText>
            </View>
          </View>

          <View style={styles.metrics}>
            {[
              { key: 'following', label: 'Following', value: state.data.followingCount },
              { key: 'fans', label: 'Fans', value: state.data.fansCount },
              { key: 'followers', label: 'Followers', value: state.data.followersCount },
            ].map((metric) => (
              <View
                key={metric.key}
                style={styles.metric}
                accessibilityRole="text"
                accessibilityLabel={`${metric.label}: ${metric.value}`}
              >
                <ThemedText type="smallBold">{formatCompactCount(metric.value)}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {metric.label}
                </ThemedText>
              </View>
            ))}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Recharge your balance"
            onPress={() => notYet('Recharge')}
            style={({ pressed }) => [
              styles.recharge,
              { backgroundColor: theme.brand, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <View style={styles.rechargeCopy}>
              <ThemedText type="smallBold" style={{ color: theme.onBrand }}>
                Recharge
              </ThemedText>
              <ThemedText type="small" style={[styles.rechargeHint, { color: theme.onBrand }]}>
                Top up to unlock gifts and premium rooms
              </ThemedText>
            </View>
            <ThemedText type="smallBold" style={{ color: theme.onBrand }} accessible={false}>
              ›
            </ThemedText>
          </Pressable>

          <View style={styles.section}>
            <ThemedText type="smallBold">Membership</ThemedText>
            {state.data.memberships.map((membership) => (
              <Pressable
                key={membership.id}
                accessibilityRole="button"
                accessibilityLabel={`${membership.label}. ${membership.status}. ${membership.detail}`}
                onPress={() => notYet(`${membership.label} membership`)}
                style={({ pressed }) => [
                  styles.tier,
                  {
                    backgroundColor: PremiumPalette.surface,
                    borderColor: TIER_COLORS[membership.id],
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <View style={styles.tierCopy}>
                  <ThemedText type="smallBold" style={styles.tierTitle}>
                    {membership.label}
                  </ThemedText>
                  <ThemedText type="small" style={styles.tierDetail}>
                    {membership.detail}
                  </ThemedText>
                </View>
                <Badge
                  tone={membership.status === 'active' ? 'verified' : 'neutral'}
                  label={membership.status === 'active' ? 'Active' : 'Available'}
                />
              </Pressable>
            ))}
          </View>

          <View style={styles.section}>
            <ThemedText type="smallBold">General tools</ThemedText>
            {TOOLS.map((tool) => (
              <MenuRow
                key={tool.key}
                label={tool.label}
                glyph={tool.glyph}
                onPress={() => notYet(tool.label)}
              />
            ))}
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
                  style={({ pressed }) => [
                    styles.gameTile,
                    { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.75 : 1 },
                  ]}
                >
                  <ThemedText type="subtitle" accessible={false}>
                    {game.glyph}
                  </ThemedText>
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
                glyph={item.glyph}
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
                glyph="🧪"
                onPress={() => router.push('/dev/rtc-spike')}
              />
            </View>
          ) : null}

          {state.data.memberships.length === 0 ? (
            <EmptyState title="No memberships" message="Membership options will appear here." />
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
  identityCopy: { flex: 1, gap: Spacing.half },
  metrics: { flexDirection: 'row', gap: Spacing.three, paddingVertical: Spacing.three },
  metric: { flex: 1, alignItems: 'center', gap: Spacing.half },
  recharge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.large,
  },
  rechargeCopy: { flex: 1, gap: Spacing.half },
  rechargeHint: { opacity: 0.85 },
  section: { gap: Spacing.one, paddingVertical: Spacing.three },
  tier: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.large,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  tierCopy: { flex: 1, gap: Spacing.half },
  tierTitle: { color: PremiumPalette.text },
  tierDetail: { color: PremiumPalette.textMuted },
  games: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, paddingTop: Spacing.two },
  gameTile: {
    width: '47%',
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.three,
    borderRadius: Radius.large,
  },
});
