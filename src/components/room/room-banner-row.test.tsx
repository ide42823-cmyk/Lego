import { fireEvent, render } from '@testing-library/react-native';

import { RoomBannerRow } from './room-banner-row';

const handlers = {
  onPressRank: jest.fn(),
  onPressTicker: jest.fn(),
  onPressFreeDraw: jest.fn(),
};

describe('RoomBannerRow', () => {
  beforeEach(() => {
    handlers.onPressRank.mockClear();
    handlers.onPressTicker.mockClear();
    handlers.onPressFreeDraw.mockClear();
  });

  it('renders the rank pill, the draw ticker and the winner ribbon', async () => {
    const view = await render(
      <RoomBannerRow
        rankLabel="Hourly Top 50"
        progressLabel="0%"
        countdownLabel="03:54:02"
        headline="Nadia won the Lucky Draw jackpot"
        freeDraw
        onPressRank={handlers.onPressRank}
        onPressTicker={handlers.onPressTicker}
        onPressFreeDraw={handlers.onPressFreeDraw}
      />,
    );

    expect(view.queryByText('Nadia won the Lucky Draw jackpot')).toBeTruthy();
    expect(view.getByLabelText('Room ranking: Hourly Top 50')).toBeTruthy();
    expect(view.getByLabelText('Draw board at 0%, next draw in 03:54:02')).toBeTruthy();
    expect(view.getByLabelText('Free draw')).toBeTruthy();
  });

  it('hides the ribbon when the server sends no headline', async () => {
    const view = await render(
      <RoomBannerRow
        rankLabel="Hourly Top 50"
        progressLabel="12%"
        countdownLabel="01:24:19"
        freeDraw={false}
        onPressRank={handlers.onPressRank}
        onPressTicker={handlers.onPressTicker}
        onPressFreeDraw={handlers.onPressFreeDraw}
      />,
    );

    expect(view.queryByText('Nadia won the Lucky Draw jackpot')).toBeNull();
    expect(view.queryByLabelText('Free draw')).toBeNull();

    await fireEvent.press(view.getByLabelText('Room ranking: Hourly Top 50'));
    expect(handlers.onPressRank).toHaveBeenCalledTimes(1);
    await fireEvent.press(view.getByLabelText('Draw board at 12%, next draw in 01:24:19'));
    expect(handlers.onPressTicker).toHaveBeenCalledTimes(1);
  });
});
