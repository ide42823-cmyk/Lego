import { render, screen } from '@testing-library/react-native';

import { UserBadges } from './user-badges';

describe('UserBadges', () => {
  it('renders the level alongside a rank badge', async () => {
    await render(<UserBadges badges={['level', 'vip']} level={12} />);

    expect(screen.getByText('Lv 12')).toBeTruthy();
    expect(screen.getByText('VIP')).toBeTruthy();
  });

  it('omits the level badge rather than rendering "Lv 0"', async () => {
    await render(<UserBadges badges={['level', 'vip']} level={0} />);

    expect(screen.queryByText(/Lv/)).toBeNull();
    // The badges that are genuinely known still render.
    expect(screen.getByText('VIP')).toBeTruthy();
  });

  it('omits the level badge when no level is supplied at all', async () => {
    await render(<UserBadges badges={['level']} />);

    expect(screen.queryByText(/Lv/)).toBeNull();
  });

  it('renders nothing when there are no badges', async () => {
    const { toJSON } = await render(<UserBadges badges={[]} level={5} />);

    expect(toJSON()).toBeNull();
  });
});
