import type {
  MembershipFamilyKey,
  MembershipHub,
  MembershipStoreItem,
} from '@/core/data/types';

import { MembershipSvipHubView } from './membership-svip-hub';
import { MembershipVipHubView } from './membership-vip-hub';

export interface MembershipHubViewProps {
  /** The served family hub; `family` discriminates which design paints it. */
  hub: MembershipHub;
  onBack: () => void;
  onFamilyChange: (family: MembershipFamilyKey) => void;
  /** The VIP hero's Recharge entry; the page owns the purchase gate. */
  onRecharge: () => void;
  /** A store item press; the page owns the purchase gate. */
  onBuy: (item: MembershipStoreItem) => void;
  /** Help and View More are backend surfaces. */
  onHelp: () => void;
  onViewMore: () => void;
}

/**
 * The membership hub entry point. The two families carry different reference
 * designs — VIP paints the hero/ladder/benefit-matrix page, SVIP the crest-band
 * page — so the served hub's `family` picks the view. Both are pure
 * presentation: every entitlement, price, points value and purchase is
 * server-owned, and each press reports to the page's gate.
 */
export function MembershipHubView({
  hub,
  onBack,
  onFamilyChange,
  onRecharge,
  onBuy,
  onHelp,
  onViewMore,
}: MembershipHubViewProps) {
  if (hub.family === 'vip') {
    return (
      <MembershipVipHubView
        hub={hub}
        onBack={onBack}
        onFamilyChange={onFamilyChange}
        onRecharge={onRecharge}
        onBuy={onBuy}
        onHelp={onHelp}
        onViewMore={onViewMore}
      />
    );
  }

  return (
    <MembershipSvipHubView
      hub={hub}
      onBack={onBack}
      onFamilyChange={onFamilyChange}
      onBuy={onBuy}
      onHelp={onHelp}
      onViewMore={onViewMore}
    />
  );
}
