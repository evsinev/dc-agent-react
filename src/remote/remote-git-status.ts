import { remoteSend } from '@/remote/remote-send';

export type GitLogItem = {
  dateFormatted: string;
  shortMessage: string;
  fullMessage: string;
  author: string;
  commiter: string;
  ageFormatted: string;
};

export type GitStatusResponse = {
  currentBranch: string;
  lastCommit: GitLogItem;
};

export async function remoteGitStatus(): Promise<GitStatusResponse> {
  return remoteSend({ path: '/git/status' });
}
