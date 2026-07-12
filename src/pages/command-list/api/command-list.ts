import { clientPost } from '@/libs/client-post';
import useSWR from 'swr';

export type CommandInfo = {
  host: string;
  name?: string;
  type?: string;
  error?: string;
};

export type CommandListResponse = {
  commands: CommandInfo[];
};

export function useCommandList() {
  return useSWR('/command/list', (url) => clientPost<CommandListResponse>({ url }));
}
