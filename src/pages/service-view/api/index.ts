import { RequestError } from '@/components/error/models/error-model';
import { clientPost } from '@/libs/client-post';
import useSWR from 'swr';

import { ServiceListItem } from '@/remote/remote-service-list';
import useSWRMutation from 'swr/mutation';

type ServiceViewParams = {
  fqsn: string;
};

export type ServiceView = {
  service: ServiceListItem;
  runContent: string;
  logRunContent: string;
  lastLogLines: string;
  canHangup: boolean;
  canTerminate: boolean;
  canUp: boolean;
  canDown: boolean;
};

export function useServiceView(params: ServiceViewParams) {
  return useSWR(`/service/view/${params.fqsn}`, (url) => clientPost<ServiceView>({ url, params }));
}

export type ServiceActionType = 'UP' | 'DOWN' | 'HANGUP' | 'TERMINATE';

export type ServiceActionParams = {
  fqsn: string;
  serviceAction: ServiceActionType;
};

export function useServiceAction() {
  return useSWRMutation<boolean, RequestError, string, ServiceActionParams>(
    '/service/send-action/',
    (url, { arg: params }) => clientPost<boolean>({ url: `${url + params.fqsn}/${params.serviceAction}`, params }),
  );
}
