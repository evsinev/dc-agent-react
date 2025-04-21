import { remoteSend } from '@/remote/remote-send';
import { ServiceListItem } from '@/remote/remote-service-list';

type ServiceViewRequest = {
  fqsn: string;
};

type ServiceViewResponse = {
  service: ServiceListItem;
  runContent: string;
  logRunContent: string;
  lastLogLines: string;
  canHangup: boolean;
  canTerminate: boolean;
  canUp: boolean;
  canDown: boolean;
};

export async function remoteServiceView(request: ServiceViewRequest): Promise<ServiceViewResponse> {
  return remoteSend({ path: `/service/view/${request.fqsn}`, request });
}
