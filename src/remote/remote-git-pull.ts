import { remoteSend } from '@/remote/remote-send';

export type GitPullResponse = {
  success: boolean;
};

export async function remoteGitPull(request = {}): Promise<GitPullResponse> {
  return remoteSend({ path: '/git/pull', request });
}
