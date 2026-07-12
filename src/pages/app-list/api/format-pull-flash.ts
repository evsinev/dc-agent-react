export type PullFlash = {
  type: 'success' | 'info';
  content: string;
};

/**
 * Builds the "Pull from Git" success/info flashbar copy from the commit diff.
 * The backend `/git/pull` returns only `{ success }`, so the commit count is
 * derived by comparing `/git/log` before and after the pull.
 */
export function formatPullFlash(params: { branch: string; newCount: number; latestMessage?: string }): PullFlash {
  const { branch, newCount, latestMessage } = params;

  if (newCount <= 0) {
    return { type: 'info', content: `Already up to date with ${branch}.` };
  }

  const commits = `${newCount} new commit${newCount === 1 ? '' : 's'}`;
  const latest = latestMessage ? ` Latest: ${latestMessage}` : '';
  return { type: 'success', content: `Pulled ${commits} from ${branch}.${latest}` };
}
