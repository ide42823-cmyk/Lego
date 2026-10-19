import { fireEvent, render, screen } from '@testing-library/react-native';

import type { UserProfile } from '@/core/data/types';

import { ProfileRelationshipsTab } from './profile-relationships-tab';

function profile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    id: 'user-1',
    displayName: 'ليان',
    status: 'هنا للدردشة والضحك.',
    lastActiveAt: new Date().toISOString(),
    badges: [],
    isOnline: true,
    signature: '',
    tags: [],
    info: [],
    honor: [],
    moments: [],
    momentCount: 0,
    friends: [],
    following: false,
    mutual: false,
    ...overrides,
  };
}

describe('ProfileRelationshipsTab', () => {
  it('shows a real empty state when there is no relationship at all', async () => {
    await render(
      <ProfileRelationshipsTab profile={profile()} onOpenRecord={jest.fn()} onInvite={jest.fn()} />,
    );

    expect(screen.getByText('No relationships yet')).toBeTruthy();
  });

  it('offers the invitation from the empty state', async () => {
    const onInvite = jest.fn();
    await render(
      <ProfileRelationshipsTab profile={profile()} onOpenRecord={jest.fn()} onInvite={onInvite} />,
    );

    fireEvent.press(screen.getByText('Invite'));

    expect(onInvite).toHaveBeenCalled();
  });

  it('announces the couple with its level and duration', async () => {
    const onOpenRecord = jest.fn();
    await render(
      <ProfileRelationshipsTab
        profile={profile({
          couple: {
            id: 'couple-1',
            kind: 'couple',
            peerId: 'user-9',
            peerName: 'MOHAMMED',
            level: 34,
            days: 103,
          },
        })}
        onOpenRecord={onOpenRecord}
        onInvite={jest.fn()}
      />,
    );

    expect(screen.getByLabelText('Couple level 34 with MOHAMMED, 103 days')).toBeTruthy();
  });

  it('lists friends and keeps the invite tile alongside them', async () => {
    await render(
      <ProfileRelationshipsTab
        profile={profile({
          friends: [
            {
              id: 'friend-1',
              kind: 'friend',
              peerId: 'user-4',
              peerName: 'Mira',
              level: 27,
              days: 133,
            },
          ],
        })}
        onOpenRecord={jest.fn()}
        onInvite={jest.fn()}
      />,
    );

    expect(screen.getByLabelText('Friend level 27 with Mira, 133 days')).toBeTruthy();
    expect(screen.getByText('Invite')).toBeTruthy();
    expect(screen.queryByText('No relationships yet')).toBeNull();
  });
});
