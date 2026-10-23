import { fireEvent, render, screen } from '@testing-library/react-native';

import { ChatComposer } from './chat-composer';

const handlers = (overwrites: Record<string, jest.Mock> = {}) => ({
  onSend: jest.fn(),
  onProfile: jest.fn(),
  onPhoto: jest.fn(),
  onGift: jest.fn(),
  onCall: jest.fn(),
  onEmoji: jest.fn(),
  ...overwrites,
});

describe('ChatComposer', () => {
  it('carries a draft and hands the typed text to the send owner', async () => {
    const action = handlers();
    await render(<ChatComposer {...action} />);

    const draft = await screen.findByLabelText('Message draft');
    await fireEvent.changeText(draft, 'Nudge when the room opens');
    await fireEvent.press(screen.getByLabelText('Send'));

    expect(action.onSend).toHaveBeenCalledWith('Nudge when the room opens');
  });

  it('keeps the draft after a send attempt, because nothing was confirmed', async () => {
    const action = handlers();
    await render(<ChatComposer {...action} />);

    const draft = await screen.findByLabelText('Message draft');
    await fireEvent.changeText(draft, 'Nudge when the room opens');
    await fireEvent.press(screen.getByLabelText('Send'));

    expect(draft.props.value).toBe('Nudge when the room opens');
  });

  it('routes every toolbar affordance to its owner', async () => {
    const action = handlers();
    await render(<ChatComposer {...action} />);

    await fireEvent.press(screen.getByLabelText('Open profile'));
    await fireEvent.press(screen.getByLabelText('Send a photo'));
    await fireEvent.press(screen.getByLabelText('Send a gift'));
    await fireEvent.press(screen.getByLabelText('Voice call'));
    await fireEvent.press(screen.getByLabelText('Pick an emoji'));

    expect(action.onProfile).toHaveBeenCalledTimes(1);
    expect(action.onPhoto).toHaveBeenCalledTimes(1);
    expect(action.onGift).toHaveBeenCalledTimes(1);
    expect(action.onCall).toHaveBeenCalledTimes(1);
    expect(action.onEmoji).toHaveBeenCalledTimes(1);
  });
});
