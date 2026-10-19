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
  it('keeps both cards when the member has no relationship at all', async () => {
    await render(
      <ProfileRelationshipsTab profile={profile()} onOpenRecord={jest.fn()} onInvite={jest.fn()} />,
    );

    // The invitation is the empty state: the couple card keeps a slot for it and
    // the friend row keeps its trailing tile.
    expect(screen.getByLabelText("Invite a member to be ليان's couple")).toBeTruthy();
    expect(screen.getByLabelText('Invite a member to a relationship')).toBeTruthy();
    expect(screen.queryByText('No relationships yet')).toBeNull();
  });

  it('invites from the couple card', async () => {
    const onInvite = jest.fn();
    await render(
      <ProfileRelationshipsTab profile={profile()} onOpenRecord={jest.fn()} onInvite={onInvite} />,
    );

    fireEvent.press(screen.getByLabelText("Invite a member to be ليان's couple"));

    expect(onInvite).toHaveBeenCalledTimes(1);
  });

  it('invites from the trailing tile in the friend row', async () => {
    const onInvite = jest.fn();
    await render(
      <ProfileRelationshipsTab profile={profile()} onOpenRecord={jest.fn()} onInvite={onInvite} />,
    );

    fireEvent.press(screen.getByLabelText('Invite a member to a relationship'));

    expect(onInvite).toHaveBeenCalledTimes(1);
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

    const couple = screen.getByLabelText('Couple level 34 with MOHAMMED, 103 days');
    expect(couple).toBeTruthy();

    // With a couple present the invitation slot is the peer's, not an invite.
    expect(screen.queryByLabelText("Invite a member to be ليان's couple")).toBeNull();
    expect(screen.getByText('Lv.34 · 103 days')).toBeTruthy();

    fireEvent.press(couple);
    expect(onOpenRecord).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'couple-1', peerName: 'MOHAMMED' }),
    );
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
    expect(screen.getByLabelText('Invite a member to a relationship')).toBeTruthy();
    expect(screen.queryByText('No relationships yet')).toBeNull();
  });
});
