import { remoteSend } from '@/remote/remote-send';

export type GitPullRequest = {};

export type GitPullResponse = {
  success: boolean;
};

export async function remoteGitPull(request : GitPullRequest): Promise<GitPullResponse> {
  return remoteSend({ path: '/git/pull', request});
}
