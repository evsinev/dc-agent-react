import { remoteSend } from '@/remote/remote-send';

export type ServiceActionType = 'UP' | 'DOWN' | 'HUP' | 'TERM';

export type ServiceSendActionRequest = {
  fqsn: string;
  serviceAction: ServiceActionType;
};

export async function remoteServiceSendAction(request: ServiceSendActionRequest): Promise<object> {
  return remoteSend({ path: `/service/send-action/${request.fqsn}/${request.serviceAction}`, request });
}
