import { clientPost } from '@/libs/client-post';
import { StatusIndicatorProps } from '@cloudscape-design/components/status-indicator';
import useSWR from 'swr';

export type CommandInfo = {
  host: string;
  name?: string;
  type?: string;
  error?: string;
  // All config fields (secret api-key values are masked to owner labels on the server).
  parameters?: Record<string, string>;
  // Live state of the daemontools service named by parameters.serviceName, resolved server-side
  // (absent when the command has no serviceName or the service is not found on the agent).
  serviceStatusName?: string;
  serviceStatusIndicator?: StatusIndicatorProps.Type;
};

export type CommandListResponse = {
  commands: CommandInfo[];
};

export function useCommandList() {
  return useSWR('/command/list', (url) => clientPost<CommandListResponse>({ url }));
}
