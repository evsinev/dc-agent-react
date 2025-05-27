import { RequestError } from '@/components/error/models/error-model';
import { clientPost } from '@/libs/client-post';
import useSWRMutation from 'swr/mutation';
import useSWR from 'swr';

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

export function useAppView(params: AppViewParams) {
  return useSWR(`/app/view/${params.appName}`, (url) =>
    clientPost<AppViewResponse>({ url, params }),
  );
}

export function useAppPush() {
  return useSWRMutation<AppViewResponse, RequestError, string, AppViewParams>('/app/push', (url, { arg: params }) =>
    clientPost<AppViewResponse>({ url, params }),
  );
}
