import { fireEvent, render } from '@testing-library/react-native';

import { AristocracyHubView } from './aristocracy-hub';

import type { AristocracyHub } from '@/core/data/types';

const hub: AristocracyHub = {
  currentRank: null,
  ranks: [
    { key: 'knight', label: 'Knight', priceCoins: 7840, validityDays: 7, unlockedCount: 7 },
    { key: 'viscount', label: 'Viscount', priceCoins: 22400, validityDays: 7, unlockedCount: 10 },
    { key: 'count', label: 'Count', priceCoins: 84000, validityDays: 7, unlockedCount: 11 },
    { key: 'marquis', label: 'Marquis', priceCoins: 280000, validityDays: 7, unlockedCount: 14 },
    { key: 'duke', label: 'Duke', priceCoins: 700000, validityDays: 7, unlockedCount: 16 },
    { key: 'king', label: 'King', priceCoins: 1820000, validityDays: 7, unlockedCount: 20 },
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
    { id: 'p-incognito', label: 'Incognito Access', glyph: 'incognito', unlockRank: 'viscount' },
    { id: 'p-invisible', label: 'Online Invisibility', glyph: 'invisible', unlockRank: 'count' },
    { id: 'p-bubble', label: 'Room Bubble', glyph: 'bubble', unlockRank: 'marquis' },
    { id: 'p-full-room', label: 'Full-room Access', glyph: 'full-room', unlockRank: 'marquis' },
    { id: 'p-distance', label: 'Hide Distance', glyph: 'distance', unlockRank: 'marquis' },
    { id: 'p-stealth', label: 'Stealth Mode', glyph: 'stealth', unlockRank: 'duke' },
    { id: 'p-invisible-entry', label: 'Invisible Entry', glyph: 'invisible-entry', unlockRank: 'duke' },
    { id: 'p-golden-name', label: 'Golden Name', glyph: 'golden-name', unlockRank: 'king' },
    { id: 'p-nickname', label: 'Animated Nickname', glyph: 'nickname', unlockRank: 'king' },
    { id: 'p-anti-ban', label: 'Anti-banning', glyph: 'anti-ban', unlockRank: 'king' },
    { id: 'p-kick', label: 'Kick Protection', glyph: 'kick-protection', unlockRank: 'king' },
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
    expect(view.getByText('Exclusive Privileges 7/20')).toBeTruthy();
    expect(view.getByText('7840 Coins/7 days')).toBeTruthy();
    expect(view.getByLabelText('Activate Knight')).toBeTruthy();

    // Six rungs: the tab row scrolls to King.
    for (const rank of hub.ranks) {
      expect(view.getByLabelText(`Rank ${rank.label}`)).toBeTruthy();
    }

    // The seven Knight tiles are live; everything above is dimmed.
    expect(view.getByLabelText('Exclusive Label')).toBeTruthy();
    expect(view.getByLabelText('Advanced Filter')).toBeTruthy();
    expect(view.getByLabelText('Aristocrat Name Card. Unlocks at Viscount')).toBeTruthy();
    expect(view.getByLabelText('Golden Name. Unlocks at King')).toBeTruthy();
  });

  it('switches rung from the tabs and re-reads the catalogue', async () => {
    const view = await render(<AristocracyHubView hub={hub} {...handlers} />);

    await fireEvent.press(view.getByLabelText('Rank Viscount'));

    expect(view.getByText('Exclusive Privileges 10/20')).toBeTruthy();
    expect(view.getByText('22400 Coins/7 days')).toBeTruthy();
    expect(view.getByLabelText('Aristocrat Name Card')).toBeTruthy();
    expect(view.getByLabelText('Exclusive Gifts')).toBeTruthy();
    // Viscount lights Incognito Access only; Count keeps Online Invisibility.
    expect(view.getByLabelText('Incognito Access')).toBeTruthy();
    expect(view.getByLabelText('Online Invisibility. Unlocks at Count')).toBeTruthy();

    await fireEvent.press(view.getByLabelText('Rank King'));

    expect(view.getByText('Exclusive Privileges 20/20')).toBeTruthy();
    expect(view.getByText('1820000 Coins/7 days')).toBeTruthy();
    expect(view.getByLabelText('Golden Name')).toBeTruthy();
    expect(view.getByLabelText('Kick Protection')).toBeTruthy();
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
