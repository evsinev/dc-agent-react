import { clientPost } from '@/libs/client-post';
import { StatusIndicatorProps } from '@cloudscape-design/components/status-indicator/internal';
import useSWR from 'swr';

export type ServiceStateType =
  | 'UP'
  | 'DOWN'
  | 'UP_NORMALLY_DOWN'
  | 'UP_PAUSED'
  | 'UP_WANT_DOWN'
  | 'DOWN_NORMALLY_UP'
  | 'DOWN_WANT_UP'
  | 'ERROR';

export type ServiceStatus = {
  state: ServiceStateType;
  pid?: number;
  when?: string;
  superviseState?: string;
  errorMessage?: string;
};

export type ServiceListItem = {
  fqsn: string;
  host: string;
  serviceName: string;
  serviceStatus: ServiceStatus;
  statusIndicator: StatusIndicatorProps.Type;
  statusName: string;
  ageFormatted: string;
  whenFormatted: string;
};

type ServiceListResponse = {
  services: ServiceListItem[];
};

export function useServiceList() {
  return useSWR('/service/list', (url) => clientPost<ServiceListResponse>({ url }));
}
