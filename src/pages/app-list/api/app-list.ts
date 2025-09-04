import { clientPost } from '@/libs/client-post';
import useSWR from 'swr';

export type AppListItem = {
  appName: string;
  taskName: string;
  taskHost: string;
  taskType: string;
};

type AppListResponse = {
  apps: AppListItem[];
};

type AppStatusRequest = {
  appName: string;
}

type AppStatusResponse = {
  status: 'OK' | 'ERROR' | 'DRIFT';
  errorMessage: string;
}

export function useAppList() {
  return useSWR('/app/list', (url) => clientPost<AppListResponse>({ url }));
}

export function useRemoteAppStatus(aRequest: AppStatusRequest) {
  return useSWR(`/app/status/${aRequest.appName}`, (url) => clientPost<AppStatusResponse>({ url, params: aRequest }));
}
