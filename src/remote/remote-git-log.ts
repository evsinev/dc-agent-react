import { remoteSend } from '@/remote/remote-send';
import { GitLogItem } from '@/remote/remote-git-status';

export type GitLogResponse = {
  currentBranch: string;
  lastCommit: GitLogItem;
  commits: GitLogItem[];
};

export async function remoteGitLog(): Promise<GitLogResponse> {
  return remoteSend({ path: '/git/log' });
}
