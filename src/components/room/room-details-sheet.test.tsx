import { fireEvent, render } from '@testing-library/react-native';

import { RoomDetailsSheet } from './room-details-sheet';

const host = {
  id: 'user-1',
  displayName: 'Dragon班主任',
  idLabel: 'ID: 8500000',
  avatarUrl: undefined,
  level: 3,
};

const details = {
  level: 3,
  levelProgress: 0.4,
  achievements: [
    { id: 'a1', tone: 'violet' as const, tierLabel: 'Lv.1', valueLabel: '20+', caption: 'daily speakers' },
    { id: 'a2', tone: 'blue' as const, tierLabel: 'Lv.1', valueLabel: '100+', caption: 'daily visitors' },
  ],
  members: [
    { id: 'm1', badge: 'mic' as const },
    { id: 'm2', badge: 'headset' as const },
  ],
  info: 'Make yourself at home — everyone is welcome here 😄',
};

const handlers = {
  onClose: jest.fn(),
  onCopyId: jest.fn(),
  onShare: jest.fn(),
  onFavorite: jest.fn(),
  onJoin: jest.fn(),
  onMembers: jest.fn(),
  onAchievements: jest.fn(),
  onInfo: jest.fn(),
};

export function RoomDetailsSheetHarness({ joined }: { joined: boolean }) {
  return <RoomDetailsSheet visible host={host} details={details} joined={joined} {...handlers} />;
}

describe('RoomDetailsSheet', () => {
  it('lays out owner, achievements, members and the standing info', async () => {
    const { getByText } = await render(<RoomDetailsSheetHarness joined />);

    expect(getByText('Room Details')).toBeTruthy();
    expect(getByText(host.displayName)).toBeTruthy();
    expect(getByText('ID: 8500000')).toBeTruthy();
    expect(getByText('Room Achievements(2)')).toBeTruthy();
    expect(getByText('daily speakers')).toBeTruthy();
    expect(getByText('Room Members(2)')).toBeTruthy();
    expect(getByText(details.info)).toBeTruthy();
  });

  it('renders a taken Join when opened from inside a joined room', async () => {
    const { getByText } = await render(<RoomDetailsSheetHarness joined />);

    expect(getByText('Joined')).toBeTruthy();
  });

  it('routes copy, share, favourite and the deeper lists to their owners', async () => {
    const { getByLabelText } = await render(<RoomDetailsSheetHarness joined={false} />);

    await fireEvent.press(getByLabelText('Copy the room id'));
    await fireEvent.press(getByLabelText('Share this room'));
    await fireEvent.press(getByLabelText('Follow this room'));
    await fireEvent.press(getByLabelText('Open the member list'));

    expect(handlers.onCopyId).toHaveBeenCalledTimes(1);
    expect(handlers.onShare).toHaveBeenCalledTimes(1);
    expect(handlers.onFavorite).toHaveBeenCalledTimes(1);
    expect(handlers.onMembers).toHaveBeenCalledTimes(1);
  });
});
