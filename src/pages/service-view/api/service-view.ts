import { clientPost } from '@/libs/client-post';
import { ServiceListItem } from '@/pages/service-list/api/service-list';
import useSWR from 'swr';

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
