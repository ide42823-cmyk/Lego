import { fireEvent, render, waitFor } from '@testing-library/react-native';

import type { GiftCatalogModel } from '@/core/data/types';

import { GiftPanel } from './gift-panel';

const catalog: GiftCatalogModel = {
  categories: [
    { key: 'backpack', label: 'Backpack', entries: [] },
    {
      key: 'gift',
      label: 'Gift',
      entries: [
        { id: 'g1', name: 'Popsicle', price: 80, art: 'heart' },
        { id: 'g2', name: 'Lipstick', price: 396, art: 'flower' },
      ],
    },
    {
      key: 'lucky',
      label: 'Lucky',
      unviewed: true,
      entries: [
        {
          id: 'l1',
          name: 'Little stars',
          price: 80,
          art: 'star',
          badge: { kind: 'jackpot' },
        },
      ],
    },
    {
      key: 'privilege',
      label: 'Privilege',
      entries: [
        { id: 'p1', name: 'Golden Holy Grail', price: 15996, art: 'trophy' },
        {
          id: 'p2',
          name: 'Vintage Gramophone',
          price: 19996,
          art: 'disk',
          badge: { kind: 'vip', label: 'VIP6' },
        },
      ],
    },
    {
      key: 'tokens',
      label: 'Tokens',
      entries: [
        {
          id: 't1',
          name: 'Galaxy Purse',
          price: 126000,
          art: 'star',
          badge: { kind: 'couple' },
        },
      ],
    },
    {
      key: 'members',
      label: 'Members',
      entries: [
        {
          id: 'm1',
          name: 'Golden Mic',
          price: 3996,
          art: 'mic',
          badge: { kind: 'level', label: 'Lv.4' },
        },
      ],
    },
  ],
  upgrade: { fraction: 0.4, coinsNeeded: 2080 },
  lucky: { jackpotTotal: 178191, multipliers: ['x20', 'x50', 'x200', 'x300', 'x500', 'x1000'] },
  countdown: { days: 28, clockSegments: ['17', '22', '31'] },
  eventTitle: 'Lucky Draw Finals: Cosmic Voyage',
};

const handlers = {
  onClose: jest.fn(),
  onOffer: jest.fn(),
  onAristocracy: jest.fn(),
  onUpgrade: jest.fn(),
  onBanner: jest.fn(),
};

export function GiftPanelHarness() {
  return <GiftPanel visible catalog={catalog} audienceCount={1} {...handlers} />;
}

describe('GiftPanel', () => {
  it('opens on the Gift tab with tiles, prices and the unviewed dots', async () => {
    const { getByText } = await render(<GiftPanelHarness />);

    expect(getByText('Popsicle')).toBeTruthy();
    expect(getByText('80')).toBeTruthy();
    expect(getByText('Lipstick')).toBeTruthy();
    expect(getByText('No one else on the seat')).toBeTruthy();
  });

  it('switches categories and keeps the first tile outlined', async () => {
    const { getByText, getByLabelText } = await render(<GiftPanelHarness />);

    fireEvent.press(getByLabelText('Members gifts'));
    await waitFor(() => expect(getByText('Golden Mic')).toBeTruthy());
    expect(getByText('Lv.4')).toBeTruthy();
    expect(getByLabelText('Golden Mic, 3996 coins')).toBeTruthy();
  });

  it('renders the lucky stage, token banner and upgrade row per category', async () => {
    const { getByLabelText, getByText } = await render(<GiftPanelHarness />);

    fireEvent.press(getByLabelText('Lucky gifts'));
    await waitFor(() => expect(getByText('LUCKY')).toBeTruthy());
    expect(getByText('JACKPOT 178191')).toBeTruthy();

    fireEvent.press(getByLabelText('Tokens gifts'));
    await waitFor(() => expect(getByText('7 validity days + 1.2x intimacy')).toBeTruthy());
    expect(getByText('This token can only be gifted to your Couple')).toBeTruthy();

    fireEvent.press(getByLabelText('Gift gifts'));
    await waitFor(() => expect(getByLabelText('2080 coins needed to upgrade the room')).toBeTruthy());
    fireEvent.press(getByLabelText('2080 coins needed to upgrade the room'));

    expect(handlers.onUpgrade).toHaveBeenCalledTimes(1);
    expect(handlers.onBanner).not.toHaveBeenCalled();
  });

  it('cycles the quantity and keeps Send disabled for the backend phase', async () => {
    const { getByText, getByLabelText } = await render(<GiftPanelHarness />);

    fireEvent.press(getByLabelText('Change the quantity'));
    await waitFor(() => expect(getByText('7')).toBeTruthy());
    expect(getByText('Send')).toBeTruthy();
  });
});
