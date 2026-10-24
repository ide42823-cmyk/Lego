import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { DiamondsWalletView } from '@/components/wallet/diamonds-wallet';
import { ErrorState, LoadingSkeleton } from '@/components/ui/states';
import { useToast } from '@/components/ui/toast';
import { fixtureDataSource } from '@/core/data/repository';
import { useAsync } from '@/hooks/use-async';

/**
 * My Diamonds — the wallet exchange page (reference 057).
 *
 * The balance and every exchange rate come from the data seam. Nothing here
 * can spend coins, credit diamonds or open a record: the exchange service,
 * the balance mutations and the record are server-owned surfaces, and every
 * press reports to the toast gate instead of pretending to transact.
 */
export default function DiamondsWalletPage() {
  const toast = useToast();
  const router = useRouter();

  const state = useAsync(() => fixtureDataSource.getDiamondsWallet(), 'diamonds-wallet');

  const notYet = (what: string) => toast.show(`${what} arrives with the backend phase.`);

  if (state.status === 'loading') {
    return <LoadingSkeleton />;
  }
  if (state.status === 'error' || !state.data) {
    return <ErrorState onRetry={state.reload} />;
  }

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/me');
    }
  };

  const onExchange = () => notYet('Exchanging coins into diamonds');

  return (
    <>
      <StatusBar style="light" />
      <DiamondsWalletView
        wallet={state.data}
        onBack={goBack}
        onRecord={() => notYet('The Diamonds record')}
        onExchange={onExchange}
      />
    </>
  );
}
