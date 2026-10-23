import { fireEvent, render, screen } from '@testing-library/react-native';

import { ChatThread } from './chat-thread';
import { fixtureDataSource } from '@/core/data/repository';

describe('ChatThread', () => {
  // conversation-3 is the first fixture whose text count earns a milestone strip.
  it('renders the fixture anatomy: notices, milestone strip and authored rows', async () => {
    const thread = await fixtureDataSource.listMessages('conversation-3');
    await render(<ChatThread thread={thread} onTranslate={jest.fn()} />);

    // The peer opens with a follow notice.
    expect(
      screen.getByLabelText(`${thread.conversation.peerName}: ${thread.messages[0]?.text}`),
    ).toBeTruthy();
    // A milestone strip belongs to nobody.
    expect(screen.getByText(/intimacy Lv\.1/i)).toBeTruthy();
    // The viewer's rows speak as "You", and the peer's carry the translate ring.
    expect(screen.getAllByLabelText(/^You: /).length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText('Translate this message').length).toBeGreaterThan(0);
  });

  it('routes the translate affordance to its owner', async () => {
    const thread = await fixtureDataSource.listMessages('conversation-3');
    const onTranslate = jest.fn();
    await render(<ChatThread thread={thread} onTranslate={onTranslate} />);

    await fireEvent.press(screen.getAllByLabelText('Translate this message')[0] as never);
    expect(onTranslate).toHaveBeenCalledTimes(1);
  });
});
