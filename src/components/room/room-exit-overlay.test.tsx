import { fireEvent, render, screen } from '@testing-library/react-native';

import { RoomExitOverlay } from './room-exit-overlay';

describe('RoomExitOverlay', () => {
  it('opens over the mounted room with only Keep and Exit', async () => {
    const { queryByText } = await render(
      <RoomExitOverlay visible onKeep={jest.fn()} onExit={jest.fn()} />,
    );

    expect(queryByText('Keep')).toBeTruthy();
    expect(queryByText('Exit')).toBeTruthy();
  });

  it('keeps without navigation and exits through its owner', async () => {
    const onKeep = jest.fn();
    const onExit = jest.fn();
    await render(<RoomExitOverlay visible onKeep={onKeep} onExit={onExit} />);

    await fireEvent.press(screen.getByLabelText('Keep'));
    await fireEvent.press(screen.getByLabelText('Exit'));

    expect(onKeep).toHaveBeenCalledTimes(1);
    expect(onExit).toHaveBeenCalledTimes(1);
  });
});
