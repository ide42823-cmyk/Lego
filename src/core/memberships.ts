import type { MembershipSummary } from './data/types';

/** The two join tiles under the wallet row. */
export interface MembershipTile {
  key: 'vip' | 'aristocracy';
  /** e.g. "VIP/SVIP" — the labels of the memberships the tile stands for. */
  label: string;
  /**
   * Presentation copy for the second line. Whether the account actually holds
   * the tier is still an entitlement the server decides; this only mirrors what
   * the dashboard was told.
   */
  action: 'Join' | 'Renew' | 'Active';
  /** Every membership behind this tile is active. */
  active: boolean;
}

/**
 * Groups the dashboard's memberships into the reference's two tiles.
 *
 * VIP and SVIP share one tile (they are the same ladder), Aristocracy has its
 * own. A tier the server did not send is simply not drawn, so a future "SVIP
 * only" account still renders correctly.
 */
export function membershipTiles(memberships: MembershipSummary[]): MembershipTile[] {
  const groups: { key: MembershipTile['key']; ids: MembershipSummary['id'][] }[] = [
    { key: 'vip', ids: ['vip', 'svip'] },
    { key: 'aristocracy', ids: ['aristocracy'] },
  ];

  return groups.flatMap(({ key, ids }) => {
    const held = memberships.filter((membership) => ids.includes(membership.id));
    if (held.length === 0) {
      return [];
    }

    const active = held.every((membership) => membership.status === 'active');
    const expiring = held.some((membership) => membership.status === 'expiring');

    return [
      {
        key,
        label: held.map((membership) => membership.label).join('/'),
        action: active ? 'Active' : expiring ? 'Renew' : 'Join',
        active,
      },
    ];
  });
}
