import { render, screen } from '@testing-library/react-native';

import { ChatBubble } from './chat-bubble';
import type { ChatMessage } from '@/core/data/types';

const message = (overwrites: Partial<ChatMessage> = {}): ChatMessage => ({
  id: 'm1',
  conversationId: 'conversation-1',
  authorId: 'user-1',
  kind: 'text',
  text: 'See you in the room tonight?',
  sentAt: '2026-10-23T20:15:00.000Z',
  ...overwrites,
});

describe('ChatBubble', () => {
  it('names the author as words, never an unread-style dot', async () => {
    await render(
      <>
        <ChatBubble message={message()} mine={false} peerName="SOUF جود" ornamented />
        <ChatBubble message={message({ authorId: 'user-me' })} mine peerName="SOUF جود" />
      </>,
    );

    expect(screen.getByLabelText('SOUF جود: See you in the room tonight?')).toBeTruthy();
    expect(screen.getByLabelText('You: See you in the room tonight?')).toBeTruthy();
  });

  it('keeps the bubble static: nothing to press, nothing to imply', async () => {
    await render(<ChatBubble message={message()} mine={false} peerName="SOUF جود" ornamented />);

    expect(screen.queryByRole('button')).toBeNull();
  });
});
