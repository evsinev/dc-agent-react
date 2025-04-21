import { RequestError } from '@/components/error/models/error-model';
import { clientPost } from '@/libs/client-post';
import useSWRImmutable from 'swr/immutable';
import useSWRMutation from 'swr/mutation';

export type AppListItem = {
  appName: string;
  taskName: string;
  taskHost: string;
  taskType: string;
};

type AppListResponse = {
  apps: AppListItem[];
};

type AppViewParams = {
  appName: string;
};

type AppViewResponse = {
  appName: string;
  taskName: string;
  taskType: string;
  taskHost: string;
  taskCheckText: string;
  taskCheckColor: string;
  jobCreatedDateFormatted: string;
  consumerKey: string;
  agentUrl: string;
};

export function useAppList() {
  return useSWRImmutable('/app/list', (url) => clientPost<AppListResponse>({ url }));
}

export function useAppView(params: AppViewParams) {
  return useSWRImmutable(['/app/view', params], ([url, swrParams]) =>
    clientPost<AppViewResponse>({ url, params: swrParams }),
  );
}

export function useAppPush() {
  return useSWRMutation<AppViewResponse, RequestError, string, AppViewParams>('/app/push', (url, { arg: params }) =>
    clientPost<AppViewResponse>({ url, params }),
  );
}
