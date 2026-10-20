import { useCallback } from 'react';

import { useToast } from '@/components/ui/toast';
import { fixtureDataSource } from '@/core/data/repository';

/**
 * Sends a greeting and reports the outcome the request actually confirmed.
 *
 * A greeting is a server fact, so the toast reports the response rather than the
 * tap: the client never declares that a greeting landed on its own. Shared by
 * every surface that shows a "Hi" control, so the behaviour and the failure copy
 * cannot drift apart between the discovery rows and the profile.
 */
export function useGreet(): (userId: string, displayName?: string) => void {
  const toast = useToast();

  return useCallback(
    (userId: string, displayName?: string) => {
      // Display names may already end in punctuation ("Maya K."), so trailing
      // full stops are dropped before the confirmation's own period.
      const name = displayName?.replace(/[.!?]+$/, '');
      fixtureDataSource.sendGreeting(userId).then(
        () => toast.show(name ? `Greeted ${name}.` : 'Greeting sent.'),
        () => toast.show('Could not send your greeting. Try again.'),
      );
    },
    [toast],
  );
}
