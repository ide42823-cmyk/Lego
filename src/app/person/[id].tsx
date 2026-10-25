import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Share, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MomentCard } from '@/components/moment-card';
import { ProfileAboutTab } from '@/components/profile/profile-about-tab';
import { ProfileActionBar } from '@/components/profile/profile-action-bar';
import { COMPACT_BAR_HEIGHT, ProfileCompactBar } from '@/components/profile/profile-compact-bar';
import { ProfileCover } from '@/components/profile/profile-cover';
import { ProfileHonorTab } from '@/components/profile/profile-honor-tab';
import { ProfileIdentity } from '@/components/profile/profile-identity';
import { ProfileRelationshipsTab } from '@/components/profile/profile-relationships-tab';
import { RelationshipTypeSheet } from '@/components/relationship/relationship-type-sheet';
import { ActionMenu, type ActionMenuItem } from '@/components/ui/action-menu';
import { Divider } from '@/components/ui/divider';
import { IconButton } from '@/components/ui/icon-button';
import { SegmentedTabs, type SegmentedTabItem } from '@/components/ui/segmented-tabs';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui/states';
import { useToast } from '@/components/ui/toast';
import { Spacing } from '@/constants/theme';
import { fixtureDataSource } from '@/core/data/repository';
import type { ProfileInfoRow, RelationshipTypeKey, UserProfile } from '@/core/data/types';
import { useAsync } from '@/hooks/use-async';
import { useTheme } from '@/hooks/use-theme';

/**
 * Public member profile (reference screens 001, 018, 021–028).
 *
 * Structure: a full-bleed cover, the identity block, a sticky section strip and a
 * sticky contact bar. The cover scrolls away and a compact header fades in over
 * it, which is how the reference keeps navigation and sharing reachable without a
 * second navigation bar.
 *
 * The section strip is genuinely sticky (`stickyHeaderIndices`) because the
 * reference pins it under the compact header: in four separate captures of the
 * same profile the strip sits at the same offset, which it could only do if it
 * were pinned rather than merely scrolled into view.
 *
 * Nothing here decides entitlement or relationship state. Greeting and liking are
 * requests whose confirmed result the UI reconciles to.
 */

/**
 * The reference gives the cover roughly the top half of the screen (a ~4:5
 * portrait crop), which is what makes the profile read as a photo-first page.
 * The clamp keeps it sane on very tall and very short windows.
 */
function coverHeightFor(windowHeight: number): number {
  return Math.round(Math.min(Math.max(windowHeight * 0.54, 320), 520));
}

type ProfileTab = 'profile' | 'honor' | 'moments' | 'relationships';

const MENU_ITEMS: readonly ActionMenuItem[] = [
  { key: 'copy-id', label: 'Copy member ID' },
  { key: 'share', label: 'Share profile' },
  { key: 'report', label: 'Report' },
  { key: 'block', label: 'Block', destructive: true },
];

