import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LeaderboardPodium } from '@/components/ranking/leaderboard-podium';
import { LeaderboardRow } from '@/components/ranking/leaderboard-row';
import { RankingBackground } from '@/components/ranking/ranking-background';
import { CategoryTabs, PeriodTabs, RegionButton } from '@/components/ranking/ranking-controls';
import { RankingHeader } from '@/components/ranking/ranking-header';
import {
  LEADERBOARD_CATEGORY_META,
  leaderboardPeriodLabel,
} from '@/components/ranking/ranking-config';
import { RankingSelfBar } from '@/components/ranking/ranking-self-bar';
import {
  RankingEmpty,
  RankingError,
  RankingLoading,
  RankingUnavailable,
} from '@/components/ranking/ranking-states';
import { RegionSheet } from '@/components/ranking/region-sheet';
import { ThemedText } from '@/components/themed-text';
import { Icon } from '@/components/ui/icon';
import { useToast } from '@/components/ui/toast';
import { Radius, RankingPalette, Spacing } from '@/constants/theme';
import { fixtureDataSource } from '@/core/data/repository';
import type {
  Leaderboard,
  LeaderboardCategory,
  LeaderboardEntry,
  LeaderboardPeriod,
} from '@/core/data/types';
import { isLeaderboardCategory, isLeaderboardPeriod, splitPodium } from '@/core/leaderboard';
import { countryName } from '@/core/search';
import { useAsync } from '@/hooks/use-async';

/**
 * Ranking — the six boards and three periods from the reference.
 *
 * The screen is a read-only view over the data seam: it never sorts, scores,
 * infers a rank, or grants an entitlement. The data source owns the rows,
 * ranks, region filtering and unavailable copy. The route only chooses a
 * category/period/region, splits the first three onto the podium and keeps the
 * selected tabs in view.
 *
 * The stage is a deliberately dark surface in both colour schemes, as in the
 * reference. The region picker, toasts and app bars stay on the normal theme.
 */
function readCategory(value: string | string[] | undefined): LeaderboardCategory {
  const first = Array.isArray(value) ? value[0] : value;
  return isLeaderboardCategory(first) ? first : 'charm';
}

function readPeriod(value: string | string[] | undefined): LeaderboardPeriod {
  const first = Array.isArray(value) ? value[0] : value;
  return isLeaderboardPeriod(first) ? first : 'daily';
}

function readRegion(value: string | string[] | undefined): string | null {
  const first = Array.isArray(value) ? value[0] : value;
  return typeof first === 'string' && /^[A-Za-z]{2}$/.test(first) ? first.toUpperCase() : null;
}

/** The self bar's content height, before the bottom safe-area inset. */
const SELF_BAR_HEIGHT = 62;

