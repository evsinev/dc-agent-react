import { remoteSend } from '@/remote/remote-send';
import { StatusIndicatorProps } from '@cloudscape-design/components/status-indicator/internal';

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

type ServiceListResponse = {
  services: ServiceListItem[];
};

export async function remoteServiceList(): Promise<ServiceListResponse> {
  return remoteSend({ path: '/service/list' });
}
