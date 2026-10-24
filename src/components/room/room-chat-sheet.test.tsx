import { fireEvent, render } from '@testing-library/react-native';

import { RoomChatSheet } from './room-chat-sheet';

import type { RoomInboxModel } from '@/core/data/types';

const inbox: RoomInboxModel = {
  system: [
    {
      id: 'inbox-interactions',
      key: 'interactions',
      title: 'Interaction notifications',
      subtitle: 'Salma invited you to become a room member',
      lastMessageAt: '2026-10-23T16:00:00.000Z',
    },
    {
      id: 'inbox-team',
      key: 'team',
      title: 'LETGO TEAM',
      subtitle: 'System Notice: Newcomer rewards only count during your first 7 days',
      badge: 60,
      lastMessageAt: '2026-10-24T10:00:00.000Z',
    },
    {
      id: 'inbox-moments',
      key: 'moments',
      title: 'Moments',
      subtitle: 'Share your thoughts',
    },
  ],
  conversations: [
    {
      id: 'conversation-1',
      peerId: 'user-1',
      peerName: 'Rana',
      avatarUrl: 'https://example.com/rana.png',
      snippet: 'Jump into the arena jackpot',
      lastMessageAt: '2026-10-24T11:30:00.000Z',
      unreadCount: 1,
      isOnline: true,
      isFavorite: false,
    },
    {
      id: 'conversation-2',
      peerId: 'user-2',
      peerName: 'Lina',
      avatarUrl: 'https://example.com/lina.png',
      snippet: 'ok',
      lastMessageAt: '2026-10-24T11:40:00.000Z',
      unreadCount: 0,
      isOnline: false,
      isFavorite: false,
    },
  ],
};

const handlers = {
  onClose: jest.fn(),
  onOpenConversation: jest.fn(),
  onOpenMoments: jest.fn(),
  onSystemEntry: jest.fn(),
};

describe('RoomChatSheet', () => {
  beforeEach(() => {
    handlers.onClose.mockClear();
    handlers.onOpenConversation.mockClear();
    handlers.onOpenMoments.mockClear();
    handlers.onSystemEntry.mockClear();
  });

  it('lays out the system rows and the conversation rows', async () => {
    const view = await render(<RoomChatSheet visible inbox={inbox} {...handlers} />);

    expect(view.queryByText('Messages')).toBeTruthy();
    expect(view.queryByText('Interaction notifications')).toBeTruthy();
    expect(view.queryByText('LETGO TEAM')).toBeTruthy();
    expect(view.queryByText('Moments')).toBeTruthy();
    expect(view.queryByText('Share your thoughts')).toBeTruthy();
    expect(view.queryByText('Rana')).toBeTruthy();
    expect(view.queryByText('ok')).toBeTruthy();
    // The team's single server-owned unread stack renders its meaningful text.
    expect(view.queryByText('60')).toBeTruthy();
  });

  it('routes conversations to threads and Moments to the tab, gates the rest', async () => {
    const view = await render(<RoomChatSheet visible inbox={inbox} {...handlers} />);

    await fireEvent.press(view.getByText('Rana'));
    expect(handlers.onOpenConversation).toHaveBeenCalledWith('conversation-1');
    expect(handlers.onOpenMoments).not.toHaveBeenCalled();

    await fireEvent.press(view.getByLabelText(/Moments\. Share your thoughts/));
    expect(handlers.onOpenMoments).toHaveBeenCalledTimes(1);

    await fireEvent.press(view.getByLabelText(/LETGO TEAM/));
    expect(handlers.onSystemEntry).toHaveBeenCalledTimes(1);
    expect(handlers.onSystemEntry.mock.calls[0]?.[0]).toMatchObject({ id: 'inbox-team' });

    await fireEvent.press(view.getByLabelText(/Interaction notifications/));
    expect(handlers.onSystemEntry).toHaveBeenCalledTimes(2);
  });

  it('closes from the scrim and renders nothing while hidden', async () => {
    const view = await render(<RoomChatSheet visible inbox={inbox} {...handlers} />);
    await fireEvent.press(view.getByLabelText('Close'));
    expect(handlers.onClose).toHaveBeenCalledTimes(1);

    const hidden = await render(<RoomChatSheet visible={false} inbox={inbox} {...handlers} />);
    expect(hidden.queryByText('Messages')).toBeNull();
  });
});
