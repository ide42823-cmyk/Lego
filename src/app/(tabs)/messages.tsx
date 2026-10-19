import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { ConversationRow } from '@/components/conversation-row';
import { PeopleRow } from '@/components/people-row';
import { ThemedText } from '@/components/themed-text';
import { AppScreen } from '@/components/ui/app-screen';
import { AppButton } from '@/components/ui/app-button';
import { Divider } from '@/components/ui/divider';
import { FilterChips, type FilterChipItem } from '@/components/ui/filter-chips';
import { IconButton } from '@/components/ui/icon-button';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SegmentedTabs, type SegmentedTabItem } from '@/components/ui/segmented-tabs';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui/states';
import { useToast } from '@/components/ui/toast';
import { Radius, Spacing } from '@/constants/theme';
import { fixtureDataSource } from '@/core/data/repository';
import type {
  ContactsFilter,
  ConversationFilter,
  ConversationSummary,
  MessagesTab,
  UserSummary,
} from '@/core/data/types';
import { usePaginated } from '@/hooks/use-async';
import { useTheme } from '@/hooks/use-theme';

/**
 * Messages — inbox and contacts (reference screen 082).
 *
 * Two sub-sections share one header. Only the active section loads, so opening
 * the inbox does not also fetch the contact list.
 */
const SECTIONS: readonly SegmentedTabItem<MessagesTab>[] = [
  { key: 'messages', label: 'Messages' },
  { key: 'contacts', label: 'Contacts' },
];

const CONVERSATION_FILTERS: readonly FilterChipItem<ConversationFilter>[] = [
  { key: 'all', label: 'All' },
  { key: 'online', label: 'Online' },
  { key: 'most_chatted', label: 'Most Chatted' },
  { key: 'unread', label: 'Unread' },
];

const CONTACT_FILTERS: readonly FilterChipItem<ContactsFilter>[] = [
  { key: 'following', label: 'Following' },
  { key: 'friends', label: 'Friends' },
  { key: 'followers', label: 'Followers' },
];

const EMPTY_PAGE: { items: never[]; nextCursor: null } = { items: [], nextCursor: null };

export default function MessagesScreen() {
  const theme = useTheme();
  const toast = useToast();

  const [section, setSection] = useState<MessagesTab>('messages');
  const [conversationFilter, setConversationFilter] = useState<ConversationFilter>('all');
  const [contactsFilter, setContactsFilter] = useState<ContactsFilter>('following');
  const [promptDismissed, setPromptDismissed] = useState(false);

  const conversations = usePaginated<ConversationSummary>(
    (cursor) =>
      section === 'messages'
        ? fixtureDataSource.listConversations(conversationFilter, { cursor, limit: 12 })
        : Promise.resolve(EMPTY_PAGE),
    `conversations:${section}:${conversationFilter}`,
  );

  const contacts = usePaginated<UserSummary>(
    (cursor) =>
      section === 'contacts'
        ? fixtureDataSource.listContacts(contactsFilter, { cursor, limit: 12 })
        : Promise.resolve(EMPTY_PAGE),
    `contacts:${section}:${contactsFilter}`,
  );

  const notYet = useCallback((what: string) => toast.show(`${what} arrives later.`), [toast]);

  const active = section === 'messages' ? conversations : contacts;

  return (
    <AppScreen padded={false}>
      <View style={styles.header}>
        <ScreenHeader
          title="Messages"
          actions={
            <>
              <IconButton
                symbol="magnifyingglass"
                glyph="🔍"
                label="Search messages"
                onPress={() => notYet('Message search')}
              />
              <IconButton
                symbol="ellipsis.circle"
                glyph="⋯"
                label="More options"
                onPress={() => notYet('More message options')}
              />
            </>
          }
        />
        <SegmentedTabs
          items={SECTIONS}
          value={section}
          onChange={setSection}
          label="Messages sections"
          variant="pill"
        />
        <FilterChips
          items={section === 'messages' ? CONVERSATION_FILTERS : CONTACT_FILTERS}
          value={section === 'messages' ? conversationFilter : contactsFilter}
          onChange={(key) => {
            if (section === 'messages') {
              setConversationFilter(key as ConversationFilter);
            } else {
              setContactsFilter(key as ContactsFilter);
            }
          }}
          label="Message filters"
        />

        {section === 'messages' && !promptDismissed ? (
          <View
            style={[styles.prompt, { backgroundColor: theme.brandSoft }]}
            accessibilityRole="summary"
          >
            <View style={styles.promptCopy}>
              <ThemedText type="smallBold" style={{ color: theme.brand }}>
                Turn on notifications
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Know when someone replies or invites you to a room.
              </ThemedText>
            </View>
            <AppButton
              label="Enable"
              variant="primary"
              onPress={() => {
                setPromptDismissed(true);
                notYet('Notification permissions');
              }}
            />
            <IconButton
              symbol="xmark"
              glyph="✕"
              label="Dismiss"
              tone="muted"
              onPress={() => setPromptDismissed(true)}
            />
          </View>
        ) : null}
      </View>

      {active.status === 'loading' ? (
        <View style={styles.padded}>
          <LoadingSkeleton rows={6} />
        </View>
      ) : active.status === 'error' ? (
        <ErrorState onRetry={active.reload} />
      ) : active.items.length === 0 ? (
        <EmptyState
          title={section === 'messages' ? 'No conversations' : 'No contacts'}
          message={
            section === 'messages'
              ? 'Nothing matches this filter. Try another one.'
              : 'Follow someone and they will appear here.'
          }
        />
      ) : section === 'messages' ? (
        <FlatList
          data={conversations.items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          accessibilityLabel="Conversations"
          ItemSeparatorComponent={Divider}
          refreshControl={
            <RefreshControl
              refreshing={conversations.isRefreshing}
              onRefresh={conversations.refresh}
            />
          }
          onEndReachedThreshold={0.6}
          onEndReached={conversations.loadMore}
          renderItem={({ item }) => (
            <ConversationRow
              conversation={item}
              onPress={(id) => notYet(`The conversation for ${id}`)}
            />
          )}
        />
      ) : (
        <FlatList
          data={contacts.items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          accessibilityLabel="Contacts"
          ItemSeparatorComponent={Divider}
          refreshControl={
            <RefreshControl refreshing={contacts.isRefreshing} onRefresh={contacts.refresh} />
          }
          onEndReachedThreshold={0.6}
          onEndReached={contacts.loadMore}
          renderItem={({ item }) => (
            <PeopleRow
              user={item}
              onOpenProfile={(userId) => notYet(`The profile for ${userId}`)}
              onGreet={(userId) => notYet(`Greeting ${userId}`)}
            />
          )}
        />
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: Spacing.three, gap: Spacing.one },
  padded: { paddingHorizontal: Spacing.three },
  listContent: { paddingHorizontal: Spacing.three, paddingBottom: Spacing.six },
  prompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.large,
  },
  promptCopy: { flex: 1, gap: Spacing.half },
});
