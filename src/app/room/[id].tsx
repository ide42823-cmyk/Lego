import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RoomAudienceStrip } from '@/components/room/room-audience-strip';
import { RoomBannerRow } from '@/components/room/room-banner-row';
import { RoomChatOverlay } from '@/components/room/room-chat-overlay';
import { RoomChatSheet } from '@/components/room/room-chat-sheet';
import { GiftPanel } from '@/components/room/gift-panel';
import { RoomComposer } from '@/components/room/room-composer';
import { RoomDetailsSheet } from '@/components/room/room-details-sheet';
import { RoomEventCard } from '@/components/room/room-event-card';
import { RoomExitOverlay } from '@/components/room/room-exit-overlay';
import { RoomHeaderBar } from '@/components/room/room-header-bar';
import { RoomSeatGrid } from '@/components/room/room-seat-grid';
import { RoomToolsDrawer } from '@/components/room/room-tools-drawer';
import { ErrorState, LoadingSkeleton } from '@/components/ui/states';
import { useToast } from '@/components/ui/toast';
import { DECORATIVE_IMAGE } from '@/components/ui/decorative-image';
import { RoomPalette, Spacing } from '@/constants/theme';
import { imageSource } from '@/core/media/images';
import { fixtureDataSource } from '@/core/data/repository';
import { useAsync } from '@/hooks/use-async';

/**
 * A live voice room — the room card's destination (route `/room/[id]`).
 *
 * The page mirrors the reference canvas: host header with the greeting heart
 * and power control, the event banner strip, ten numbered seats, the audience
 * strip, the chat overlay with its pinned welcome rules and event notices,
 * a floating event card and the composer.
 *
 * Everything the reference makes money or sound is deliberately a toast:
 * seats, gifting, draws, marching into events, even mic control — the voice,
 * seat and gift machinery is the backend phase, and a client fixture must not
 * imply otherwise. `Keep` on the exit overlay simply closes it so any future
 * state survives; `Exit` is the only real navigation.
 */
