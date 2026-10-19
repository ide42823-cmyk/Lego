import { fireEvent, render, screen } from '@testing-library/react-native';

import type { UserSummary } from '@/core/data/types';

import { PeopleRow } from './people-row';

const ROW_LABEL = 'ليان. هنا للدردشة والضحك.';

const USER: UserSummary = {
  id: 'user-1',
  displayName: 'ليان',
  status: 'هنا للدردشة والضحك.',
  locale: 'SA',
  distanceKm: 6,
  level: 12,
  age: 24,
  gender: 'female',
  vipTier: 2,
  badges: ['level', 'vip'],
  isOnline: true,
};

describe('PeopleRow', () => {
  it('announces the display name and status as one label', async () => {
    await render(<PeopleRow user={USER} />);

    expect(screen.getByLabelText(ROW_LABEL)).toBeTruthy();
  });

  it('renders an Arabic monogram when no avatar URL is supplied', async () => {
    await render(<PeopleRow user={USER} />);

    expect(screen.getByText('ل')).toBeTruthy();
  });

  it('shows a bucketed distance, never a precise location', async () => {
    await render(<PeopleRow user={USER} />);

    expect(screen.getByText('6 km · هنا للدردشة والضحك.')).toBeTruthy();
  });

  it('keeps the distance coarse even when the directory sends a fraction', async () => {
    await render(<PeopleRow user={{ ...USER, distanceKm: 6.42 }} />);

    expect(screen.queryByText(/6\.42/)).toBeNull();
    expect(screen.getByText('6 km · هنا للدردشة والضحك.')).toBeTruthy();
  });

  it('describes the age pill with its gender', async () => {
    await render(<PeopleRow user={USER} />);

    expect(screen.getByLabelText('female, 24')).toBeTruthy();
  });

  it('omits the age pill when the member does not publish an age', async () => {
    await render(<PeopleRow user={{ ...USER, age: undefined }} />);

    expect(screen.queryByLabelText(/^female/)).toBeNull();
    // The paid rank is independent of age and must survive.
    expect(screen.getByText('VIP2')).toBeTruthy();
  });

  it('omits the meta line when the directory supplies no distance', async () => {
    await render(<PeopleRow user={{ ...USER, distanceKm: undefined }} />);

    expect(screen.queryByText(/km/)).toBeNull();
  });

  it('greets from the dedicated control without opening the profile', async () => {
    const onGreet = jest.fn();
    const onOpenProfile = jest.fn();
    await render(<PeopleRow user={USER} onGreet={onGreet} onOpenProfile={onOpenProfile} />);

    await fireEvent.press(screen.getByLabelText('Say hi to ليان'));

    expect(onGreet).toHaveBeenCalledWith('user-1');
    expect(onOpenProfile).not.toHaveBeenCalled();
  });

  it('opens the profile from the row body without greeting', async () => {
    const onGreet = jest.fn();
    const onOpenProfile = jest.fn();
    await render(<PeopleRow user={USER} onGreet={onGreet} onOpenProfile={onOpenProfile} />);

    await fireEvent.press(screen.getByLabelText(ROW_LABEL));

    expect(onOpenProfile).toHaveBeenCalledWith('user-1');
    expect(onGreet).not.toHaveBeenCalled();
  });
});