export default function RankingScreen() {
  const params = useLocalSearchParams<{
    category?: string | string[];
    period?: string | string[];
    region?: string | string[];
  }>();
  const router = useRouter();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [category, setCategory] = useState<LeaderboardCategory>(() =>
    readCategory(params.category),
  );
  const [period, setPeriod] = useState<LeaderboardPeriod>(() => readPeriod(params.period));
  const [region, setRegion] = useState<string | null>(() => readRegion(params.region));
  const [regionsOpen, setRegionsOpen] = useState(false);

  const board = useAsync<Leaderboard>(
    () => fixtureDataSource.listLeaderboard(category, period, region),
    `leaderboard:${category}:${period}:${region ?? 'all'}`,
  );
  const me = useAsync(() => fixtureDataSource.getMe(), 'ranking:me');

  const readyBoard = board.status === 'ready' ? board.data : null;
  const regions = readyBoard?.regions ?? [];

  const listRef = useRef<FlatList<LeaderboardEntry>>(null);

  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [category, period, region]);

  const close = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }, [router]);

  const openEntry = useCallback(
    (entry: LeaderboardEntry) => {
      if (entry.kind === 'member') {
        router.push({ pathname: '/person/[id]', params: { id: entry.id } });
        return;
      }
      toast.show(`The room screen for “${entry.name}” arrives with the backend phase.`);
    },
    [router, toast],
  );

  const openRegions = useCallback(() => {
    if (regions.length > 0) {
      setRegionsOpen(true);
    }
  }, [regions.length]);

  const changeRegion = useCallback((next: string | null) => {
    setRegion(next);
    setRegionsOpen(false);
  }, []);

  const meta = LEADERBOARD_CATEGORY_META[category];
  const periodLabel = leaderboardPeriodLabel(period);
  const available = readyBoard && !readyBoard.unavailable ? readyBoard : null;
  const split = splitPodium(available?.entries ?? []);
  const regionLabel = region ? countryName(region) || region : null;
  const visibleRegion = region ? (width < 380 ? region : (regionLabel ?? region)) : 'All';
  const showPrevious = Boolean(available && available.entries.length > 0);
  const loading = board.status === 'loading';

  return (
    <View style={styles.root}>
      <RankingBackground />
      <StatusBar style="light" />

      <View style={{ paddingTop: insets.top }}>
        <RankingHeader
          onBack={close}
          onGift={() => toast.show('Gifting arrives with the backend phase.')}
        />

        <CategoryTabs value={category} onChange={setCategory} />

        <View style={styles.filterRow}>
          <PeriodTabs value={period} onChange={setPeriod} />
          <RegionButton
            label={visibleRegion}
            accessibilityLabel={`Filter by region, ${regionLabel ?? 'All regions'}`}
            regions={regions}
            visible={loading || regions.length > 0}
            disabled={loading}
            onPress={openRegions}
          />
        </View>
      </View>

      <View style={styles.content}>
        {loading ? (
          <RankingLoading categoryLabel={meta.label} />
        ) : board.status === 'error' ? (
          <RankingError onRetry={board.reload} />
        ) : readyBoard?.unavailable ? (
          <RankingUnavailable
            title={readyBoard.unavailable.title}
            message={readyBoard.unavailable.message}
            icon={meta.icon}
          />
        ) : available && available.entries.length === 0 ? (
          <RankingEmpty
            title={regionLabel ? `No standings in ${regionLabel}` : 'No standings yet'}
            message={
              regionLabel
                ? `No one from ${regionLabel} has ranked on the ${periodLabel.toLowerCase()} ${meta.label.toLowerCase()} board yet.`
                : `No one has ranked on the ${periodLabel.toLowerCase()} ${meta.label.toLowerCase()} board yet.`
            }
            actionLabel={regionLabel ? 'Show all regions' : undefined}
            onAction={regionLabel ? () => changeRegion(null) : undefined}
          />
        ) : available ? (
          <FlatList
            ref={listRef}
            style={styles.flex}
            data={split.rest}
            keyExtractor={(entry) => `${entry.kind}:${entry.id}`}
            accessibilityLabel={`${meta.label} ranking, ${periodLabel}${
              regionLabel ? `, ${regionLabel}` : ''
            }`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: Spacing.five + (showPrevious ? 56 : 0) },
            ]}
            ListHeaderComponent={
              <LeaderboardPodium entries={split.podium} category={category} onOpen={openEntry} />
            }
            renderItem={({ item }) => (
              <LeaderboardRow entry={item} category={category} onOpen={openEntry} />
            )}
          />
        ) : null}
      </View>

      <RankingSelfBar me={me.status === 'ready' ? me.data : null} />

      {showPrevious ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous rankings"
          accessibilityHint="Previous rankings arrive with the backend phase"
          onPress={() => toast.show('Previous rankings arrive with the backend phase.')}
          style={({ pressed }) => [
            styles.previous,
            { bottom: SELF_BAR_HEIGHT + insets.bottom + 12 },
            pressed && styles.previousPressed,
          ]}
        >
          <Icon name="history" size={15} strokeWidth={2.2} color={RankingPalette.text} />
          <ThemedText style={styles.previousLabel}>Previous</ThemedText>
        </Pressable>
      ) : null}

      <RegionSheet
        visible={regionsOpen}
        regions={regions}
        value={region}
        onClose={() => setRegionsOpen(false)}
        onChange={changeRegion}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: RankingPalette.dark.bottom,
  },
  content: { flex: 1 },
  flex: { flex: 1 },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingTop: 2,
    paddingBottom: Spacing.two,
  },
  listContent: {
    paddingTop: Spacing.one,
  },
  previous: {
    position: 'absolute',
    end: Spacing.three,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: RankingPalette.brandBright,
    backgroundColor: 'rgba(103, 63, 190, 0.94)',
  },
  previousPressed: { opacity: 0.75 },
  previousLabel: {
    color: RankingPalette.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
});
