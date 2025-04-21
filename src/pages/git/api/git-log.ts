import { clientPost } from '@/libs/client-post';
import useSWR from 'swr';

export type GitLogItem = {
  dateFormatted: string;
  shortMessage: string;
  fullMessage: string;
  author: string;
  commiter: string;
  ageFormatted: string;
};

export type GitLog = {
  currentBranch: string;
  lastCommit: GitLogItem;
  commits: GitLogItem[];
};

export function useGitLog() {
  return useSWR('/git/log', (url) => clientPost<GitLog>({ url }));
}
