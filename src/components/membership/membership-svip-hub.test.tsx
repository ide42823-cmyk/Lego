import { fireEvent, render } from '@testing-library/react-native';

import { MembershipSvipHubView } from './membership-svip-hub';

import type { MembershipSvipHub } from '@/core/data/types';

const hub: MembershipSvipHub = {
  family: 'svip',
  points: 0,
  levels: [
    {
      label: 'SVIP6',
      current: false,
      privileges: [{ id: 'svip6-a', label: 'Entrance effects', requiredLevel: 'SVIP6' }],
    },
    {
      label: 'SVIP7',
      current: false,
      privileges: [{ id: 'svip7-a', label: 'Broadcast gift privilege', requiredLevel: 'SVIP7' }],
    },
  ],
  store: [
    { id: 'store-a', category: 'Vehicles', requiredLevel: 'SVIP3', price: 100000, validityDays: 7 },
    { id: 'store-b', category: 'Frames', price: 30000, validityDays: 7 },
  ],
};

const handlers = {
  onBack: jest.fn(),
  onFamilyChange: jest.fn(),
  onBuy: jest.fn(),
  onHelp: jest.fn(),
  onViewMore: jest.fn(),
};

describe('MembershipSvipHubView', () => {
  beforeEach(() => {
    handlers.onBack.mockClear();
    handlers.onFamilyChange.mockClear();
    handlers.onBuy.mockClear();
    handlers.onHelp.mockClear();
    handlers.onViewMore.mockClear();
  });

  it('lays out the family tabs, the level band, privileges and the store', async () => {
    const view = await render(<MembershipSvipHubView hub={hub} {...handlers} />);

    expect(view.queryByText('VIP')).toBeTruthy();
    expect(view.getByLabelText('SVIP')).toBeTruthy();
    // No level is held, so the ladder defaults to its first rung.
    expect(view.queryByText('Entrance effects')).toBeTruthy();
    expect(view.queryByText('SVIPStore')).toBeTruthy();
    expect(view.queryByText('My Points')).toBeTruthy();
    expect(view.queryByText('0')).toBeTruthy();
    expect(view.queryByLabelText('Vehicles. 100000 points for 7 days, needs SVIP3')).toBeTruthy();
    expect(view.queryByLabelText('Frames. 30000 points for 7 days')).toBeTruthy();
    expect(view.queryAllByText('7 Day')).toHaveLength(2);
    expect(view.queryByText('View More')).toBeTruthy();
  });

  it('packs the privileges up and switches the served level', async () => {
    const view = await render(<MembershipSvipHubView hub={hub} {...handlers} />);
    expect(view.queryByText('Entrance effects')).toBeTruthy();

    // Packing up collapses the highlight cards into the level band.
    await fireEvent.press(view.getByLabelText('Pack up the privileges'));
    expect(view.queryByText('Entrance effects')).toBeNull();

    // Selecting another level re-opens that rung's highlights.
    await fireEvent.press(view.getByLabelText('Membership level SVIP7'));
    expect(view.queryByText('Broadcast gift privilege')).toBeTruthy();
    expect(view.queryByText('Entrance effects')).toBeNull();
  });

  it('routes buy, records, help, back and the family switch out', async () => {
    const view = await render(
      <MembershipSvipHubView hub={hub} {...handlers} />,
    );

    await fireEvent.press(view.getByLabelText('Vehicles. 100000 points for 7 days, needs SVIP3'));
    expect(handlers.onBuy).toHaveBeenCalledWith(hub.store[0]);

    await fireEvent.press(view.getByLabelText('View more store items'));
    expect(handlers.onViewMore).toHaveBeenCalledTimes(1);

    await fireEvent.press(view.getByLabelText('Help'));
    expect(handlers.onHelp).toHaveBeenCalledTimes(1);

    await fireEvent.press(view.getByLabelText('Records'));
    expect(handlers.onViewMore).toHaveBeenCalledTimes(2);

    await fireEvent.press(view.getByLabelText('What are membership points'));
    expect(handlers.onHelp).toHaveBeenCalledTimes(2);

    await fireEvent.press(view.getByLabelText('VIP'));
    expect(handlers.onFamilyChange).toHaveBeenCalledWith('vip');

    await fireEvent.press(view.getByLabelText('Back'));
    expect(handlers.onBack).toHaveBeenCalledTimes(1);
  });
});
