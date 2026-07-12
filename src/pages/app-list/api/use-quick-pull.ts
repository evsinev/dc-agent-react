import { useGitLog } from '@/pages/git/api/git-log';
import { useGitPull } from '@/pages/git/api/git-pull';
import type { FlashbarProps } from '@cloudscape-design/components';
import { useEffect, useRef, useState } from 'react';
import { useSWRConfig } from 'swr';
import { formatPullFlash } from './format-pull-flash';

let flashSeq = 0;

// Success/info confirmations self-dismiss; error flashes stay so the user can retry.
const AUTO_DISMISS_MS = 3000;

type NewFlash = Omit<FlashbarProps.MessageDefinition, 'id' | 'dismissible' | 'onDismiss'>;

/**
 * Orchestrates the App list "Pull from Git" shortcut: it reuses the Git page's
 * `useGitLog`/`useGitPull` hooks, computes the pulled-commit summary from the
 * before/after log, surfaces a flashbar, and revalidates the app list + statuses
 * so drift indicators recompute after a pull.
 */
export function useQuickPull() {
  const { data, mutate: mutateGitLog } = useGitLog();
  const { trigger, isMutating } = useGitPull();
  const { mutate } = useSWRConfig();
  const [flashItems, setFlashItems] = useState<FlashbarProps.MessageDefinition[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Clear any pending auto-dismiss timers when the page unmounts.
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const branch = data?.currentBranch ?? '';
  const updatedLabel = data?.lastCommit?.ageFormatted ?? 'unknown';

  function dismiss(id: string): void {
    setFlashItems((items) => items.filter((item) => item.id !== id));
  }

  function pushFlash(flash: NewFlash, autoDismiss = false): void {
    const id = `pull-${flashSeq++}`;
    setFlashItems((items) => [...items, { ...flash, id, dismissible: true, onDismiss: () => dismiss(id) }]);
    if (autoDismiss) {
      timers.current.push(setTimeout(() => dismiss(id), AUTO_DISMISS_MS));
    }
  }

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
      pushFlash({ ...flash, statusIconAriaLabel: flash.type }, true);
      await revalidateApps();
    } catch (error) {
      pushFlash({
        type: 'error',
        header: 'Pull failed',
        content: error instanceof Error ? error.message : 'Git pull failed',
        statusIconAriaLabel: 'error',
        buttonText: 'Retry',
        onButtonClick: () => pull(),
      });
    }
  }

  async function refresh(): Promise<void> {
    await revalidateApps();
  }

  return { branch, updatedLabel, isPulling: isMutating, flashItems, pull, refresh, dismiss };
}
