import { clientPost } from '@/libs/client-post';
import useSWRImmutable from 'swr/immutable';

export type AppListItem = {
  appName: string;
  taskName: string;
  taskHost: string;
  taskType: string;
};

type AppListResponse = {
  apps: AppListItem[];
};

export function useAppList() {
  return useSWRImmutable('/app/list', (url) => clientPost<AppListResponse>({ url }));
}
