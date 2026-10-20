import type { MembershipSummary } from './data/types';
import { membershipTiles } from './memberships';

const membership = (
  id: MembershipSummary['id'],
  label: string,
  status: MembershipSummary['status'],
): MembershipSummary => ({ id, label, status, detail: 'fixture' });

describe('membershipTiles', () => {
  it('pairs VIP and SVIP into one tile and keeps Aristocracy separate', () => {
    const tiles = membershipTiles([
      membership('vip', 'VIP', 'active'),
      membership('svip', 'SVIP', 'available'),
      membership('aristocracy', 'Aristocracy', 'available'),
    ]);

    expect(tiles.map((tile) => tile.label)).toEqual(['VIP/SVIP', 'Aristocracy']);
    expect(tiles.map((tile) => tile.key)).toEqual(['vip', 'aristocracy']);
  });

  it('calls the tile Join while any tier in it is still available', () => {
    const [vip] = membershipTiles([
      membership('vip', 'VIP', 'active'),
      membership('svip', 'SVIP', 'available'),
    ]);

    expect(vip.action).toBe('Join');
    expect(vip.active).toBe(false);
  });

  it('calls the tile Active only when every tier in it is active', () => {
    const [vip] = membershipTiles([
      membership('vip', 'VIP', 'active'),
      membership('svip', 'SVIP', 'active'),
    ]);

    expect(vip.action).toBe('Active');
    expect(vip.active).toBe(true);
  });

  it('calls the tile Renew when a tier is expiring', () => {
    const [vip] = membershipTiles([
      membership('vip', 'VIP', 'active'),
      membership('svip', 'SVIP', 'expiring'),
    ]);

    expect(vip.action).toBe('Renew');
  });

  it('drops a tile the server did not send', () => {
    const tiles = membershipTiles([membership('aristocracy', 'Aristocracy', 'available')]);

    expect(tiles).toHaveLength(1);
    expect(tiles[0].key).toBe('aristocracy');
  });
});
