import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { ConversationRow } from '@/components/conversation-row';
import { PeopleRow } from '@/components/people-row';
import { PromoBanner } from '@/components/promo-banner';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { AppScreen } from '@/components/ui/app-screen';
import { Divider } from '@/components/ui/divider';
import { FilterChips, type FilterChipItem } from '@/components/ui/filter-chips';
import { FloatingAction } from '@/components/ui/floating-action';
import { IconButton } from '@/components/ui/icon-button';
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
  PromoBanner as PromoBannerModel,
  UserSummary,
} from '@/core/data/types';
import { usePaginated } from '@/hooks/use-async';
import { useTints } from '@/hooks/use-tints';

/**
 * Messages — inbox and contacts (reference screen 082).
 *
 * Two sub-sections share one header. Only the active section loads, so opening
 * the inbox does not also fetch the contact list. The rows are flat with rules
 * between them because an inbox is a dense list, not a wall of cards.
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

/**
 * Fixed product copy, not user data: the family programme lives in the app, so
 * it is a screen constant rather than something the repository has to invent.
 */
const FAMILY_PROMO: PromoBannerModel = {
  id: 'family-invite',
  title: 'Join a family to get Coins',
  subtitle: 'Team up with friends and earn together',
  ctaLabel: 'Join',
};

export default function MessagesScreen() {
  const tints = useTints();
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
  const unreadTotal = conversations.items.reduce((total, item) => total + item.unreadCount, 0);

  return (
    <AppScreen padded={false} tint="messages">
      <View style={styles.header}>
        <View style={styles.tabs}>
          <SegmentedTabs
            items={SECTIONS}
            value={section}
            onChange={setSection}
            label="Messages sections"
          />
        </View>
        <View style={styles.actions}>
          <IconButton
            name="search"
            label="Search messages"
            onPress={() => notYet('Message search')}
          />
          <IconButton
            name="menu"
            label="More options"
            onPress={() => notYet('More message options')}
          />
        </View>
      </View>

      <View style={styles.chips}>
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
          ListHeaderComponent={
            <View style={styles.notices}>
              {promptDismissed ? null : (
                <View
                  style={[styles.notice, { backgroundColor: tints.chip.chat.background }]}
                  accessibilityRole="summary"
                >
                  <View style={styles.noticeCopy}>
                    <ThemedText
                      type="smallBold"
                      style={{ color: tints.chip.chat.text }}
                      numberOfLines={1}
                    >
                      Turn on notifications
                    </ThemedText>
                    <ThemedText
                      type="small"
                      style={[styles.noticeHint, { color: tints.chip.chat.text }]}
                    >
                      Know when someone replies or invites you to a room.
                    </ThemedText>
                  </View>
                  <AppButton
                    label="Go enable"
                    variant="primary"
                    onPress={() => {
                      setPromptDismissed(true);
                      notYet('Notification permissions');
                    }}
                  />
                  <IconButton
                    name="close"
                    label="Dismiss"
                    tone="muted"
                    onPress={() => setPromptDismissed(true)}
                  />
                </View>
              )}
              <PromoBanner
                banner={FAMILY_PROMO}
                variant="row"
                onPress={() => notYet('Joining a family')}
              />
            </View>
          }
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

      <View style={styles.fab} pointerEvents="box-none">
        <FloatingAction
          label="Notifications"
          name="bell"
          badge={unreadTotal}
          onPress={() => notYet('Your notifications')}
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
    paddingBottom: Spacing.two,
  },
  tabs: { flex: 1, paddingStart: Spacing.two },
  actions: { flexDirection: 'row', alignItems: 'center' },
  chips: { paddingHorizontal: Spacing.three, paddingBottom: Spacing.one },
  padded: { paddingHorizontal: Spacing.three },
  listContent: { paddingHorizontal: Spacing.three, paddingBottom: Spacing.six },
  notices: { gap: Spacing.two, paddingBottom: Spacing.two },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.large,
  },
  noticeCopy: { flex: 1, gap: Spacing.half },
  noticeHint: { opacity: 0.75 },
  fab: { position: 'absolute', bottom: Spacing.four, end: Spacing.three },
});
