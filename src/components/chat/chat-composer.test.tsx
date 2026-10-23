import { fireEvent, render, screen } from '@testing-library/react-native';

import { ChatComposer } from './chat-composer';

describe('ChatComposer', () => {
  it('carries a draft and hands the typed text to the send owner', async () => {
    const onSend = jest.fn();
    const onPickEmoji = jest.fn();
    await render(<ChatComposer onSend={onSend} onPickEmoji={onPickEmoji} />);

    const draft = await screen.findByLabelText('Message draft');
    await fireEvent.changeText(draft, 'Nudge when the room opens');
    await fireEvent.press(screen.getByLabelText('Send'));

    expect(onSend).toHaveBeenCalledWith('Nudge when the room opens');
  });

  it('keeps the draft after a send attempt, because nothing was confirmed', async () => {
    const onSend = jest.fn();
    await render(<ChatComposer onSend={onSend} onPickEmoji={jest.fn()} />);

    const draft = await screen.findByLabelText('Message draft');
    await fireEvent.changeText(draft, 'Nudge when the room opens');
    await fireEvent.press(screen.getByLabelText('Send'));

    expect(draft.props.value).toBe('Nudge when the room opens');
  });

  it('routes the emoji affordance to its owner', async () => {
    const onPickEmoji = jest.fn();
    await render(<ChatComposer onSend={jest.fn()} onPickEmoji={onPickEmoji} />);

    await fireEvent.press(screen.getByLabelText('Pick an emoji'));
    expect(onPickEmoji).toHaveBeenCalledTimes(1);
  });
});
