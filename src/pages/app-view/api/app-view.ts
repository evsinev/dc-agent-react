import { clientPost } from '@/libs/client-post';
import { useEffect } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

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
  return useSWR(`/app/view/${params.appName}`, (url) => clientPost<AppViewResponse>({ url, params }));
}

export function useAppPush(params: { appName: string }) {
  const result = useSWRMutation('/app/push', (url) => clientPost<AppViewResponse>({ url, params }));

  useEffect(() => {
    if (result.data?.appName !== params.appName) {
      result.reset();
    }
  }, [params.appName, result.data?.appName]);

  return result;
}
