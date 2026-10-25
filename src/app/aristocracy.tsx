import { useRouter } from 'expo-router';

import { AristocracyHubView } from '@/components/aristocracy/aristocracy-hub';
import { ErrorState, LoadingSkeleton } from '@/components/ui/states';
import { useToast } from '@/components/ui/toast';
import { fixtureDataSource } from '@/core/data/repository';
import type { AristocracyRank } from '@/core/data/types';
import { useAsync } from '@/hooks/use-async';

/**
 * The aristocracy page (references 038/039).
 *
 * The ladder, the catalogue's unlock rungs, the coin prices and the held rank
 * are server-owned entitlement data — the page only displays them. Activation
 * spends coins and the help sheet is a backend surface, so both report to the
 * toast gate instead of pretending to grant a title.
 */
export default function AristocracyPage() {
  const toast = useToast();
  const router = useRouter();

  const state = useAsync(() => fixtureDataSource.getAristocracyHub(), 'aristocracy');

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

  const onActivate = (rank: AristocracyRank) =>
    notYet(`Activating ${rank.label} (${rank.priceCoins} coins)`);

  return (
    <AristocracyHubView
      hub={state.data}
      onBack={goBack}
      onHelp={() => notYet('Aristocracy help')}
      onActivate={onActivate}
    />
  );
}
