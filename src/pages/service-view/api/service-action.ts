import { RequestError } from '@/components/error/models/error-model';
import { clientPost } from '@/libs/client-post';
import useSWRMutation from 'swr/mutation';

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
