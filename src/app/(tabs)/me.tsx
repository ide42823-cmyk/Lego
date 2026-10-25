import { useRouter } from 'expo-router';
import { Share, StyleSheet, View } from 'react-native';

import { MeGamesCard } from '@/components/me/me-games-card';
import { MeHeader } from '@/components/me/me-header';
import { MeMenuCard } from '@/components/me/me-menu-card';
import { MeStats } from '@/components/me/me-stats';
import { MeToolsCard } from '@/components/me/me-tools-card';
import { MeWalletCard } from '@/components/me/me-wallet-card';
import { ThemedText } from '@/components/themed-text';
import { AppScreen } from '@/components/ui/app-screen';
import { Divider } from '@/components/ui/divider';
import { MenuRow } from '@/components/ui/menu-row';
import { ErrorState, LoadingSkeleton } from '@/components/ui/states';
import { useToast } from '@/components/ui/toast';
import { Spacing } from '@/constants/theme';
import { fixtureDataSource } from '@/core/data/repository';
import type { MeMenuEntry } from '@/core/data/types';
import { useAsync } from '@/hooks/use-async';

/**
 * Me — the account dashboard (reference screen 075).
 *
 * This is the signed-in user's own home, not a public profile. Balances and
 * membership status are display-only: the server owns entitlements and every
 * purchase path re-checks them. Nothing on this screen can be spent from here,
 * which is why the wallet and the two join tiles hand off instead of pretending
 * to succeed.
 */
export default function MeScreen() {
  const toast = useToast();
  const router = useRouter();

  const state = useAsync(() => fixtureDataSource.getMe(), 'me-dashboard');

  const notYet = (what: string) => toast.show(`${what} arrives with the backend phase.`);

  const onMenu = async (entry: MeMenuEntry) => {
    if (entry.key === 'share') {
      try {
        await Share.share({ message: 'Join me on Letgo.' });
      } catch {
        toast.show('Sharing is not available on this device.');
      }
      return;
    }

    notYet(entry.label);
  };

  return (
    <AppScreen scroll tint="me">
      {state.status === 'loading' ? (
        <LoadingSkeleton rows={5} />
      ) : state.status === 'error' ? (
        <ErrorState onRetry={state.reload} />
      ) : (
        <View style={styles.stack}>
          <MeHeader me={state.data} onPress={() => notYet('Editing your profile')} />
          <MeStats me={state.data} />
          <MeWalletCard
            me={state.data}
            onRecharge={() => notYet('Recharge')}
            onJoin={(tile) => {
              if (tile.key === 'vip') {
                router.push({ pathname: '/membership/[family]', params: { family: 'svip' } });
                return;
              }
              notYet(tile.active ? 'Membership management' : `${tile.label} membership`);
            }}
          />
          <MeToolsCard
            tools={state.data.tools}
            onPress={(tool) =>
              tool.key === 'diamonds' ? router.push('/wallet/diamonds') : notYet(tool.label)
            }
          />
          <MeGamesCard games={state.data.games} onPress={(game) => notYet(game.title)} />
          <MeMenuCard menu={state.data.menu} onPress={onMenu} />

          {__DEV__ ? (
            <View style={styles.dev}>
              <ThemedText type="smallBold" themeColor="textSecondary">
                Developer
              </ThemedText>
              <Divider />
              <MenuRow
                label="RTC spike"
                description="Development-only voice harness"
                name="live"
                onPress={() => router.push('/dev/rtc-spike')}
              />
            </View>
          ) : null}
        </View>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  stack: { gap: Spacing.three, paddingBottom: Spacing.three },
  dev: { gap: Spacing.one, paddingTop: Spacing.three },
});
