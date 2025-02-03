import { remoteSend } from '@/remote/remote-send';
import { ServiceListItem } from '@/remote/remote-service-list';

export type ServiceActionType = 'UP' | 'DOWN' | 'HUP' | 'TERM';

export type ServiceSendActionRequest = {
  fqsn: string;
  serviceAction: ServiceActionType;
};

export type ServiceSendActionResponse = {
};

export async function remoteServiceSendAction(request: ServiceSendActionRequest) : Promise<ServiceSendActionResponse> {
  return remoteSend({ path: `/service/send-action/${request.fqsn}/${request.serviceAction}`, request });
}
