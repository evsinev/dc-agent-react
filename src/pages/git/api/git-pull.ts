import { clientPost } from '@/libs/client-post';
import useSWRMutation from 'swr/mutation';

export type GitPullResponse = {
  success: boolean;
};

export function useGitPull() {
  return useSWRMutation('/git/pull', (url) => clientPost<GitPullResponse>({ url, params: {} }));
}
