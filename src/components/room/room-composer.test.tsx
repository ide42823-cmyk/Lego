import { fireEvent, render, screen } from '@testing-library/react-native';

import { RoomComposer } from './room-composer';

const handlers = (overwrites: Record<string, jest.Mock> = {}) => ({
  onSend: jest.fn(),
  onChatList: jest.fn(),
  onApps: jest.fn(),
  onGift: jest.fn(),
  unreadCount: 99,
  ...overwrites,
});

describe('RoomComposer', () => {
  it('carries the draft and hands it to the send owner', async () => {
    const action = handlers();
    await render(<RoomComposer {...action} />);

    const draft = await screen.findByLabelText('Room message draft');
    await fireEvent.changeText(draft, 'Take seat five for me');
    await fireEvent.press(screen.getByLabelText('Send'));

    expect(action.onSend).toHaveBeenCalledWith('Take seat five for me');
  });

  it('keeps the draft after a send attempt, because nothing was confirmed', async () => {
    const action = handlers();
    await render(<RoomComposer {...action} />);

    const draft = await screen.findByLabelText('Room message draft');
    await fireEvent.changeText(draft, 'Take seat five for me');
    await fireEvent.press(screen.getByLabelText('Send'));

    expect(draft.props.value).toBe('Take seat five for me');
  });

  it('shows the unread badge only when there is something unread', async () => {
    await render(<RoomComposer {...handlers()} />);
    expect(screen.getByText('99+')).toBeTruthy();

    await render(<RoomComposer {...handlers()} unreadCount={0} />);
    expect(screen.queryByText('99+')).toBeNull();
  });

  it('routes the chat list, utilities and gift to their owners', async () => {
    const action = handlers();
    await render(<RoomComposer {...action} />);

    await fireEvent.press(screen.getByLabelText('Open the room chat'));
    await fireEvent.press(screen.getByLabelText('Room utilities'));
    await fireEvent.press(screen.getByLabelText('Send a gift'));

    expect(action.onChatList).toHaveBeenCalledTimes(1);
    expect(action.onApps).toHaveBeenCalledTimes(1);
    expect(action.onGift).toHaveBeenCalledTimes(1);
  });
});
