import { fireEvent, render } from '@testing-library/react-native';

import { AristocracyHubView } from './aristocracy-hub';

import type { AristocracyHub } from '@/core/data/types';

const hub: AristocracyHub = {
  currentRank: null,
  ranks: [
    { key: 'knight', label: 'Knight', priceCoins: 7840, validityDays: 7, unlockedCount: 7 },
    { key: 'viscount', label: 'Viscount', priceCoins: 22400, validityDays: 7, unlockedCount: 10 },
    { key: 'count', label: 'Count', priceCoins: 39200, validityDays: 7, unlockedCount: 13 },
    { key: 'marquis', label: 'Marquis', priceCoins: 61600, validityDays: 7, unlockedCount: 16 },
    { key: 'duke', label: 'Duke', priceCoins: 84000, validityDays: 7, unlockedCount: 20 },
  ],
  privileges: [
    { id: 'p-label', label: 'Exclusive Label', glyph: 'label', unlockRank: 'knight' },
    { id: 'p-badge', label: 'Aristocrat Badge', glyph: 'badge', unlockRank: 'knight' },
    { id: 'p-frame', label: 'Aristocrat Frame', glyph: 'frame', unlockRank: 'knight' },
    { id: 'p-entry', label: 'Entry Effect', glyph: 'entry', unlockRank: 'knight' },
    { id: 'p-vehicle', label: 'Aristocrat Vehicle', glyph: 'vehicle', unlockRank: 'knight' },
    { id: 'p-lock', label: 'Room Lock', glyph: 'room-lock', unlockRank: 'knight' },
    { id: 'p-filter', label: 'Advanced Filter', glyph: 'filter', unlockRank: 'knight' },
    { id: 'p-card', label: 'Aristocrat Name Card', glyph: 'name-card', unlockRank: 'viscount' },
    { id: 'p-gifts', label: 'Exclusive Gifts', glyph: 'gifts', unlockRank: 'viscount' },
    { id: 'p-priority', label: 'Priority Entry', glyph: 'priority', unlockRank: 'viscount' },
    { id: 'p-nameplate', label: 'Ranked Nameplate', glyph: 'name-card', unlockRank: 'count' },
  ],
};

const handlers = {
  onBack: jest.fn(),
  onHelp: jest.fn(),
  onActivate: jest.fn(),
};

describe('AristocracyHubView', () => {
  beforeEach(() => {
    Object.values(handlers).forEach((handler) => handler.mockClear());
  });

  it('opens on the entry rung with its price, count and unlocked tiles', async () => {
    const view = await render(<AristocracyHubView hub={hub} {...handlers} />);

    expect(view.getByText('Aristocracy')).toBeTruthy();
    // The rung name appears twice: once in the tab row, once under the emblem.
    expect(view.getAllByText('Knight')).toHaveLength(2);
    expect(view.getByText('Exclusive Privileges 7/11')).toBeTruthy();
    expect(view.getByText('7840 Coins/7 days')).toBeTruthy();
    expect(view.getByLabelText('Activate Knight')).toBeTruthy();

    // The seven Knight tiles are live; the Viscount and Count ones are not.
    expect(view.getByLabelText('Exclusive Label')).toBeTruthy();
    expect(view.getByLabelText('Advanced Filter')).toBeTruthy();
    expect(view.getByLabelText('Aristocrat Name Card. Unlocks at Viscount')).toBeTruthy();
    expect(view.getByLabelText('Ranked Nameplate. Unlocks at Count')).toBeTruthy();
  });

  it('switches rung from the tabs and re-reads the catalogue', async () => {
    const view = await render(<AristocracyHubView hub={hub} {...handlers} />);

    await fireEvent.press(view.getByLabelText('Rank Viscount'));

    expect(view.getByText('Exclusive Privileges 10/11')).toBeTruthy();
    expect(view.getByText('22400 Coins/7 days')).toBeTruthy();
    expect(view.getByLabelText('Aristocrat Name Card')).toBeTruthy();
    expect(view.getByLabelText('Exclusive Gifts')).toBeTruthy();
    expect(view.getByLabelText('Ranked Nameplate. Unlocks at Count')).toBeTruthy();
  });

  it('reports activation and help instead of granting anything', async () => {
    const view = await render(<AristocracyHubView hub={hub} {...handlers} />);

    await fireEvent.press(view.getByLabelText('Activate Knight'));
    expect(handlers.onActivate).toHaveBeenCalledWith(hub.ranks[0]);

    await fireEvent.press(view.getByLabelText('Aristocracy help'));
    expect(handlers.onHelp).toHaveBeenCalledTimes(1);

    await fireEvent.press(view.getByLabelText('Back'));
    expect(handlers.onBack).toHaveBeenCalledTimes(1);
  });

  it('marks the held rung instead of offering it again', async () => {
    const view = await render(
      <AristocracyHubView hub={{ ...hub, currentRank: 'knight' }} {...handlers} />,
    );

    const active = view.getByLabelText('Knight is active');
    expect(active).toBeTruthy();

    await fireEvent.press(active);
    expect(handlers.onActivate).not.toHaveBeenCalled();
  });
});
