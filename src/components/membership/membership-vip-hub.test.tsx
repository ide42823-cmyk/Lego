import { fireEvent, render } from '@testing-library/react-native';

import { MembershipVipHubView } from './membership-vip-hub';

import type { MembershipVipHub } from '@/core/data/types';

const hub: MembershipVipHub = {
  family: 'vip',
  points: 0,
  hero: {
    displayName: 'My Account',
    avatarUrl: 'asset:media/portraits/self.jpg',
    backgroundUrl: 'asset:media/backgrounds/vip-hero.png',
    heart: true,
  },
  currentLevel: 'VIP1',
  levels: [
    { label: 'VIP1', xp: 0 },
    { label: 'VIP2', xp: 16000 },
    { label: 'VIP3', xp: 64000 },
    { label: 'VIP4', xp: 304000 },
    { label: 'VIP5', xp: 1408000 },
    { label: 'VIP6', xp: 6544000 },
    { label: 'VIP7', xp: 18472000 },
  ],
  benefits: [
    { id: 'b-label', label: 'VIP Label', art: 'label', unlockLevel: 'VIP1' },
    { id: 'b-viewed', label: 'Who viewed me', glyph: 'eye', unlockLevel: 'VIP1' },
    { id: 'b-following', label: 'More Following', glyph: 'user-check', unlockLevel: 'VIP1' },
    { id: 'b-room', label: 'Create chat room', glyph: 'house', unlockLevel: 'VIP1' },
    { id: 'b-frame', label: 'Exclusive Frame', art: 'frame', unlockLevel: 'VIP1' },
    { id: 'b-badge', label: 'Exclusive Badge', art: 'crest', unlockLevel: 'VIP1' },
    { id: 'b-nickname', label: 'More nickname changes', glyph: 'pencil', unlockLevel: 'VIP2' },
    { id: 'b-lucky', label: 'Send lucky bag', glyph: 'gift', unlockLevel: 'VIP3' },
    { id: 'b-friends', label: 'More Friends Display', glyph: 'friends', unlockLevel: 'VIP5' },
    { id: 'b-gifts', label: 'Exclusive Gifts', art: 'gift-art', unlockLevel: 'VIP5' },
    { id: 'b-dnd', label: 'Do Not Disturb', glyph: 'silence', unlockLevel: 'VIP7' },
    { id: 'b-rooms', label: 'More Rooms Joined', art: 'room-joined', unlockLevel: 'VIP7' },
  ],
  store: [
    { id: 'store-a', category: 'Vehicles', requiredLevel: 'VIP3', price: 30000, validityDays: 7 },
    { id: 'store-b', category: 'Frames', price: 24000, validityDays: 7 },
  ],
};

const handlers = {
  onBack: jest.fn(),
  onFamilyChange: jest.fn(),
  onRecharge: jest.fn(),
  onBuy: jest.fn(),
  onHelp: jest.fn(),
  onViewMore: jest.fn(),
};

describe('MembershipVipHubView', () => {
  beforeEach(() => {
    Object.values(handlers).forEach((handler) => handler.mockClear());
  });

  it('paints the hero, the windowed rail and the first six benefits', async () => {
    const view = await render(<MembershipVipHubView hub={hub} {...handlers} />);

    expect(view.getByText('My Account')).toBeTruthy();
    expect(view.getByText('Recharge any amount to keep VIP!')).toBeTruthy();
    expect(view.getByLabelText('Recharge')).toBeTruthy();
    // The entry rung is the held one, so its crest reads Current, not Locked.
    expect(view.getByText('Current')).toBeTruthy();

    // The rail always shows five markers, clamped to the ladder's start.
    expect(view.getByLabelText('Level VIP1')).toBeTruthy();
    expect(view.getByLabelText('Level VIP3')).toBeTruthy();
    expect(view.getByLabelText('Level VIP5')).toBeTruthy();
    expect(view.queryByLabelText('Level VIP6')).toBeNull();

    expect(view.getByText('VIP1 Benefits (6/12)')).toBeTruthy();
    expect(view.getByText('VIP Label')).toBeTruthy();
    expect(view.getByText('Exclusive Badge')).toBeTruthy();
    // The seventh benefit is past the collapsed six.
    expect(view.queryByText('More nickname changes')).toBeNull();
    expect(view.getByLabelText('Expand More')).toBeTruthy();

    expect(view.getByText('VIPStore')).toBeTruthy();
    expect(view.getByText('My Points')).toBeTruthy();
    expect(view.getByLabelText('Vehicles. 30000 points for 7 days, needs VIP3')).toBeTruthy();
  });

  it('windows the rail, re-counts and locks by the viewed rung', async () => {
    const view = await render(<MembershipVipHubView hub={hub} {...handlers} />);

    await fireEvent.press(view.getByLabelText('Level VIP3'));

    // VIP3 keeps the five-marker window anchored to the ladder's start.
    expect(view.getByLabelText('Level VIP5')).toBeTruthy();
    expect(view.queryByLabelText('Level VIP6')).toBeNull();
    expect(view.getByText('Reach 64000 VIP XP')).toBeTruthy();
    expect(view.getByText('Unlock VIP3')).toBeTruthy();
    expect(view.getByText('Locked')).toBeTruthy();
    expect(view.getByText('VIP3 Benefits (8/12)')).toBeTruthy();
  });

  it('expands the matrix to every benefit and packs it up again', async () => {
    const view = await render(<MembershipVipHubView hub={hub} {...handlers} />);

    await fireEvent.press(view.getByLabelText('Expand More'));
    expect(view.getByText('More nickname changes')).toBeTruthy();
    expect(view.getByText('Do Not Disturb')).toBeTruthy();
    expect(view.getByLabelText('More Friends Display. Locked until VIP5')).toBeTruthy();
    expect(view.getByLabelText('Pack up')).toBeTruthy();

    await fireEvent.press(view.getByLabelText('Pack up'));
    expect(view.queryByText('Do Not Disturb')).toBeNull();
    expect(view.getByLabelText('Expand More')).toBeTruthy();
  });

  it('routes recharge, buy, records, help, back and the family switch', async () => {
    const view = await render(<MembershipVipHubView hub={hub} {...handlers} />);

    await fireEvent.press(view.getByLabelText('Recharge'));
    expect(handlers.onRecharge).toHaveBeenCalledTimes(1);

    await fireEvent.press(view.getByLabelText('Vehicles. 30000 points for 7 days, needs VIP3'));
    expect(handlers.onBuy).toHaveBeenCalledWith(hub.store[0]);

    await fireEvent.press(view.getByLabelText('View more store items'));
    expect(handlers.onViewMore).toHaveBeenCalledTimes(1);

    await fireEvent.press(view.getByLabelText('Records'));
    expect(handlers.onViewMore).toHaveBeenCalledTimes(2);

    await fireEvent.press(view.getByLabelText('Help'));
    expect(handlers.onHelp).toHaveBeenCalledTimes(1);

    await fireEvent.press(view.getByLabelText('What are membership points'));
    expect(handlers.onHelp).toHaveBeenCalledTimes(2);

    await fireEvent.press(view.getByLabelText('SVIP'));
    expect(handlers.onFamilyChange).toHaveBeenCalledWith('svip');

    await fireEvent.press(view.getByLabelText('Back'));
    expect(handlers.onBack).toHaveBeenCalledTimes(1);
  });
});
