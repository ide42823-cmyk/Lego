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

  it('shows the locale and a bucketed distance, never a precise location', async () => {
    await render(<PeopleRow user={USER} />);

    expect(screen.getByText('SA · 6 km')).toBeTruthy();
  });

  it('omits the meta line when the directory supplies neither locale nor distance', async () => {
    await render(<PeopleRow user={{ ...USER, locale: undefined, distanceKm: undefined }} />);

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
