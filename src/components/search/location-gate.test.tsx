import { fireEvent, render, screen } from '@testing-library/react-native';

import { LocationGate } from './location-gate';

describe('LocationGate', () => {
  it('asks for location without implying a position is read', async () => {
    await render(<LocationGate onEnable={jest.fn()} onOpenSettings={jest.fn()} />);

    expect(screen.getByLabelText('Enable Now')).toBeTruthy();
    expect(screen.getByLabelText('Go to settings')).toBeTruthy();
    expect(screen.getByText('Turn on location to see more people nearby')).toBeTruthy();
  });

  it('routes the enable control and the settings link to their owners', async () => {
    const onEnable = jest.fn();
    const onOpenSettings = jest.fn();
    await render(<LocationGate onEnable={onEnable} onOpenSettings={onOpenSettings} />);

    await fireEvent.press(screen.getByLabelText('Enable Now'));
    await fireEvent.press(screen.getByLabelText('Go to settings'));

    expect(onEnable).toHaveBeenCalledTimes(1);
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });
});
