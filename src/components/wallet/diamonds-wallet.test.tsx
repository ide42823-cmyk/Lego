import { fireEvent, render } from '@testing-library/react-native';

import { DiamondsWalletView } from './diamonds-wallet';

import type { DiamondsWallet } from '@/core/data/types';

const wallet: DiamondsWallet = {
  balance: 0,
  tiers: [
    { id: 'tier-6400', coins: 6400, diamonds: 20000 },
    { id: 'tier-1280000', coins: 1280000, diamonds: 4000000 },
  ],
};

const handlers = {
  onBack: jest.fn(),
  onRecord: jest.fn(),
  onExchange: jest.fn(),
};

describe('DiamondsWalletView', () => {
  beforeEach(() => {
    handlers.onBack.mockClear();
    handlers.onRecord.mockClear();
    handlers.onExchange.mockClear();
  });

  it('shows the server-owned balance and both ends of the ladder', async () => {
    const view = await render(<DiamondsWalletView wallet={wallet} {...handlers} />);

    expect(view.queryByText('My Diamonds')).toBeTruthy();
    expect(view.queryByText('Diamonds Balance')).toBeTruthy();
    expect(view.queryByText('0')).toBeTruthy();
    expect(view.queryByText('Exchange')).toBeTruthy();
    expect(view.queryByText('6400 coins')).toBeTruthy();
    expect(view.queryByText('1280000 coins')).toBeTruthy();
    expect(view.queryByText('20000')).toBeTruthy();
    expect(view.queryByText('4000000')).toBeTruthy();
  });

  it('routes the record shortcut, a tier and back through the handlers', async () => {
    const view = await render(<DiamondsWalletView wallet={wallet} {...handlers} />);

    // The record shortcut appears twice: the header link and the sheet glyph.
    await fireEvent.press(view.getByLabelText('Diamonds record'));
    expect(handlers.onRecord).toHaveBeenCalledTimes(1);
    await fireEvent.press(view.getByLabelText('Open the Diamonds record'));
    expect(handlers.onRecord).toHaveBeenCalledTimes(2);

    await fireEvent.press(view.getByLabelText(/Exchange 6400 coins/));
    expect(handlers.onExchange).toHaveBeenCalledWith(wallet.tiers[0]);

    await fireEvent.press(view.getByLabelText('Back'));
    expect(handlers.onBack).toHaveBeenCalledTimes(1);
  });
});
