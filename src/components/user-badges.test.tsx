import { render, screen } from '@testing-library/react-native';

import { UserBadges } from './user-badges';

/**
 * The level crest renders the bare number, so it is asserted through its
 * accessible label rather than through text: `Level 12` is what a screen reader
 * announces, and it is stable if the crest's typography changes.
 */
describe('UserBadges', () => {
  it('renders the level alongside a rank badge', async () => {
    await render(<UserBadges badges={['level', 'vip']} level={12} />);

    expect(screen.getByLabelText('Level 12')).toBeTruthy();
    expect(screen.getByText('VIP')).toBeTruthy();
  });

  it('numbers a paid rank when the tier is known', async () => {
    await render(<UserBadges badges={['vip']} vipTier={2} />);

    expect(screen.getByText('VIP2')).toBeTruthy();
  });

  it('omits the level badge rather than rendering a crest stamped "0"', async () => {
    await render(<UserBadges badges={['level', 'vip']} level={0} />);

    expect(screen.queryByLabelText(/^Level/)).toBeNull();
    // The badges that are genuinely known still render.
    expect(screen.getByText('VIP')).toBeTruthy();
  });

  it('omits the level badge when no level is supplied at all', async () => {
    await render(<UserBadges badges={['level']} />);

    expect(screen.queryByLabelText(/^Level/)).toBeNull();
  });

  it('holds back paid ranks in the status variant', async () => {
    await render(<UserBadges badges={['level', 'vip']} level={12} variant="status" />);

    // The caller places the rank itself, beside the age pill.
    expect(screen.queryByText('VIP')).toBeNull();
    expect(screen.getByLabelText('Level 12')).toBeTruthy();
  });

  it('renders nothing when there are no badges', async () => {
    const { toJSON } = await render(<UserBadges badges={[]} level={5} />);

    expect(toJSON()).toBeNull();
  });
});
