import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewInstance,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChatComposer } from '@/components/chat/chat-composer';
import { ChatThread } from '@/components/chat/chat-thread';
import { ThreadHeader } from '@/components/chat/thread-header';
import { AppScreen } from '@/components/ui/app-screen';
import { IconButton } from '@/components/ui/icon-button';
import { ErrorState, LoadingSkeleton } from '@/components/ui/states';
import { useToast } from '@/components/ui/toast';
import { Spacing } from '@/constants/theme';
import { fixtureDataSource } from '@/core/data/repository';
import { useAsync } from '@/hooks/use-async';

/**
 * A conversation — the inbox row's destination (route `/thread/[id]`).
 *
 * The thread is history only. Text bubbles, calendar-day dividers and cluster
 * clocks come from the data seam; nothing here can claim delivery, a read
 * receipt or a sent message, because none of those states are client-owned.
 * The composer hands typed text to `onSend`, which states that sending is
 * backend work and keeps the draft so nothing the member wrote is lost.
 *
 * A strict two-party thread also keeps the screen free of viewer identity:
 * "mine" is simply `authorId !== peerId`.
 */
export default function ThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const list = useRef<ScrollViewInstance | null>(null);

  const state = useAsync(
    () => fixtureDataSource.listMessages(String(id ?? '')),
    `thread:${String(id ?? '')}`,
  );

  const goBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      // A deep link can open this screen with nothing beneath it.
      router.replace('/messages');
    }
  }, [router]);

  const notYet = useCallback(
    (what: string) => toast.show(`${what} arrives with the backend phase.`),
    [toast],
  );

  const send = useCallback(() => notYet('Sending'), [notYet]);

  /**
   * A thread opens on its latest history, the way an inbox row should; content
   * size settles asynchronously, so the anchor rides every size change but
   * without animation, never yanking the reader mid-scroll.
   */
  const anchorToLatest = useCallback(() => {
    list.current?.scrollToEnd({ animated: false });
  }, []);

  return (
    <AppScreen padded={false} style={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding' })} style={styles.screen}>
        {state.status !== 'ready' ? (
          <View style={styles.loadingBar}>
            <IconButton name="back" label="Go back" onPress={goBack} />
          </View>
        ) : (
          <ThreadHeader
            conversation={state.data.conversation}
            onBack={goBack}
            onCall={() => notYet('Voice calls')}
            onMore={() => notYet('Chat options')}
          />
        )}

        {state.status === 'loading' ? (
          <View style={styles.padded}>
            <LoadingSkeleton rows={6} />
          </View>
        ) : state.status === 'error' ? (
          <View style={styles.padded}>
            <ErrorState
              title="Conversation unavailable"
              message="We could not load this chat. It may have been removed, or the connection dropped."
              onRetry={state.reload}
            />
          </View>
        ) : state.status === 'ready' ? (
          <ScrollView
            ref={list}
            style={styles.scroll}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={anchorToLatest}
            accessibilityLabel={`Conversation with ${state.data.conversation.peerName}`}
          >
            <ChatThread conversation={state.data.conversation} messages={state.data.messages} />
          </ScrollView>
        ) : null}

        {state.status === 'ready' ? (
          <View style={{ paddingBottom: insets.bottom }}>
            <ChatComposer onSend={send} onPickEmoji={() => notYet('Emoji picks')} />
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  loadingBar: { paddingHorizontal: Spacing.two, paddingBottom: Spacing.two },
  padded: { paddingHorizontal: Spacing.three },
  scroll: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'flex-end' },
});
