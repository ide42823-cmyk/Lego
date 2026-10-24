import { fireEvent, render } from '@testing-library/react-native';

import { RelationshipTypeSheet } from './relationship-type-sheet';

import type { RelationshipOffer } from '@/core/data/types';

const offers: RelationshipOffer[] = [
  { id: 'couple', label: 'Couple', coins: 10000, validityHours: 24 },
  { id: 'friend', label: 'Friend', coins: 6000, validityHours: 24 },
];

const pair = {
  viewer: { displayName: 'Hana', avatarUrl: 'https://example.com/hana.png' },
  person: { displayName: 'Omar', avatarUrl: 'https://example.com/omar.png' },
};

const handlers = {
  onSelect: jest.fn(),
  onInvite: jest.fn(),
  onHelp: jest.fn(),
  onClose: jest.fn(),
};

describe('RelationshipTypeSheet', () => {
  beforeEach(() => {
    handlers.onSelect.mockClear();
    handlers.onInvite.mockClear();
    handlers.onHelp.mockClear();
    handlers.onClose.mockClear();
  });

  it('lays out the header, both pills and the Friend card by default', async () => {
    const view = await render(
      <RelationshipTypeSheet
        visible
        {...pair}
        offers={offers}
        selected="friend"
        {...handlers}
      />,
    );

    expect(view.queryByText('Choose Relationship Type')).toBeTruthy();
    expect(view.queryByText('Couple')).toBeTruthy();
    expect(view.queryByText('Friend')).toBeTruthy();
    expect(view.queryAllByText('Friend Invitation Card')).toHaveLength(1);
    expect(view.queryByText('6000')).toBeTruthy();
    expect(view.queryByText('Omar')).toBeTruthy();
    expect(view.queryByText('Hana')).toBeTruthy();
    // The script behind the CTA reports out; the copy is client-side.
    expect(view.queryByText('Invite to Form a Relationship')).toBeTruthy();
  });

  it('renders the Couple card and reports the selected offer out', async () => {
    const view = await render(
      <RelationshipTypeSheet
        visible
        {...pair}
        offers={offers}
        selected="couple"
        {...handlers}
      />,
    );
    expect(view.queryByText('Couple Invitation Card')).toBeTruthy();
    expect(view.queryByText('10000')).toBeTruthy();
    expect(view.queryByText('6000')).toBeNull();

    await fireEvent.press(view.getByLabelText('Friend'));
    expect(handlers.onSelect).toHaveBeenCalledWith('friend');

    await fireEvent.press(view.getByLabelText('Invite to Form a Relationship'));
    expect(handlers.onInvite.mock.calls[0]?.[0]).toMatchObject({ id: 'couple', coins: 10000 });
  });

  it('closes from the scrim and the header, routes help, and hides when closed', async () => {
    const view = await render(
      <RelationshipTypeSheet
        visible
        {...pair}
        offers={offers}
        selected="friend"
        {...handlers}
      />,
    );

    await fireEvent.press(view.getByLabelText('Close'));
    expect(handlers.onClose).toHaveBeenCalledTimes(1);

    await fireEvent.press(view.getByLabelText('Help'));
    expect(handlers.onHelp).toHaveBeenCalledTimes(1);

    await fireEvent.press(view.getByLabelText('Back'));
    expect(handlers.onClose).toHaveBeenCalledTimes(2);

    const hidden = await render(
      <RelationshipTypeSheet
        visible={false}
        {...pair}
        offers={offers}
        selected="friend"
        {...handlers}
      />,
    );
    expect(hidden.queryByText('Choose Relationship Type')).toBeNull();
  });
});
