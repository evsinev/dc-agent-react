import { errorMessage } from '@/components/error/components/load-error';
import { useNotifications } from '@/hooks/use-notifications';
import { useGitLog } from '@/pages/git/api/git-log';
import { useGitPull } from '@/pages/git/api/git-pull';
import { useSWRConfig } from 'swr';
import { formatPullFlash } from './format-pull-flash';

// Success/info confirmations self-dismiss; the error notification stays so the user can retry.
const AUTO_DISMISS_MS = 3000;
// Stable id so a repeat pull replaces its previous notification instead of stacking.
const NOTIFICATION_ID = 'quick-pull';

/**
 * Orchestrates the Applications "Pull from Git" shortcut: it reuses the Git page's
 * `useGitLog`/`useGitPull` hooks, computes the pulled-commit summary from the before/after
 * log, surfaces the result via the app-wide notifications flashbar, and revalidates the app
 * list + statuses so drift indicators recompute after a pull.
 */
export function useQuickPull() {
  const { data, mutate: mutateGitLog } = useGitLog();
  const { trigger, isMutating } = useGitPull();
  const { mutate } = useSWRConfig();
  const notify = useNotifications((state) => state.add);

  const branch = data?.currentBranch ?? '';
  const updatedLabel = data?.lastCommit?.ageFormatted ?? 'unknown';

  // Revalidate the list and every per-app status (keys start with `/app/status/`).
  function revalidateApps(): Promise<unknown> {
    return Promise.all([
      mutate('/app/list'),
      mutate((key) => typeof key === 'string' && key.startsWith('/app/status/')),
    ]);
  }

  async function pull(): Promise<void> {
    const before = data?.commits.length;
    try {
      await trigger();
      const after = await mutateGitLog();
      const afterCount = after?.commits.length ?? 0;
      const newCount = before === undefined ? 0 : Math.max(0, afterCount - before);
      const flash = formatPullFlash({
        branch: after?.currentBranch ?? branch,
        newCount,
        latestMessage: after?.lastCommit?.shortMessage,
      });
      notify({
        id: NOTIFICATION_ID,
        type: flash.type,
        content: flash.content,
        statusIconAriaLabel: flash.type,
        autoDismissMs: AUTO_DISMISS_MS,
      });
      await revalidateApps();
    } catch (error) {
      notify({
        id: NOTIFICATION_ID,
        type: 'error',
        header: 'Pull failed',
        content: errorMessage(error),
        statusIconAriaLabel: 'error',
        buttonText: 'Retry',
        onButtonClick: () => pull(),
      });
    }
  }

  async function refresh(): Promise<void> {
    await revalidateApps();
  }

  return { branch, updatedLabel, isPulling: isMutating, pull, refresh };
}