export default function RoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const [exitOpen, setExitOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [giftOpen, setGiftOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatHidden, setChatHidden] = useState(false);
  const [composerHeight, setComposerHeight] = useState(0);

  const state = useAsync(
    () => fixtureDataSource.getLiveRoom(String(id ?? '')),
    `live-room:${String(id ?? '')}`,
  );

  const catalogState = useAsync(() => fixtureDataSource.getGiftCatalog(), 'gift-catalog');
  const toolsState = useAsync(() => fixtureDataSource.getRoomTools(), 'room-tools');
  const inboxState = useAsync(() => fixtureDataSource.getRoomInbox(), 'room-inbox');

  const notYet = useCallback(
    (what: string) => toast.show(`${what} arrives with the backend phase.`),
    [toast],
  );

  const exitRoom = useCallback(() => {
    setExitOpen(false);
    if (router.canGoBack()) {
      router.back();
    } else {
      // A deep link can open the room with nothing beneath it.
      router.replace('/rooms');
    }
  }, [router]);

  const room = state.status === 'ready' ? state.data : undefined;

  const copyRoomId = useCallback(() => {
    if (!room) {
      return;
    }
    const raw = room.host.idLabel.replace(/^ID:\s*/, '');
    Clipboard.setStringAsync(raw)
      .then(() => toast.show('Room id copied.'))
      .catch(() => notYet('Copying the room id'));
  }, [room, toast, notYet]);

  if (state.status === 'loading') {
    return <LoadingSkeleton />;
  }

  if (state.status === 'error') {
    return <ErrorState title="Room unavailable" message="The room could not be opened." />;
  }

  if (!room) {
    return <ErrorState title="Room unavailable" message="This room is not open right now." />;
  }

  return (
    <View style={styles.canvas}>
      {/* Full-bleed room art behind translucent chrome, pinned decorative. */}
      <View style={[styles.artLayer, { backgroundColor: RoomPalette.surfaceStrong }]}>
        {room.coverUrl ? (
          <Image {...DECORATIVE_IMAGE} source={imageSource(room.coverUrl)} style={styles.art} contentFit="cover" />
        ) : null}
        <View style={styles.scrim} />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + Spacing.two, paddingBottom: insets.bottom + Spacing.two },
          ]}
          refreshControl={<RefreshControl refreshing={false} onRefresh={() => notYet('Reloading the room')} tintColor="#FFFFFF" />}
          alwaysBounceVertical={false}
        >
          <RoomHeaderBar
            host={room.host}
            floatAvatars={room.floatAvatars}
            onDetails={() => setDetailsOpen(true)}
            onExit={() => setExitOpen(true)}
          />
          <RoomBannerRow
            rankLabel={room.rankLabel}
            progressLabel={room.ticker.progressLabel}
            countdownLabel={room.ticker.countdownLabel}
            freeDraw={room.freeDraw}
            coverUrl={room.coverUrl}
            onPressTicker={() => notYet('Draw board')}
            onPressRank={() => notYet('The ranking')}
            onPressFreeDraw={() => notYet('Free draw')}
          />
          <RoomSeatGrid seats={room.seats} onPressSeat={(seat) => notYet(`Seat ${seat}`)} />
          <RoomAudienceStrip
            audience={room.audience}
            audienceCount={room.audienceCount}
            onPressAudience={() => notYet('The member list')}
          />
          <View style={styles.lower}>
            <View style={styles.overlayColumn}>
              {chatHidden ? null : (
                <RoomChatOverlay
                  welcomeText={room.welcomeText}
                  introduction={room.introduction}
                  eventNotices={room.eventNotices}
                  onPressEvent={() => notYet('The event')}
                />
              )}
            </View>
            <RoomEventCard
              title={room.eventCard.title}
              countdownLabel={room.eventCard.countdownLabel}
              artUrl={room.eventCard.artUrl}
              onPress={() => notYet('The event')}
            />
          </View>
        </ScrollView>
        <View style={styles.composerDock} onLayout={(event) => setComposerHeight(event.nativeEvent.layout.height)}>
          <RoomComposer
            onSend={() => notYet('Sending to the room')}
            onChatList={() => setChatOpen(true)}
            onApps={() => setToolsOpen(true)}
            onGift={() => setGiftOpen(true)}
            unreadCount={99}
          />
        </View>
      </KeyboardAvoidingView>
      {chatOpen && inboxState.status === 'ready' ? (
        <RoomChatSheet
          visible
          inbox={inboxState.data}
          onClose={() => setChatOpen(false)}
          onOpenConversation={(conversationId) => {
            setChatOpen(false);
            router.push(`/thread/${conversationId}`);
          }}
          onOpenMoments={() => {
            setChatOpen(false);
            router.push('/moments');
          }}
          onSystemEntry={(entry) => notYet(entry.title)}
        />
      ) : null}
      {toolsOpen && toolsState.status === 'ready' ? (
        <RoomToolsDrawer
          visible
          sections={toolsState.data}
          composerHeight={composerHeight}
          onClose={() => setToolsOpen(false)}
          onBackendTool={(tool) => notYet(tool.label)}
          onClearScreen={() => setChatHidden((hidden) => !hidden)}
        />
      ) : null}
      <RoomExitOverlay visible={exitOpen} onKeep={() => setExitOpen(false)} onExit={exitRoom} />
      {catalogState.status === 'ready' ? (
        <GiftPanel
          visible={giftOpen}
          onClose={() => setGiftOpen(false)}
          catalog={catalogState.data}
          audienceCount={room.audienceCount}
          onOffer={() => notYet('The offer board')}
          onAristocracy={() => notYet('Aristocracy')}
          onUpgrade={() => notYet('The room upgrade')}
          onBanner={() => notYet('That promotion')}
          />
      ) : null}
      <RoomDetailsSheet
        visible={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        host={room.host}
        details={room.details}
        joined
        onCopyId={copyRoomId}
        onShare={() => notYet('Sharing')}
        onFavorite={() => notYet('Following the room')}
        onJoin={() => notYet('Joining another room')}
        onMembers={() => notYet('The member list')}
        onAchievements={() => notYet('The achievements')}
        onInfo={() => notYet('The room info')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    backgroundColor: RoomPalette.canvas,
  },
  flex: {
    flex: 1,
  },
  artLayer: {
    ...StyleSheet.absoluteFill,
  },
  art: {
    flex: 1,
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(6, 6, 14, 0.42)',
  },
  content: {
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  lower: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
  },
  overlayColumn: {
    flex: 1,
  },
  composerDock: {
    paddingHorizontal: Spacing.three,
    backgroundColor: 'rgba(8, 8, 16, 0.82)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: RoomPalette.border,
  },
});
