import { useLocalSearchParams, useRouter } from 'expo-router';

import { MembershipHubView } from '@/components/membership/membership-hub';
import { ErrorState, LoadingSkeleton } from '@/components/ui/states';
import { useToast } from '@/components/ui/toast';
import { fixtureDataSource } from '@/core/data/repository';
import type { MembershipFamilyKey, MembershipStoreItem } from '@/core/data/types';
import { useAsync } from '@/hooks/use-async';

const FAMILIES: readonly MembershipFamilyKey[] = ['vip', 'svip'];

/**
 * The membership hub (reference 040 and the tier family behind it).
 *
 * The ladder, the points balance and every store price are server-owned
 * entitlement data — the page only displays them. Purchases, records and the
 * help centre are backend flows, so every press reports to the toast gate
 * instead of pretending to transact or grant a tier.
 */
export default function MembershipHubPage() {
  const toast = useToast();
  const router = useRouter();
  const params = useLocalSearchParams<{ family?: string | string[] }>();

  const param = Array.isArray(params.family) ? (params.family[0] ?? '') : (params.family ?? '');
  const family: MembershipFamilyKey = FAMILIES.includes(param as MembershipFamilyKey)
    ? (param as MembershipFamilyKey)
    : 'svip';

  const state = useAsync(() => fixtureDataSource.getMembershipHub(family), `membership:${family}`);

  const notYet = (what: string) => toast.show(`${what} arrives with the backend phase.`);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/me');
    }
  };

  if (state.status === 'loading') {
    return <LoadingSkeleton />;
  }
  if (state.status === 'error' || !state.data) {
    return <ErrorState onRetry={state.reload} />;
  }

  const onBuy = (item: MembershipStoreItem) =>
    notYet(`Buying ${item.category.toLowerCase()} (${item.price} points)`);

  return (
    <MembershipHubView
      hub={state.data}
      onBack={goBack}
      onFamilyChange={(next) => {
        if (next === family) {
          return;
        }
        router.replace({ pathname: '/membership/[family]', params: { family: next } });
      }}
      onRecharge={() => notYet('Recharge')}
      onBuy={onBuy}
      onHelp={() => notYet('Membership help')}
      onViewMore={() => notYet('The membership store')}
    />
  );
}
