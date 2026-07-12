import { clientPost } from '@/libs/client-post';
import useSWR from 'swr';

export type AgentStatusIndicator =
  | 'error'
  | 'warning'
  | 'success'
  | 'info'
  | 'stopped'
  | 'pending'
  | 'in-progress'
  | 'loading';

export type AgentServiceBrief = {
  serviceName: string;
  statusName: string;
  statusIndicator: AgentStatusIndicator;
};

export type AgentInfo = {
  name: string;
  url: string;

  // /app-status
  reachable: boolean;
  error?: string;
  appInstanceName?: string;
  appVersion?: string;
  hostname?: string;
  port: number;
  uptimeMs: number;
  uptimeFormatted?: string;
  responseEpoch: number;
  responseId?: string;

  // control-plane services
  servicesTotal: number;
  servicesUp: number;
  servicesError?: string;
  services?: AgentServiceBrief[];
};

export type AgentListResponse = {
  agents: AgentInfo[];
};

export function useAgentList() {
  return useSWR('/agent/list', (url) => clientPost<AgentListResponse>({ url }));
}