export default function ProfileScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const userId = Array.isArray(params.id) ? (params.id[0] ?? '') : (params.id ?? '');

  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const window = useWindowDimensions();
  const coverHeight = coverHeightFor(window.height);

  const [tab, setTab] = useState<ProfileTab>('profile');
  const [greeted, setGreeted] = useState(false);
  const [greeting, setGreeting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  /** The relationship chooser (references 016/017/020) and its selected kind. */
  const [relationshipOpen, setRelationshipOpen] = useState(false);
  const [relationshipType, setRelationshipType] = useState<RelationshipTypeKey>('friend');
  /** Optimistic like state, keyed by post. Reconciles to the confirmed counts. */
  const [likes, setLikes] = useState<Record<string, { likeCount: number; likedByMe: boolean }>>({});

  /** Scroll offset, on the UI thread so the header fade costs no JS frames. */
  const scrollY = useSharedValue(0);
  /** Mirrors `compact` on the UI thread, so `runOnJS` fires only on a crossing. */
  const compactFlag = useSharedValue(false);

  const state = useAsync(() => fixtureDataSource.getProfile(userId), `profile:${userId}`);
  /** The chooser's server-priced invitation cards, read up front. */
  const offersState = useAsync(
    () => fixtureDataSource.getRelationshipOffers(),
    'relationship-offers',
  );
  /** The chooser pairs the viewer with the visited member on its card. */
  const meState = useAsync(() => fixtureDataSource.getMe(), 'profile-viewer');

  const compactThreshold = Math.max(0, coverHeight - (insets.top + COMPACT_BAR_HEIGHT));

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      const y = event.contentOffset.y;
      scrollY.value = y;
      const past = y > compactThreshold;
      if (past !== compactFlag.value) {
        compactFlag.value = past;
        // Only ever on a crossing: `compact` gates hit testing and the
        // accessibility tree, neither of which needs a per-frame update.
        runOnJS(setCompact)(past);
      }
    },
  });

  const compactStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [compactThreshold, compactThreshold + 48],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const goBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      // A deep link can open this screen with nothing beneath it.
      router.replace('/');
    }
  }, [router]);

  const notYet = useCallback(
    (what: string) => {
      toast.show(`${what} arrives in a later pass.`);
    },
    [toast],
  );

  const share = useCallback(
    async (profile: UserProfile) => {
      try {
        await Share.share({ message: `${profile.displayName} on Letgo` });
      } catch {
        toast.show('Sharing is not available on this device.');
      }
    },
    [toast],
  );

  const copyRow = useCallback(
    async (row: ProfileInfoRow) => {
      if (!row.copyValue) {
        return;
      }
      try {
        await Clipboard.setStringAsync(row.copyValue);
        toast.show(`Copied ${row.copyValue}`);
      } catch {
        toast.show('Could not copy on this device.');
      }
    },
    [toast],
  );

  const greet = useCallback(async () => {
    setGreeting(true);
    try {
      const result = await fixtureDataSource.sendGreeting(userId);
      setGreeted(result.greeted);
      if (result.greeted) {
        toast.show('Greeting sent.');
      }
    } catch {
      toast.show('Could not send your greeting. Try again.');
    } finally {
      setGreeting(false);
    }
  }, [toast, userId]);

  const tabs = useMemo<SegmentedTabItem<ProfileTab>[]>(
    () => [
      { key: 'profile', label: 'Profile' },
      { key: 'honor', label: 'Honor' },
      { key: 'moments', label: `Moment ${state.data?.momentCount ?? 0}` },
      { key: 'relationships', label: 'Relationships' },
    ],
    [state.data?.momentCount],
  );

  // Nothing to render the shell around yet. The back control is still present so
  // a failure never becomes a dead end.
  if (state.status !== 'ready') {
    return (
      <View style={[styles.root, { backgroundColor: theme.background, paddingTop: insets.top }]}>
        <View style={styles.loadingHeader}>
          <IconButton name="back" label="Go back" onPress={goBack} />
        </View>
        <View style={styles.padded}>
          {state.status === 'loading' ? (
            <LoadingSkeleton rows={5} />
          ) : (
            <ErrorState
              title="Profile unavailable"
              message="We could not load this member. They may have left, or the connection dropped."
              onRetry={state.reload}
            />
          )}
        </View>
      </View>
    );
  }

  const profile = state.data;
  const posts = profile.moments.map((post) =>
    likes[post.id] ? { ...post, ...likes[post.id] } : post,
  );

  const toggleLike = async (momentId: string, liked: boolean) => {
    const post = profile.moments.find((item) => item.id === momentId);
    if (!post) {
      return;
    }
    const current = likes[momentId] ?? { likeCount: post.likeCount, likedByMe: post.likedByMe };
    if (current.likedByMe === liked) {
      return;
    }

    setLikes((previous) => ({
      ...previous,
      [momentId]: {
        likeCount: Math.max(0, current.likeCount + (liked ? 1 : -1)),
        likedByMe: liked,
      },
    }));

    try {
      const confirmed = await fixtureDataSource.setMomentLiked(momentId, liked);
      setLikes((previous) => ({ ...previous, [momentId]: confirmed }));
    } catch {
      setLikes((previous) => ({ ...previous, [momentId]: current }));
      toast.show('Could not update that like. Try again.');
    }
  };

  const handleMenuSelect = (key: string) => {
    setMenuOpen(false);
    const idRow = profile.info.find((row) => row.key === 'id');
    switch (key) {
      case 'copy-id':
        if (idRow) {
          void copyRow(idRow);
        }
        break;
      case 'share':
        void share(profile);
        break;
      case 'report':
        notYet('Reporting a member');
        break;
      case 'block':
        notYet('Blocking a member');
        break;
      default:
        break;
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        // 0 cover · 1 identity · 2 sticky section strip · 3 section body
        stickyHeaderIndices={[2]}
      >
        <ProfileCover
          profile={profile}
          height={coverHeight}
          topInset={insets.top}
          onBack={goBack}
          onShare={() => void share(profile)}
          onMore={() => setMenuOpen(true)}
          onOpenPhoto={() => notYet('The photo viewer')}
        />

        <ProfileIdentity profile={profile} />

        {/*
          The strip reserves the compact header's height so that, once pinned, it
          lands exactly below it — and is pulled back up by the same amount so the
          unpinned spacing still matches the reference.
        */}
        <View
          style={[
            styles.stickyStrip,
            { paddingTop: insets.top + COMPACT_BAR_HEIGHT, marginTop: -COMPACT_BAR_HEIGHT },
          ]}
        >
          <View style={[styles.tabBar, { backgroundColor: theme.background }]}>
            <SegmentedTabs
              items={tabs}
              value={tab}
              onChange={setTab}
              label="Profile sections"
              variant="bar"
            />
          </View>
        </View>

        <View>
          {tab === 'honor' ? (
            <ProfileHonorTab
              honor={profile.honor}
              onOpenCollection={(wall) => notYet(wall.title)}
              onOpenEntry={(entry) => notYet(entry.label)}
            />
          ) : tab === 'moments' ? (
            posts.length === 0 ? (
              <View style={styles.padded}>
                <EmptyState
                  title="No moments yet"
                  message="When this member posts, their moments appear here."
                />
              </View>
            ) : (
              // No horizontal padding here: the card owns it so the rule between
              // posts can run edge to edge, as in reference 024.
              <View>
                {posts.map((post) => (
                  <View key={post.id}>
                    <MomentCard
                      post={post}
                      onToggleLike={(momentId, liked) => void toggleLike(momentId, liked)}
                      onOpenAuthor={(authorId) =>
                        router.push({ pathname: '/person/[id]', params: { id: authorId } })
                      }
                    />
                    <Divider />
                  </View>
                ))}
              </View>
            )
          ) : tab === 'relationships' ? (
            <ProfileRelationshipsTab
              profile={profile}
              onOpenRecord={(record) =>
                notYet(`${record.kind === 'couple' ? 'Couple' : 'Friend'} details`)
              }
              onInvite={() =>
                offersState.status === 'ready' && meState.status === 'ready'
                  ? (setRelationshipType('friend'), setRelationshipOpen(true))
                  : notYet('Relationship invitations')
              }
            />
          ) : (
            <ProfileAboutTab
              profile={profile}
              onOpenShortcut={(shortcut) => notYet(shortcut.label)}
              onCopy={copyRow}
            />
          )}
        </View>
      </Animated.ScrollView>

      {/*
        Always mounted so the cross-fade is a real fade. It does not take touches
        while it is invisible, so the cover's own controls stay the live ones at the
        top of the page.
      */}
      <Animated.View
        pointerEvents={compact ? 'auto' : 'none'}
        accessibilityElementsHidden={!compact}
        importantForAccessibility={compact ? 'yes' : 'no-hide-descendants'}
        style={[
          styles.compactOverlay,
          { backgroundColor: theme.background, borderBottomColor: theme.border },
          compactStyle,
        ]}
      >
        <ProfileCompactBar
          profile={profile}
          topInset={insets.top}
          onBack={goBack}
          onShare={() => void share(profile)}
          onMore={() => setMenuOpen(true)}
        />
      </Animated.View>

      <ProfileActionBar
        name={profile.displayName}
        greeted={greeted}
        greeting={greeting}
        onCall={() => notYet('Voice calling')}
        onMessage={() => notYet('Direct messages')}
        onGreet={() => void greet()}
      />

      <ActionMenu
        visible={menuOpen}
        title={profile.displayName}
        items={MENU_ITEMS}
        onSelect={handleMenuSelect}
        onClose={() => setMenuOpen(false)}
      />

      {offersState.status === 'ready' && meState.status === 'ready' ? (
        <RelationshipTypeSheet
          visible={relationshipOpen}
          viewer={{ displayName: meState.data.displayName, avatarUrl: meState.data.avatarUrl }}
          person={{ displayName: profile.displayName, avatarUrl: profile.avatarUrl }}
          offers={offersState.data.offers}
          selected={relationshipType}
          onSelect={setRelationshipType}
          onInvite={(offer) => {
            setRelationshipOpen(false);
            notYet(
              `Inviting ${profile.displayName} as your ${offer.label.toLowerCase()}`,
            );
          }}
          onHelp={() => notYet('The relationship help centre')}
          onClose={() => setRelationshipOpen(false)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  padded: { paddingHorizontal: Spacing.three },
  loadingHeader: { flexDirection: 'row', alignItems: 'center' },
  stickyStrip: { zIndex: 2 },
  // No bottom rule: the reference separates the strip by spacing alone, and a
  // hairline here would draw a second, competing line above the section body.
  tabBar: {
    paddingHorizontal: Spacing.three,
  },
  compactOverlay: {
    position: 'absolute',
    top: 0,
    start: 0,
    end: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
