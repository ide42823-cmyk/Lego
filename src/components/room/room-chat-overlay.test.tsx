import { fireEvent, render, screen } from '@testing-library/react-native';

import type { RoomFeedNotice } from '@/core/data/types';

import { RoomChatOverlay } from './room-chat-overlay';

const notices: RoomFeedNotice[] = [
  { id: 'n1', kind: 'event', title: 'Lucky Draw', text: 'The Basic Arena jackpot is live.' },
  { id: 'n2', kind: 'event', title: 'Lucky Draw', text: 'Congratulations to Sirius on winning.' },
];

describe('RoomChatOverlay', () => {
  it('pins the welcome rules and the introduction above the notices', async () => {
    await render(
      <RoomChatOverlay
        welcomeText="Welcome rules live here"
        introduction="Make yourself at home 😄"
        eventNotices={notices}
        onPressEvent={jest.fn()}
      />,
    );

    expect(screen.getByText('Welcome rules live here')).toBeTruthy();
    expect(screen.getByText('Make yourself at home 😄')).toBeTruthy();
    expect(screen.getByText('The Basic Arena jackpot is live.')).toBeTruthy();
  });

  it('routes the GO chips to the event owner', async () => {
    const onPressEvent = jest.fn();
    await render(
      <RoomChatOverlay
        welcomeText="Welcome rules live here"
        introduction="Make yourself at home 😄"
        eventNotices={notices}
        onPressEvent={onPressEvent}
      />,
    );

    await fireEvent.press(screen.getAllByLabelText('Open Lucky Draw')[0]);

    expect(onPressEvent).toHaveBeenCalledTimes(1);
  });
});
