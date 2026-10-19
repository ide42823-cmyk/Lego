import AppBottomTabs from '@/components/app-bottom-tabs';
import { fixtureDataSource } from '@/core/data/repository';
import { useAsync } from '@/hooks/use-async';

/**
 * The persistent tab shell.
 *
 * The five destinations come straight from the reference navigation model:
 * Home, Moments, Rooms, Messages, Me. Secondary screens are pushed onto the
 * root stack (see `src/app/_layout.tsx`) so the tab bar stays mounted and each
 * tab keeps its own scroll and filter state.
 *
 * Badge counts are read from the data layer rather than hard-coded, so the
 * counter is real as soon as a backend replaces the fixtures.
 */
export default function TabsLayout() {
  const conversations = useAsync(
    () => fixtureDataSource.listConversations('all', { limit: 100 }),
    'tab-unread-total',
  );

  const unreadTotal =
    conversations.status === 'ready'
      ? conversations.data.items.reduce((total, item) => total + item.unreadCount, 0)
      : 0;

  return <AppBottomTabs messageBadge={unreadTotal} />;
}
